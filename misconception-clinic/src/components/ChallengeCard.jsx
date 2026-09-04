import { useState } from 'react'

function ChallengeCard({ question }) {
	const [answer, setAnswer] = useState('')
	const [submitted, setSubmitted] = useState(false)

	const handleSubmit = (event) => {
		event.preventDefault()
		if (answer.trim()) setSubmitted(true)
	}

	return (
		<article className="clinic-card challenge-card">
			<div className="card-kicker"><span>04</span> The check-up</div>
			<h2>Can you spot<br /><em>the difference?</em></h2>
			<p className="challenge-question">{question}</p>
			<form onSubmit={handleSubmit}>
				<textarea aria-label="Your challenge answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setSubmitted(false) }} placeholder="Show your thinking..." />
				<button className="next-button" type="submit" disabled={!answer.trim()}>Check my thinking <span>✓</span></button>
			</form>
			{submitted && <div className="challenge-feedback"><strong>Good instinct.</strong><span>Your explanation shows you are looking at the underlying cause, not just memorising the answer.</span></div>}
		</article>
	)
}

export default ChallengeCard
