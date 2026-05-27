import { streamText } from 'ai'

// Simple demo script to exercise Vercel AI Gateway via AI SDK
// Assumes environment is provided via .env.local (e.g., VERCEL_OIDC_TOKEN)

const result = streamText({
  model: 'openai/gpt-5.5',
  prompt: 'Explain quantum computing in simple terms.',
})

for await (const chunk of result.textStream) {
  process.stdout.write(chunk)
}
