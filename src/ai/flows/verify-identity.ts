// This file verifies the identity of a user by checking their name and apartment number.
// It exports the VerifyIdentityInput, VerifyIdentityOutput types, and the verifyIdentity function to call the flow.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyIdentityInputSchema = z.object({
  name: z.string().describe('The name of the resident.'),
  apartmentNumber: z.string().describe('The apartment number of the resident.'),
});
export type VerifyIdentityInput = z.infer<typeof VerifyIdentityInputSchema>;

const VerifyIdentityOutputSchema = z.object({
  isValidIdentity: z.boolean().describe('Whether the provided name and apartment number match a valid resident identity.'),
  reason: z.string().describe('The reason for the identity verification result.'),
});
export type VerifyIdentityOutput = z.infer<typeof VerifyIdentityOutputSchema>;

export async function verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityOutput> {
  return verifyIdentityFlow(input);
}

const verifyIdentityPrompt = ai.definePrompt({
  name: 'verifyIdentityPrompt',
  input: {schema: VerifyIdentityInputSchema},
  output: {schema: VerifyIdentityOutputSchema},
  prompt: `You are a helpful assistant that verifies resident identities based on their name and apartment number.

You have access to a database of residents and their apartment numbers.

Given the following information, determine if the resident identity is valid.

Name: {{{name}}}
Apartment Number: {{{apartmentNumber}}}

Respond with a JSON object that contains the following fields:
- isValidIdentity: true if the identity is valid, false otherwise.
- reason: A brief explanation for why the identity is valid or invalid.

Example of a valid response:
{
  "isValidIdentity": true,
  "reason": "The provided name and apartment number match a valid resident identity."
}

Example of an invalid response:
{
  "isValidIdentity": false,
  "reason": "The provided name and apartment number do not match a valid resident identity."
}`,
});

const verifyIdentityFlow = ai.defineFlow(
  {
    name: 'verifyIdentityFlow',
    inputSchema: VerifyIdentityInputSchema,
    outputSchema: VerifyIdentityOutputSchema,
  },
  async input => {
    const {output} = await verifyIdentityPrompt(input);
    return output!;
  }
);
