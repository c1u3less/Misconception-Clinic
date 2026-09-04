export async function diagnoseThought(thought) {
	const response = await fetch('/api/diagnose', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ thought }),
	})

	const contentType = response.headers.get('content-type') || ''
	const payload = contentType.includes('application/json')
		? await response.json()
		: { error: 'The diagnosis server is not running. Start it with npm run server.' }
	if (!response.ok) throw new Error(payload.error || 'The clinic could not complete the diagnosis.')
	return payload
}
