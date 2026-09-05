function RepairCard({ repair, onBack, onChallenge }) {
	return (
		<article className="clinic-card repair-card">
			<div className="card-kicker">The repair</div>
			<h2>Build a better<br />mental model.</h2>
			<p>{repair.explanation}</p>
			<div className="repair-steps">
				{repair.steps.map((step, index) => <div className="repair-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>)}
			</div>
			<div className="card-actions"><button className="back-button" type="button" onClick={onBack}>Back to diagnosis</button><button className="next-button" type="button" onClick={onChallenge}>Test my understanding</button></div>
		</article>
	)
}

export default RepairCard
