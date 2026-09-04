import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { GoogleGenAI, Type } from '@google/genai'

if (existsSync('.env')) process.loadEnvFile()

const port = 8787
if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing. Copy .env.example to .env and add your key.')
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN },
    misconception: { type: Type.STRING },
    understands: { type: Type.STRING },
    reasoningGap: { type: Type.STRING },
    repair: { type: Type.STRING },
    repairSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    misconceptionType: { type: Type.STRING },
    challengeQuestion: { type: Type.STRING },
  },
  required: ['isCorrect', 'misconception', 'understands', 'reasoningGap', 'repair', 'repairSteps', 'misconceptionType', 'challengeQuestion'],
}

const promptFor = (thought) => `You are an expert educational diagnostician.

Analyze the student's thought below. Identify the underlying mental model, what is correct, and the specific reasoning gap. Do not shame the student or invent a misconception without evidence. Give a concise repair lesson and four short ordered steps that rebuild the concept. Create a new question testing the same concept without copying the original.

STUDENT THOUGHT:
${thought}

Return only valid JSON matching the requested schema.`

const sendJson = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(body))
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, { ok: true, configured: Boolean(process.env.GEMINI_API_KEY) })
    return
  }

  if (request.method !== 'POST' || request.url !== '/api/diagnose') {
    sendJson(response, 404, { error: 'Not found' })
    return
  }

  let body = ''
  for await (const chunk of request) body += chunk

  try {
    const { thought } = JSON.parse(body)
    if (typeof thought !== 'string' || !thought.trim()) {
      sendJson(response, 400, { error: 'A student thought is required.' })
      return
    }

    const result = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptFor(thought.trim()),
      config: { responseMimeType: 'application/json', responseSchema: diagnosisSchema },
    })
    sendJson(response, 200, JSON.parse(result.text))
  } catch (error) {
    console.error(error)
    sendJson(response, 500, { error: 'Gemini could not complete the diagnosis.' })
  }
})

server.listen(port, () => console.log(`Gemini API server listening on http://localhost:${port}`))
