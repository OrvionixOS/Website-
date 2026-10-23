import { DEFAULT_DAILY_BUDGET, DEFAULT_HOURS_REMAINING, evaluate, formatHours, formatUsd } from '../lib/calculator';

const PLACEHOLDER = '—';

/** Wires the illustrative calculator UI to the pure calculation module. */
export function initCalculator(root: Document): void {
  const container = root.querySelector<HTMLElement>('[data-calculator]');
  if (!container) return;

  const form = container.querySelector<HTMLFormElement>('[data-calc-form]');
  const budgetInput = container.querySelector<HTMLInputElement>('[data-calc-budget]');
  const hoursInput = container.querySelector<HTMLInputElement>('[data-calc-hours]');
  const hoursRange = container.querySelector<HTMLInputElement>('[data-calc-hours-range]');
  const resetButton = container.querySelector<HTMLButtonElement>('[data-calc-reset]');
  const status = container.querySelector<HTMLElement>('[data-calc-status]');
  const results = container.querySelector<HTMLElement>('[data-calc-results]');
  if (!form || !budgetInput || !hoursInput || !hoursRange || !results) return;

  const out = (key: string) => container.querySelector<HTMLElement>(`[data-out="${key}"]`);
  const outputs = {
    budget: out('budget'),
    hours: out('hours'),
    pas: out('pas'),
    fee: out('fee'),
    remaining: out('remaining'),
  };

  const setError = (field: 'budget' | 'hours', input: HTMLInputElement, message?: string) => {
    const error = container.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
    const wrapper = container.querySelector<HTMLElement>(`[data-field="${field}"]`);
    if (error) {
      error.textContent = message ?? '';
      error.hidden = !message;
    }
    wrapper?.classList.toggle('has-error', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  let lastAnnouncement = '';
  const announce = (message: string) => {
    if (status && message !== lastAnnouncement) {
      status.textContent = message;
      lastAnnouncement = message;
    }
  };

  const render = () => {
    const evaluation = evaluate(budgetInput.value, hoursInput.value);

    if (!evaluation.ok) {
      setError('budget', budgetInput, evaluation.budgetError);
      setError('hours', hoursInput, evaluation.hoursError);
      // Never show a valid-looking result for invalid input.
      Object.values(outputs).forEach((el) => {
        if (el) el.textContent = PLACEHOLDER;
      });
      results.classList.add('is-invalid');
      announce('Results unavailable. Correct the highlighted field to see the illustration.');
      return;
    }

    setError('budget', budgetInput);
    setError('hours', hoursInput);
    results.classList.remove('is-invalid');

    const { budget, hours, result } = evaluation;
    if (outputs.budget) outputs.budget.textContent = formatUsd(budget);
    if (outputs.hours) outputs.hours.textContent = formatHours(hours);
    if (outputs.pas) outputs.pas.textContent = formatUsd(result.protectedAdSpend);
    if (outputs.fee) outputs.fee.textContent = formatUsd(result.fee);
    if (outputs.remaining) outputs.remaining.textContent = formatUsd(result.remaining);

    // Keep the slider in step with typed values without overwriting the text field.
    hoursRange.value = String(Math.round(hours));
    hoursRange.setAttribute('aria-valuetext', `${formatHours(hours)} hours`);

    announce(
      `Protected Ad Spend ${formatUsd(result.protectedAdSpend)}. ` +
        `Illustrative fee ${formatUsd(result.fee)}. Remaining ${formatUsd(result.remaining)}.`,
    );
  };

  budgetInput.addEventListener('input', render);
  hoursInput.addEventListener('input', render);
  hoursRange.addEventListener('input', () => {
    hoursInput.value = hoursRange.value;
    render();
  });

  // Tidy the budget display on blur when it is valid (e.g. "1,250" -> "1250").
  budgetInput.addEventListener('blur', () => {
    const evaluation = evaluate(budgetInput.value, hoursInput.value);
    if (evaluation.ok) budgetInput.value = String(evaluation.budget);
  });

  // The form never submits; Enter simply keeps the user in place.
  form.addEventListener('submit', (event) => event.preventDefault());

  resetButton?.addEventListener('click', () => {
    budgetInput.value = String(DEFAULT_DAILY_BUDGET);
    hoursInput.value = String(DEFAULT_HOURS_REMAINING);
    hoursRange.value = String(DEFAULT_HOURS_REMAINING);
    render();
    budgetInput.focus();
  });

  render();
}
