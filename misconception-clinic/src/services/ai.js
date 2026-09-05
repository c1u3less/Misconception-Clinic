async function postJson(path, body, apiKey = '') {
	const headers = { 'Content-Type': 'application/json' }
	if (apiKey.trim()) headers['x-gemini-api-key'] = apiKey.trim()

	const response = await fetch(path, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	})

	const contentType = response.headers.get('content-type') || ''
	const payload = contentType.includes('application/json')
		? await response.json()
		: { error: 'The diagnosis server is not running. Start it with npm run server.' }
	if (!response.ok) throw new Error(payload.error || 'The clinic could not complete the request.')
	return payload
}

export function diagnoseThought(question, studentAnswer, apiKey) {
	return postJson('/api/diagnose', { question, studentAnswer }, apiKey)
}

export function checkRecovery(details, apiKey) {
	return postJson('/api/recovery-check', details, apiKey)
}
