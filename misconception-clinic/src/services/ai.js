export async function diagnoseThought(thought) {
	const response = await fetch('/api/diagnose', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ thought }),
	})

	const payload = await response.json()
	if (!response.ok) throw new Error(payload.error || 'The clinic could not complete the diagnosis.')
	return payload
}
