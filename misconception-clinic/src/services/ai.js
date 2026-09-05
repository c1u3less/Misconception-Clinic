async function postJson(path, body) {
	const response = await fetch(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})

	const contentType = response.headers.get('content-type') || ''
	const payload = contentType.includes('application/json')
		? await response.json()
		: { error: 'The diagnosis server is not running. Start it with npm run server.' }
	if (!response.ok) throw new Error(payload.error || 'The clinic could not complete the request.')
	return payload
}

export function diagnoseThought(question, studentAnswer) {
	return postJson('/api/diagnose', { question, studentAnswer })
}

export function checkRecovery(details) {
	return postJson('/api/recovery-check', details)
}
