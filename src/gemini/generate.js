import { getModel } from './client'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts'
import { fetchMultipleEndpoints } from '../espn/api'

const TIMEOUT_MS = 60_000

function withTimeout(promise, ms) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini timed out after ${ms / 1000}s`)), ms)
  )
  return Promise.race([promise, timer])
}

export async function generateFeed({ events, preferenceSummary = null, userPrompt = null }) {
  const model = getModel()
  const userMessage = buildUserPrompt(events, preferenceSummary, userPrompt)

  console.time('gemini')
  const result = await withTimeout(
    model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userMessage },
    ]),
    TIMEOUT_MS
  )
  console.timeEnd('gemini')

  const raw = result.response.text()

  let parsed
  try {
    const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    parsed = JSON.parse(clean)
  } catch (e) {
    console.error('Gemini parse failed. Raw output:', raw.slice(0, 800))
    throw new Error('Gemini returned invalid JSON — check console')
  }

  const { jsx, espnEndpoints = [], reasoning = '' } = parsed
  if (!jsx) throw new Error('Gemini returned no JSX field')

  // Cap endpoints to prevent slow fetches
  const endpoints = espnEndpoints.slice(0, 4)

  console.time('espn-fetch')
  const data = await fetchMultipleEndpoints(endpoints)
  console.timeEnd('espn-fetch')

  return { jsx, data, reasoning }
}
