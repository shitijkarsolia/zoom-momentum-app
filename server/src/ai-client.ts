import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { config } from './config.js';

const bedrock = new BedrockRuntimeClient({ region: config.aws.region });
const BEDROCK_MODEL = 'meta.llama3-70b-instruct-v1:0';

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

async function callCreateAI(prompt: string, model: string, opts?: AIOptions): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts?.timeout ?? 10000);

  try {
    const resp = await fetch(config.createAI.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.createAI.token}`,
      },
      body: JSON.stringify({ query: prompt, model }),
      signal: controller.signal,
    });

    const data = await resp.json() as { response?: string };
    if (!data.response) throw new Error(`Empty response from CREATE AI (${model})`);
    console.log(`[ai] Served by CREATE AI (${model})`);
    return data.response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callBedrock(prompt: string, opts?: AIOptions): Promise<string> {
  const resp = await bedrock.send(new ConverseCommand({
    modelId: BEDROCK_MODEL,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: {
      maxTokens: opts?.maxTokens ?? 1000,
      temperature: opts?.temperature ?? 0.7,
    },
  }));
  console.log('[ai] Served by Bedrock (Llama 3 70B)');
  return resp.output?.message?.content?.[0]?.text ?? '';
}

export async function callAI(prompt: string, opts?: AIOptions): Promise<string> {
  const hasCreateAI = config.createAI.apiUrl && config.createAI.token;

  if (hasCreateAI) {
    // Try 1: gemini-pro
    try {
      return await callCreateAI(prompt, config.createAI.primaryModel, opts);
    } catch (err: any) {
      console.warn(`[ai] ${config.createAI.primaryModel} failed:`, err.message);
    }

    // Try 2: claude-3-opus
    try {
      return await callCreateAI(prompt, config.createAI.backupModel, opts);
    } catch (err: any) {
      console.warn(`[ai] ${config.createAI.backupModel} failed, falling back to Bedrock:`, err.message);
    }
  }

  // Try 3: Bedrock
  return await callBedrock(prompt, opts);
}
