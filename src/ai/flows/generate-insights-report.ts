'use server';

/**
 * @fileOverview Generates a report of insights from daily logs.
 *
 * - generateInsightsReport - A function that generates a report of insights from daily logs.
 * - GenerateInsightsReportInput - The input type for the generateInsightsReport function.
 * - GenerateInsightsReportOutput - The return type for the generateInsightsReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInsightsReportInputSchema = z.object({
  dailyLogs: z
    .string()
    .describe('A string containing the user daily logs as text.'),
});
export type GenerateInsightsReportInput = z.infer<typeof GenerateInsightsReportInputSchema>;

const GenerateInsightsReportOutputSchema = z.object({
  insights: z.string().describe('A string containing the insights generated from the daily logs.'),
});
export type GenerateInsightsReportOutput = z.infer<typeof GenerateInsightsReportOutputSchema>;

export async function generateInsightsReport(input: GenerateInsightsReportInput): Promise<GenerateInsightsReportOutput> {
  return generateInsightsReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightsReportPrompt',
  input: {schema: GenerateInsightsReportInputSchema},
  output: {schema: GenerateInsightsReportOutputSchema},
  prompt: `You are an AI assistant that analyzes daily logs and extracts meaningful insights, such as time spent on different categories and possible bottlenecks, to help the user improve their time management.

  Analyze the following daily logs and generate a report of insights:
  {{dailyLogs}}`,
});

const generateInsightsReportFlow = ai.defineFlow(
  {
    name: 'generateInsightsReportFlow',
    inputSchema: GenerateInsightsReportInputSchema,
    outputSchema: GenerateInsightsReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
