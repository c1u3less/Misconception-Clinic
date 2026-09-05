import { useState } from 'react'
import { checkRecovery } from '../services/ai'

function ChallengeCard({ question, diagnosis, repair }) {
	const [answer, setAnswer] = useState('')
	const [status, setStatus] = useState('idle')
	const [feedback, setFeedback] = useState(null)
	const [error, setError] = useState('')

	const handleSubmit = (event) => {
		event.preventDefault()
		if (!answer.trim()) return
		setStatus('loading')
		setError('')
		checkRecovery({ misconceptionType: diagnosis.misconceptionType || diagnosis.signal, misconception: diagnosis.misconception || diagnosis.title, repair: repair.explanation, challengeQuestion: question, secondAnswer: answer })
			.then((result) => { setFeedback(result); setStatus('complete') })
			.catch((requestError) => { setError(requestError.message); setStatus('idle') })
	}

	return (
		<article className="clinic-card challenge-card">
			<div className="card-kicker">Try it once more</div>
			<h2>Can you spot<br /><em>the difference?</em></h2>
			<p className="challenge-question">{question}</p>
			<form onSubmit={handleSubmit}>
				<textarea aria-label="Your challenge answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setFeedback(null); setError('') }} placeholder="Show your thinking..." />
				<button className="next-button" type="submit" disabled={!answer.trim() || status === 'loading'}>{status === 'loading' ? 'Checking...' : 'Check my thinking'} <span>✓</span></button>
			</form>
			{error && <div className="challenge-feedback"><strong>One sec.</strong><span>{error}</span></div>}
			{feedback && <div className="challenge-feedback"><strong>{feedback.recovered ? 'You recovered!' : 'Still untangling it'}</strong><span>{feedback.feedback}</span></div>}
		</article>
	)
}

export default ChallengeCard
