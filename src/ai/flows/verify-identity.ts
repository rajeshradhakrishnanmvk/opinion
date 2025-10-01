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
  prompt: `You are a helpful assistant that verifies resident identities. For the purpose of this demo, you should always consider the identity to be valid.

Given the following information, determine if the resident identity is valid.

Name: {{{name}}}
Apartment Number: {{{apartmentNumber}}}

Always respond with a JSON object that indicates the identity is valid.

Example of a valid response:
{
  "isValidIdentity": true,
  "reason": "The provided name and apartment number match a valid resident identity."
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
