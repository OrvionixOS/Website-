/**
 * Illustrative Protected Ad Spend calculator.
 *
 * This is the single source of truth for the public, simplified calculation
 * shown on the marketing site. It is NOT a billing engine and must never be
 * used to calculate customer invoices. Actual Protected Ad Spend and fees are
 * determined under the Terms of Service.
 *
 * Formula (from the approved master prompt):
 *   Protected Ad Spend = (Daily Budget ÷ 24) × Hours Remaining
 *   Orvionix OS Fee    = Protected Ad Spend × 25%
 *   Remaining Amount   = Protected Ad Spend − Orvionix OS Fee
 *
 * All values are calculated at full precision; rounding happens only when
 * formatting for display (see formatUsd).
 */

export const FEE_RATE = 0.25;
export const HOURS_IN_PERIOD = 24;
export const MIN_HOURS = 0;
export const MAX_HOURS = 24;
/** Upper bound that keeps inputs within a sane, display-safe range. */
export const MAX_DAILY_BUDGET = 1_000_000_000;

export const DEFAULT_DAILY_BUDGET = 100;
export const DEFAULT_HOURS_REMAINING = 6;

export interface CalculationResult {
  protectedAdSpend: number;
  fee: number;
  remaining: number;
}

export type ParseResult = { ok: true; value: number } | { ok: false; error: string };

// Plain decimal number: digits with an optional fractional part (or a leading ".5").
const DECIMAL_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d+)$/;

function normalize(raw: string): string {
  // Accept common money formatting: "$1,250.00", " 100 ".
  return raw.trim().replace(/^\$/, '').replace(/,/g, '').trim();
}

function decimalPlaces(value: string): number {
  const dot = value.indexOf('.');
  return dot === -1 ? 0 : value.length - dot - 1;
}

export function parseDailyBudget(raw: string): ParseResult {
  const value = normalize(raw);
  if (value === '') {
    return { ok: false, error: 'Enter a daily budget, for example 100.' };
  }
  if (value.startsWith('-')) {
    return { ok: false, error: 'Daily budget cannot be negative.' };
  }
  if (!DECIMAL_PATTERN.test(value)) {
    return { ok: false, error: 'Enter the daily budget as a number, for example 250 or 250.50.' };
  }
  if (decimalPlaces(value) > 2) {
    return { ok: false, error: 'Use no more than two decimal places (cents).' };
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return { ok: false, error: 'Enter the daily budget as a number, for example 250 or 250.50.' };
  }
  if (amount > MAX_DAILY_BUDGET) {
    return { ok: false, error: 'Enter a daily budget of $1,000,000,000 or less.' };
  }
  return { ok: true, value: amount };
}

export function parseHoursRemaining(raw: string): ParseResult {
  const value = raw.trim();
  if (value === '') {
    return { ok: false, error: 'Enter the hours remaining, from 0 to 24.' };
  }
  if (value.startsWith('-')) {
    return { ok: false, error: 'Hours remaining cannot be negative. Enter a value from 0 to 24.' };
  }
  if (!DECIMAL_PATTERN.test(value)) {
    return { ok: false, error: 'Enter hours remaining as a number from 0 to 24.' };
  }
  if (decimalPlaces(value) > 2) {
    return { ok: false, error: 'Use no more than two decimal places for hours.' };
  }
  const hours = Number(value);
  if (!Number.isFinite(hours) || hours < MIN_HOURS || hours > MAX_HOURS) {
    return { ok: false, error: 'Hours remaining must be between 0 and 24.' };
  }
  return { ok: true, value: hours };
}

/**
 * Pure calculation. Inputs are expected to be already validated; invalid
 * numbers throw rather than produce a misleading result.
 */
export function calculate(dailyBudget: number, hoursRemaining: number): CalculationResult {
  if (!Number.isFinite(dailyBudget) || dailyBudget < 0 || dailyBudget > MAX_DAILY_BUDGET) {
    throw new RangeError('dailyBudget must be a finite number between 0 and MAX_DAILY_BUDGET');
  }
  if (!Number.isFinite(hoursRemaining) || hoursRemaining < MIN_HOURS || hoursRemaining > MAX_HOURS) {
    throw new RangeError('hoursRemaining must be a finite number between 0 and 24');
  }
  const protectedAdSpend = (dailyBudget / HOURS_IN_PERIOD) * hoursRemaining;
  const fee = protectedAdSpend * FEE_RATE;
  const remaining = protectedAdSpend - fee;
  return { protectedAdSpend, fee, remaining };
}

/** Parses both raw inputs and calculates, or returns per-field errors. */
export function evaluate(
  rawBudget: string,
  rawHours: string,
):
  | { ok: true; budget: number; hours: number; result: CalculationResult }
  | { ok: false; budgetError?: string; hoursError?: string } {
  const budget = parseDailyBudget(rawBudget);
  const hours = parseHoursRemaining(rawHours);
  if (budget.ok && hours.ok) {
    return { ok: true, budget: budget.value, hours: hours.value, result: calculate(budget.value, hours.value) };
  }
  return {
    ok: false,
    budgetError: budget.ok ? undefined : budget.error,
    hoursError: hours.ok ? undefined : hours.error,
  };
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Display-only rounding to two decimal places. */
export function formatUsd(value: number): string {
  // Avoid rendering "-$0.00" for values that round to zero.
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return usd.format(Object.is(rounded, -0) ? 0 : rounded);
}

export function formatHours(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}
