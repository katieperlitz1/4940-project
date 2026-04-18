import { getModel } from './client'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts'
import { fetchMultipleEndpoints } from '../espn/api'

export async function generateFeed({ events, preferenceSummary = null, userPrompt = null }) {
  const model = getModel()
  const userMessage = buildUserPrompt(events, preferenceSummary, userPrompt)

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: userMessage },
  ])

  const raw = result.response.text()

  let parsed
  try {
    const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    parsed = JSON.parse(clean)
  } catch (e) {
    console.error('Gemini JSON parse failed:', raw.slice(0, 500))
    throw new Error('Gemini returned unparseable output')
  }

  const { jsx, espnEndpoints = [], reasoning = '' } = parsed

  if (!jsx) throw new Error('Gemini returned no JSX')

  // Fetch all the ESPN endpoints Gemini asked for in parallel
  const data = await fetchMultipleEndpoints(espnEndpoints)

  return { jsx, data, reasoning }
}
