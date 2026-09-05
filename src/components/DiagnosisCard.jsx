function DiagnosisCard({ diagnosis, onRepair }) {
	return (
		<article className="clinic-card diagnosis-card">
			<div className="note-topline"><span className="pill">Here is the snag</span><span>just now</span></div>
			<h2>{diagnosis.title}</h2>
			<p>{diagnosis.summary}</p>
			<div className="signal">
				<span>!</span>
				<div><strong>{diagnosis.signal}</strong><small>{diagnosis.reasoningGap}</small></div>
			</div>
			<button className="next-button" type="button" onClick={onRepair}>Explore the repair</button>
		</article>
	)
}

export default DiagnosisCard
