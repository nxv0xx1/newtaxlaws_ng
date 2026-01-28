export interface TaxInput {
  income: number;
  period: 'monthly' | 'annually';
  source: 'salary' | 'business' | 'mixed';
  cashPercentage: number;
}

export interface TaxBreakdown {
  bandDescription: string;
  taxable: number;
  rate: number;
  tax: number;
}

export interface TaxCalculationResult {
  totalTax: number;
  annualIncome: number;
  netIncome: number;
  effectiveRate: number;
  breakdown: TaxBreakdown[];
}

const brackets = [
  { limit: 800000, rate: 0.0 },
  { limit: 3000000, rate: 0.15 },
  { limit: 5000000, rate: 0.18 },
  { limit: 10000000, rate: 0.21 },
  { limit: 20000000, rate: 0.23 },
  { limit: Infinity, rate: 0.25 },
];

export function calculateTaxes(input: TaxInput): TaxCalculationResult {
  const annualIncome = input.period === 'monthly' ? input.income * 12 : input.income;

  let taxableIncome = annualIncome;
  // This is a gross simplification to create a difference for business income.
  if (input.source === 'business' || input.source === 'mixed') {
    const cashPortion = annualIncome * (input.cashPercentage / 100);
    const nonCashPortion = annualIncome - cashPortion;
    // Assume only a fraction of cash income is effectively taxed.
    taxableIncome = nonCashPortion + cashPortion * 0.5; 
  }
  
  if (taxableIncome <= 0) {
      return {
          totalTax: 0,
          annualIncome,
          netIncome: annualIncome,
          effectiveRate: 0,
          breakdown: [{
            bandDescription: `First ₦${annualIncome.toLocaleString()}`,
            taxable: annualIncome,
            rate: 0,
            tax: 0
          }]
      };
  }

  let totalTax = 0;
  let remainingIncome = taxableIncome;
  let lastLimit = 0;
  const breakdown: TaxBreakdown[] = [];

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    
    const bracketSize = bracket.limit - lastLimit;
    const incomeInBracket = Math.min(remainingIncome, bracketSize);

    if (incomeInBracket > 0) {
      const taxInBracket = incomeInBracket * bracket.rate;
      totalTax += taxInBracket;

      let bandDescription = "";
      if (lastLimit === 0) {
          bandDescription = `First ₦${incomeInBracket.toLocaleString()}`;
      } else if (bracket.limit === Infinity) {
          bandDescription = `Remaining ₦${incomeInBracket.toLocaleString()}`;
      } else {
          bandDescription = `Next ₦${incomeInBracket.toLocaleString()}`;
      }

      breakdown.push({
        bandDescription,
        taxable: incomeInBracket,
        rate: bracket.rate,
        tax: taxInBracket,
      });
    }

    remainingIncome -= incomeInBracket;
    lastLimit = bracket.limit;
  }

  const netIncome = annualIncome - totalTax;
  const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;

  return { totalTax: Math.max(0, totalTax), annualIncome, netIncome, effectiveRate, breakdown };
}
