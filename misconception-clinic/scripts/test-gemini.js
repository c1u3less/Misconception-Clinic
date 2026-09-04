import { GoogleGenAI } from '@google/genai'

process.loadEnvFile()

if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing from .env')

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const response = await client.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: 'Reply with exactly this JSON object: {"ok":true,"message":"Gemini connection works"}.',
  config: { responseMimeType: 'application/json' },
})

console.log(JSON.parse(response.text))
