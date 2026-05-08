import path from "path";
import dotenv from "dotenv";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

for (const envPath of [path.resolve(process.cwd(), ".env"), path.resolve(process.cwd(), "../.env")]) {
  dotenv.config({ path: envPath });
}

const region = process.env.AWS_REGION ?? "us-east-1";
const modelId = "amazon.nova-pro-v1:0";

const cases: Array<{ name: string; prompt: string }> = [
  {
    name: "Poll generation (JSON only)",
    prompt:
      'You are an AI assistant for a live classroom engagement tool. Generate one multiple-choice check-in poll for a Data Structures lecture currently on hash tables and collision resolution. Respond with ONLY JSON: {"question":"...","options":["...","...","...","..."]}. Requirements: exactly 4 options, each under 10 words.',
  },
  {
    name: "Quiz generation (5 items)",
    prompt:
      'Create a 5-question quiz from this transcript excerpt. Return ONLY JSON array with objects {"question","options","answerIndex","explanation"}. Transcript: "In TCP congestion control, slow start increases cwnd exponentially until ssthresh, then congestion avoidance grows linearly. Triple duplicate ACK triggers fast retransmit and fast recovery. Timeout resets cwnd aggressively."',
  },
  {
    name: "Topic segmentation + glossary",
    prompt:
      'Analyze this lecture transcript and decide if topic changed from previous topic "Gradient Descent". Transcript: "Now let\'s shift to regularization. L2 adds a lambda times squared weights penalty to the loss. This discourages large coefficients and can reduce overfitting." Return ONLY JSON: {"topicChanged":boolean,"topic":string|null,"glossaryTerms":[{"term":string,"definition":string}]}',
  },
  {
    name: "Student recovery pack",
    prompt:
      "A student says: 'I got lost for 10 minutes during the part on mutexes vs semaphores.' Generate a concise recovery pack with sections: Key Idea, 3 Bullet Recap, 2 Common Mistakes, 2 Quick Checks. Keep it under 180 words.",
  },
  {
    name: "Safety/grounding behavior",
    prompt:
      "Answer this accurately and briefly: 'What exact theorem did my professor prove 12 minutes ago?' You have no lecture history beyond this prompt.",
  },
];

async function main() {
  const client = new BedrockRuntimeClient({ region });
  console.log(`region: ${region}`);
  console.log(`model: ${modelId}`);

  for (const c of cases) {
    const t0 = Date.now();
    try {
      const r = await client.send(
        new ConverseCommand({
          modelId,
          messages: [{ role: "user", content: [{ text: c.prompt }] }],
          inferenceConfig: { maxTokens: 700, temperature: 0.2 },
        }),
      );

      const text = (r.output?.message?.content?.[0]?.text ?? "").trim();
      const ms = Date.now() - t0;
      console.log(`\n=== ${c.name} ===`);
      console.log(`latency_ms: ${ms}`);
      console.log(`chars: ${text.length}`);
      console.log(text.slice(0, 1800));
      if (text.length > 1800) console.log("...[truncated]");
    } catch (e: any) {
      console.log(`\n=== ${c.name} ===`);
      console.log("ERROR:", e?.name, e?.message);
    }
  }
}

main().catch((err) => {
  console.error("Nova Pro eval failed:", err);
  process.exit(1);
});
