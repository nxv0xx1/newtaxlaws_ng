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
  taxableIncome: number;
  netIncome: number;
  effectiveRate: number;
  breakdown: TaxBreakdown[];
}

const newBrackets = [
  { limit: 800000, rate: 0.0 },
  { limit: 3000000, rate: 0.15 },
  { limit: 5000000, rate: 0.18 },
  { limit: 10000000, rate: 0.21 },
  { limit: 20000000, rate: 0.23 },
  { limit: Infinity, rate: 0.25 },
];

const oldBrackets = [
    { limit: 300000, rate: 0.07 },
    { limit: 600000, rate: 0.11 },
    { limit: 1100000, rate: 0.15 },
    { limit: 1600000, rate: 0.19 },
    { limit: 3200000, rate: 0.21 },
    { limit: Infinity, rate: 0.24 },
];

function getTaxableIncome(annualIncome: number, input: TaxInput): number {
    if (input.source === 'business') {
        return annualIncome * (1 - (input.cashPercentage / 100));
    }
    
    if (input.source === 'mixed' && input.businessIncomePercentage !== undefined) {
        const businessPortion = annualIncome * (input.businessIncomePercentage / 100);
        const salaryPortion = annualIncome - businessPortion;
        const taxableBusinessIncome = businessPortion * (1 - (input.cashPercentage / 100));
        return salaryPortion + taxableBusinessIncome;
    }

    // Default for 'salary'
    return annualIncome;
}

export function calculateTaxes(input: TaxInput): TaxCalculationResult {
  const annualIncome = input.period === 'monthly' ? input.income * 12 : input.income;
  const taxableIncome = getTaxableIncome(annualIncome, input);
  
  if (taxableIncome <= 0) {
      return {
          totalTax: 0,
          annualIncome,
          taxableIncome: 0,
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

  for (const bracket of newBrackets) {
    if (remainingIncome <= 0) break;
    
    const bracketSize = bracket.limit - lastLimit;
    const incomeInBracket = Math.min(remainingIncome, bracketSize);

    if (incomeInBracket > 0) {
      const taxInBracket = incomeInBracket * bracket.rate;
      totalTax += taxInBracket;

      let bandDescription = "";
      if (lastLimit === 0) {
          bandDescription = `First ₦${(lastLimit + incomeInBracket).toLocaleString()}`;
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

  return { totalTax: Math.max(0, totalTax), annualIncome, taxableIncome, netIncome, effectiveRate, breakdown };
}


export function calculateOldTaxes(input: TaxInput): TaxCalculationResult {
    const annualIncome = input.period === 'monthly' ? input.income * 12 : input.income;

    const consolidatedRelief = Math.max(200000, 0.01 * annualIncome) + 0.2 * annualIncome;
    const taxableIncome = annualIncome - consolidatedRelief;

    if (taxableIncome <= 0) {
        return {
            totalTax: 0,
            annualIncome,
            taxableIncome: 0,
            netIncome: annualIncome,
            effectiveRate: 0,
            breakdown: [{ bandDescription: 'Not taxable', taxable: 0, rate: 0, tax: 0 }]
        };
    }

    let totalTax = 0;
    let remainingIncome = taxableIncome;
    let lastLimit = 0;
    const breakdown: TaxBreakdown[] = [];

    const oldRules = [
        { upto: 300000, rate: 0.07 },
        { upto: 300000, rate: 0.11 },
        { upto: 500000, rate: 0.15 },
        { upto: 500000, rate: 0.19 },
        { upto: 1600000, rate: 0.21 },
        { upto: Infinity, rate: 0.24 },
    ];
    
    for (const rule of oldRules) {
        if (remainingIncome <= 0) break;
        const incomeInBracket = Math.min(remainingIncome, rule.upto);
        const taxInBracket = incomeInBracket * rule.rate;
        totalTax += taxInBracket;

        breakdown.push({
            bandDescription: `On ₦${incomeInBracket.toLocaleString()}`,
            taxable: incomeInBracket,
            rate: rule.rate,
            tax: taxInBracket,
        });

        remainingIncome -= incomeInBracket;
    }
    
    const netIncome = annualIncome - totalTax;
    const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;

    return { totalTax: Math.max(0, totalTax), annualIncome, taxableIncome, netIncome, effectiveRate, breakdown };
}
