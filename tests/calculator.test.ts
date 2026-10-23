import { describe, expect, it } from 'vitest';
import {
  calculate,
  evaluate,
  formatHours,
  formatUsd,
  parseDailyBudget,
  parseHoursRemaining,
} from '../src/lib/calculator';

// Independently computed expected values: PAS = budget / 24 * hours; fee = 25%; remaining = 75%.
describe('calculate', () => {
  it('matches the approved default example ($100, 6 hours)', () => {
    const r = calculate(100, 6);
    expect(r.protectedAdSpend).toBeCloseTo(25, 10);
    expect(r.fee).toBeCloseTo(6.25, 10);
    expect(r.remaining).toBeCloseTo(18.75, 10);
    expect(formatUsd(r.protectedAdSpend)).toBe('$25.00');
    expect(formatUsd(r.fee)).toBe('$6.25');
    expect(formatUsd(r.remaining)).toBe('$18.75');
  });

  it.each([
    // budget, hours, pas, fee, remaining
    [240, 4, '$40.00', '$10.00', '$30.00'],
    [1000, 12, '$500.00', '$125.00', '$375.00'],
    [500, 9, '$187.50', '$46.88', '$140.63'],
    [99.99, 1, '$4.17', '$1.04', '$3.12'],
    [50, 6.5, '$13.54', '$3.39', '$10.16'],
    [2400, 24, '$2,400.00', '$600.00', '$1,800.00'],
  ])('budget %d over %d hours', (budget, hours, pas, fee, remaining) => {
    const r = calculate(budget, hours);
    expect(formatUsd(r.protectedAdSpend)).toBe(pas);
    expect(formatUsd(r.fee)).toBe(fee);
    expect(formatUsd(r.remaining)).toBe(remaining);
  });

  it('keeps full precision and rounds only for display', () => {
    const r = calculate(100, 1);
    expect(r.protectedAdSpend).toBeCloseTo(100 / 24, 12); // 4.1666…
    expect(r.fee).toBeCloseTo(100 / 24 / 4, 12); // 1.041666…
    expect(r.fee + r.remaining).toBeCloseTo(r.protectedAdSpend, 12);
    expect(formatUsd(r.protectedAdSpend)).toBe('$4.17');
    expect(formatUsd(r.fee)).toBe('$1.04');
    expect(formatUsd(r.remaining)).toBe('$3.13');
  });

  it('handles boundaries: zero hours, full period, zero budget', () => {
    expect(calculate(100, 0)).toEqual({ protectedAdSpend: 0, fee: 0, remaining: 0 });
    expect(calculate(100, 24).protectedAdSpend).toBeCloseTo(100, 10);
    expect(calculate(0, 12)).toEqual({ protectedAdSpend: 0, fee: 0, remaining: 0 });
  });

  it('handles the maximum budget without overflow or formatting issues', () => {
    const r = calculate(1_000_000_000, 24);
    expect(formatUsd(r.protectedAdSpend)).toBe('$1,000,000,000.00');
    expect(formatUsd(r.fee)).toBe('$250,000,000.00');
  });

  it('throws instead of returning a misleading result for invalid numbers', () => {
    expect(() => calculate(-1, 6)).toThrow(RangeError);
    expect(() => calculate(100, 25)).toThrow(RangeError);
    expect(() => calculate(100, -0.5)).toThrow(RangeError);
    expect(() => calculate(Number.NaN, 6)).toThrow(RangeError);
    expect(() => calculate(Number.POSITIVE_INFINITY, 6)).toThrow(RangeError);
    expect(() => calculate(2_000_000_000, 6)).toThrow(RangeError);
  });
});

describe('parseDailyBudget', () => {
  it.each([
    ['100', 100],
    ['  250.50 ', 250.5],
    ['$1,250', 1250],
    ['$1,250.75', 1250.75],
    ['0', 0],
    ['.5', 0.5],
    ['10.', 10],
    ['1000000000', 1_000_000_000],
  ])('accepts %j', (raw, value) => {
    expect(parseDailyBudget(raw)).toEqual({ ok: true, value });
  });

  it.each([
    ['', 'Enter a daily budget'],
    ['   ', 'Enter a daily budget'],
    ['-5', 'cannot be negative'],
    ['abc', 'as a number'],
    ['1e3', 'as a number'],
    ['12.3.4', 'as a number'],
    ['Infinity', 'as a number'],
    ['NaN', 'as a number'],
    ['0x10', 'as a number'],
    ['1.005', 'two decimal places'],
    ['1000000000.01', '1,000,000,000 or less'],
    ['99999999999999999999', '1,000,000,000 or less'],
  ])('rejects %j', (raw, message) => {
    const result = parseDailyBudget(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(message);
  });
});

describe('parseHoursRemaining', () => {
  it.each([
    ['0', 0],
    ['6', 6],
    ['6.5', 6.5],
    ['24', 24],
    [' 12 ', 12],
  ])('accepts %j', (raw, value) => {
    expect(parseHoursRemaining(raw)).toEqual({ ok: true, value });
  });

  it.each([
    ['', 'Enter the hours remaining'],
    ['-1', 'cannot be negative'],
    ['24.01', 'between 0 and 24'],
    ['25', 'between 0 and 24'],
    ['six', 'as a number'],
    ['6.125', 'two decimal places'],
  ])('rejects %j', (raw, message) => {
    const result = parseHoursRemaining(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(message);
  });
});

describe('evaluate', () => {
  it('returns results for valid input', () => {
    const e = evaluate('100', '6');
    expect(e.ok).toBe(true);
    if (e.ok) expect(formatUsd(e.result.fee)).toBe('$6.25');
  });

  it('reports errors per field for partially completed input', () => {
    expect(evaluate('', '6')).toEqual({ ok: false, budgetError: expect.any(String), hoursError: undefined });
    expect(evaluate('100', '')).toEqual({ ok: false, budgetError: undefined, hoursError: expect.any(String) });
    const both = evaluate('', '');
    expect(both.ok).toBe(false);
    if (!both.ok) {
      expect(both.budgetError).toBeTruthy();
      expect(both.hoursError).toBeTruthy();
    }
  });
});

describe('formatting', () => {
  it('formats USD to two decimals and never shows negative zero', () => {
    expect(formatUsd(0)).toBe('$0.00');
    expect(formatUsd(-0)).toBe('$0.00');
    expect(formatUsd(1.005)).toBe('$1.01');
    expect(formatUsd(18.75)).toBe('$18.75');
  });

  it('formats hours without trailing zeros', () => {
    expect(formatHours(6)).toBe('6');
    expect(formatHours(6.5)).toBe('6.5');
  });
});
