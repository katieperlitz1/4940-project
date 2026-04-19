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

function parseResponse(raw) {
  // Extract ENDPOINTS line
  const endpointsMatch = raw.match(/^ENDPOINTS:\s*(.+)$/m)
  const endpoints = endpointsMatch
    ? endpointsMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : []

  // Extract REASONING line
  const reasoningMatch = raw.match(/^REASONING:\s*(.+)$/m)
  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : ''

  // Everything after "JSX:\n" is the component code
  const jsxMarker = raw.indexOf('\nJSX:\n')
  const jsx = jsxMarker !== -1 ? raw.slice(jsxMarker + 6).trim() : ''

  return { endpoints, reasoning, jsx }
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
  console.log('Gemini raw output length:', raw.length, 'chars')

  const { endpoints, reasoning, jsx } = parseResponse(raw)

  if (!jsx) {
    console.error('Could not find JSX in response. Raw:', raw.slice(0, 600))
    throw new Error('Gemini response missing JSX section')
  }

  // Cap to 4 endpoints
  const cappedEndpoints = endpoints.slice(0, 4)

  console.time('espn-fetch')
  const data = await fetchMultipleEndpoints(cappedEndpoints)
  console.timeEnd('espn-fetch')

  return { jsx, data, reasoning }
}
