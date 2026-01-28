export interface TaxInput {
  income: number;
  period: 'monthly' | 'annually';
  source: 'salary' | 'business' | 'mixed';
  cashPercentage: number;
  businessIncomePercentage?: number;
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

  let taxableIncome = annualIncome; // Default for 'salary'
  
  if (input.source === 'business') {
    // For business income, this simple estimate assumes only the non-cash portion is taxed.
    taxableIncome = annualIncome * (1 - (input.cashPercentage / 100));
  } else if (input.source === 'mixed' && input.businessIncomePercentage !== undefined) {
    const businessPortion = annualIncome * (input.businessIncomePercentage / 100);
    const salaryPortion = annualIncome - businessPortion;

    // For the business portion, assume only the non-cash part is taxed.
    const taxableBusinessIncome = businessPortion * (1 - (input.cashPercentage / 100));
      
    taxableIncome = salaryPortion + taxableBusinessIncome;
  }
  
  if (taxableIncome <= 0) {
      return {
          totalTax: 0,
          annualIncome,
          netIncome: annualIncome,
          effectiveRate: 0,
          breakdown: [{
            bandDescription: `Taxable Income`,
            taxable: 0,
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
