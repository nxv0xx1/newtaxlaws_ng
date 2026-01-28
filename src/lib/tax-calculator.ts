export interface TaxInput {
  income: number;
  period: 'monthly' | 'annually';
  source: 'salary' | 'business' | 'mixed';
  cashPercentage: number;
}

const ANNUAL_RELIEF = 200000;
const CONSOLIDATED_RELIEF_ALLOWANCE_RATE = 0.2;

// Simplified tax calculation logic
function calculate(annualIncome: number, rules: 'before' | 'after', source: 'salary' | 'business' | 'mixed', cashPercentage: number): number {
  let taxableIncome = annualIncome;

  // Before 2026: Standard deductions
  if (rules === 'before') {
    const cra = Math.max(ANNUAL_RELIEF, annualIncome * 0.01) + CONSOLIDATED_RELIEF_ALLOWANCE_RATE * annualIncome;
    taxableIncome = annualIncome - cra;
  }
  
  // After 2026: Fewer deductions, but cash income is less "visible" in our model for business
  if (rules === 'after') {
      // Model assumption: business/mixed income has some cash component that is harder to tax fully.
      // This is a gross simplification to create a difference.
      let effectiveIncome = annualIncome;
      if (source === 'business' || source === 'mixed') {
        const cashPortion = annualIncome * (cashPercentage / 100);
        const nonCashPortion = annualIncome - cashPortion;
        // Assume only a fraction of cash income is effectively taxed
        effectiveIncome = nonCashPortion + cashPortion * 0.5;
      }
      // Assuming deductions are removed for simplicity
      taxableIncome = effectiveIncome;
  }

  if (taxableIncome <= 0) return 0;
  
  let tax = 0;
  
  // Simplified progressive tax bands (common for both rules, but applied to different taxable incomes)
  if (taxableIncome > 3000000) {
    tax += (taxableIncome - 3000000) * (rules === 'before' ? 0.24 : 0.28);
    taxableIncome = 3000000;
  }
  if (taxableIncome > 1600000) {
    tax += (taxableIncome - 1600000) * (rules === 'before' ? 0.21 : 0.25);
    taxableIncome = 1600000;
  }
  if (taxableIncome > 1100000) {
    tax += (taxableIncome - 1100000) * (rules === 'before' ? 0.19 : 0.22);
    taxableIncome = 1100000;
  }
  if (taxableIncome > 500000) {
    tax += (taxableIncome - 500000) * (rules === 'before' ? 0.15 : 0.18);
    taxableIncome = 500000;
  }
  if (taxableIncome > 300000) {
    tax += (taxableIncome - 300000) * (rules === 'before' ? 0.11 : 0.14);
    taxableIncome = 300000;
  }
  tax += taxableIncome * (rules === 'before' ? 0.07 : 0.10);

  return Math.max(0, tax);
}

export function calculateTaxes(input: TaxInput): { taxBefore: number; taxAfter: number } {
  const annualIncome = input.period === 'monthly' ? input.income * 12 : input.income;

  const taxBefore = calculate(annualIncome, 'before', input.source, input.cashPercentage);
  const taxAfter = calculate(annualIncome, 'after', input.source, input.cashPercentage);

  return { taxBefore, taxAfter };
}
