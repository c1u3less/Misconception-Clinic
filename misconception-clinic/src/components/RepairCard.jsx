function RepairCard({ repair, onChallenge }) {
	return (
		<article className="clinic-card repair-card">
			<div className="card-kicker"><span>03</span> The repair</div>
			<h2>Build a better<br /><em>mental model.</em></h2>
			<p>{repair.explanation}</p>
			<div className="repair-steps">
				{repair.steps.map((step, index) => <div className="repair-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>)}
			</div>
			<button className="next-button" type="button" onClick={onChallenge}>Test my understanding <span>→</span></button>
		</article>
	)
}

export default RepairCard
