/**
 * One-off Bedrock smoke test: Claude Sonnet via Converse API.
 * Run from repo root: npx tsx server/scripts/test-bedrock-sonnet.ts
 * Or from server/: npx tsx scripts/test-bedrock-sonnet.ts
 *
 * Requires AWS credentials (env, profile, or instance role) and Bedrock model access
 * for the inference profile below in AWS_REGION (default us-east-1).
 */
import path from 'path';
import dotenv from 'dotenv';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

for (const envPath of [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../.env')]) {
  dotenv.config({ path: envPath });
}

const region = process.env.AWS_REGION ?? 'us-east-1';
/** Cross-region inference profile (us.) — same family as noted in project docs */
const SONNET_MODEL_ID = 'us.anthropic.claude-sonnet-4-20250514-v1:0';

async function main() {
  const client = new BedrockRuntimeClient({ region });
  const prompt = 'Reply with exactly: Bedrock Sonnet OK';

  const resp = await client.send(
    new ConverseCommand({
      modelId: SONNET_MODEL_ID,
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 64, temperature: 0 },
    }),
  );

  const text = resp.output?.message?.content?.[0]?.text ?? '';
  console.log('region:', region);
  console.log('model:', SONNET_MODEL_ID);
  console.log('response:', text.trim());
}

main().catch((err) => {
  console.error('Bedrock Sonnet test failed:', err);
  process.exit(1);
});
