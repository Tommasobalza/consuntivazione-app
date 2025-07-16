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
  prompt: `Sei un assistente IA che analizza i log giornalieri ed estrae spunti significativi, come il tempo trascorso in diverse categorie, la distribuzione del lavoro tra smart working e sede, e possibili colli di bottiglia, per aiutare l'utente a migliorare la gestione del tempo. L'output deve essere in italiano.

  Analizza i seguenti log giornalieri e genera un report di approfondimenti:
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
