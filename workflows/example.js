import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Example multi-step AI workflow
async function aiWorkflow(input) {
  // Step 1: Extract intent
  const intentResult = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system: 'Extract the user intent as JSON: { "action": string, "subject": string }. Return only JSON.',
    messages: [{ role: 'user', content: input }],
  });

  let intent;
  try {
    intent = JSON.parse(intentResult.content[0].text);
  } catch {
    throw new Error('Failed to parse intent');
  }

  // Step 2: Generate response based on intent
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `You are a helpful assistant. The user wants to ${intent.action} about ${intent.subject}.`,
    messages: [{ role: 'user', content: input }],
  });

  return {
    intent,
    response: response.content[0].text,
    usage: {
      inputTokens: intentResult.usage.input_tokens + response.usage.input_tokens,
      outputTokens: intentResult.usage.output_tokens + response.usage.output_tokens,
    },
  };
}

// Run
const result = await aiWorkflow('Explain how neural networks learn');
console.log(JSON.stringify(result, null, 2));
