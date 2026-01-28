'use server';

/**
 * @fileOverview A flow to provide a plain-English explanation of why a user's tax liability is changing under the new tax laws.
 *
 * - explainTaxChanges - A function that handles the tax change explanation process.
 * - ExplainTaxChangesInput - The input type for the explainTaxChanges function.
 * - ExplainTaxChangesOutput - The return type for the explainTaxChanges function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTaxChangesInputSchema = z.object({
  incomeType: z.enum(['salary', 'business', 'mixed']).describe('The user\u2019s primary source of income.'),
  incomeBefore: z.number().describe('The user\u2019s income before 2026.'),
  incomeAfter: z.number().describe('The user\u2019s income after 2026.'),
  taxBefore: z.number().describe('The user\u2019s tax liability before 2026.'),
  taxAfter: z.number().describe('The user\u2019s tax liability after 2026.'),
  cashIncomePercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('The estimated percentage of income received in cash.'),
});
export type ExplainTaxChangesInput = z.infer<typeof ExplainTaxChangesInputSchema>;

const ExplainTaxChangesOutputSchema = z.object({
  explanation: z.string().describe('A plain-English explanation of why the user\u2019s tax liability is changing.'),
});
export type ExplainTaxChangesOutput = z.infer<typeof ExplainTaxChangesOutputSchema>;

export async function explainTaxChanges(input: ExplainTaxChangesInput): Promise<ExplainTaxChangesOutput> {
  return explainTaxChangesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTaxChangesPrompt',
  input: {schema: ExplainTaxChangesInputSchema},
  output: {schema: ExplainTaxChangesOutputSchema},
  prompt: `You are a tax expert explaining to a user why their tax liability is changing under the new Nigerian tax laws.

  The user's income type is: {{incomeType}}
  Their income before 2026 was: {{incomeBefore}}
  Their income after 2026 is: {{incomeAfter}}
  Their tax liability before 2026 was: {{taxBefore}}
  Their tax liability after 2026 is: {{taxAfter}}
  Their estimated cash income percentage is: {{cashIncomePercentage}}%

  Provide a short, plain-English explanation of why their tax liability is changing. Focus on the specific details of their income situation, such as income type, taxable base changes, or cash income assumptions.

  The explanation should be no more than a few sentences. Do not include policy language or legal references.
  `,
});

const explainTaxChangesFlow = ai.defineFlow(
  {
    name: 'explainTaxChangesFlow',
    inputSchema: ExplainTaxChangesInputSchema,
    outputSchema: ExplainTaxChangesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
