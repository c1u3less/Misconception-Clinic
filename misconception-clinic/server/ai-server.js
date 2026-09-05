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
    isValidInput: { type: Type.BOOLEAN },
    isCorrect: { type: Type.BOOLEAN },
    misconception: { type: Type.STRING, nullable: true },
    misconceptionType: { type: Type.STRING, nullable: true },
    understands: { type: Type.STRING },
    reasoningGap: { type: Type.STRING },
    repair: { type: Type.STRING },
    challengeQuestion: { type: Type.STRING },
  },
  required: ['isValidInput', 'isCorrect', 'misconception', 'misconceptionType', 'understands', 'reasoningGap', 'repair', 'challengeQuestion'],
}

const recoverySchema = {
  type: Type.OBJECT,
  properties: {
    recovered: { type: Type.BOOLEAN },
    stillPresent: { type: Type.BOOLEAN },
    feedback: { type: Type.STRING },
  },
  required: ['recovered', 'stillPresent', 'feedback'],
}

const diagnosisPromptFor = (question, studentAnswer) => `You are an expert educational diagnostician working inside a tool called
Misconception Clinic. Your job is not to simply grade an answer — it is to
understand the student's underlying mental model and find exactly where
their reasoning breaks down.

QUESTION:
${question}

STUDENT ANSWER:
${studentAnswer}

Do the following:
1. Decide if the answer is correct, partially correct, or incorrect.
2. State what the student's answer shows they DO understand correctly.
3. Identify the specific reasoning gap or misconception — not just "the answer is wrong," but WHY the student likely thinks what they think.
4. Classify the misconception into a short type label.
5. Write a short, plain-language repair explanation targeting the exact gap.
6. Write ONE new question testing the same concept in a different context.
7. Don't make the repair explanation or challenge question studious - make it what a 10 year old could read and understand clearly.

Rules:
- Do not shame or use judgmental language.
- Do not simply state the correct answer.
- Do not invent a misconception when the answer is correct or evidence is insufficient; use null and set isCorrect to true.
- If the input is empty, gibberish, or unrelated, set isValidInput to false and leave other fields empty strings.
- Keep explanations short enough to read in under 15 seconds.

Return ONLY valid JSON matching the requested schema.`

const recoveryPromptFor = ({ misconceptionType, misconception, repair, challengeQuestion, secondAnswer }) => `You are checking whether a student has recovered from a specific
misconception after receiving a targeted explanation.

ORIGINAL MISCONCEPTION:
${misconceptionType} — ${misconception}

REPAIR EXPLANATION SHOWN TO STUDENT:
${repair}

CHALLENGE QUESTION:
${challengeQuestion}

STUDENT'S NEW ANSWER:
${secondAnswer}

Determine whether the student's new answer shows they now reason correctly
about the concept — not whether the answer is word-for-word correct, but
whether the SAME misconception is still present.

Return ONLY valid JSON matching the requested schema.`

const sendJson = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(body))
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, { ok: true, configured: Boolean(process.env.GEMINI_API_KEY) })
    return
  }

  if (request.method !== 'POST' || !['/api/diagnose', '/api/recovery-check'].includes(request.url)) {
    sendJson(response, 404, { error: 'Not found' })
    return
  }

  let body = ''
  for await (const chunk of request) body += chunk

  try {
    const input = JSON.parse(body)
    const isDiagnosis = request.url === '/api/diagnose'
    const fields = isDiagnosis ? [input.question, input.studentAnswer] : [input.misconceptionType, input.misconception, input.repair, input.challengeQuestion, input.secondAnswer]
    if (fields.some((field) => typeof field !== 'string' || !field.trim())) {
      sendJson(response, 400, { error: isDiagnosis ? 'A question and student answer are required.' : 'Recovery check details are required.' })
      return
    }

    const result = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: isDiagnosis ? diagnosisPromptFor(input.question.trim(), input.studentAnswer.trim()) : recoveryPromptFor(input),
      config: { responseMimeType: 'application/json', responseSchema: isDiagnosis ? diagnosisSchema : recoverySchema },
    })
    const parsedResult = JSON.parse(result.text)
    if (isDiagnosis && !parsedResult.isValidInput) {
      sendJson(response, 422, { error: 'Please enter a real question and an answer so the clinic can diagnose the thinking.' })
      return
    }
    sendJson(response, 200, parsedResult)
  } catch (error) {
    console.error(error)
    sendJson(response, 500, { error: 'Gemini could not complete the diagnosis.' })
  }
})

server.listen(port, () => console.log(`Gemini API server listening on http://localhost:${port}`))
