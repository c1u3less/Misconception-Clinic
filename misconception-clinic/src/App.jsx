import { useState } from 'react'
import './App.css'
import DiagnosisCard from './components/DiagnosisCard'
import RepairCard from './components/RepairCard'
import ChallengeCard from './components/ChallengeCard'
import { diagnoseThought } from './services/ai'

const examples = [
  { question: 'Does swallowing gum really stay for seven years?', answer: 'I heard your stomach cannot digest it, so it gets stuck there.' },
  { question: 'Do we really use only 10% of our brains?', answer: 'Most of our brain seems inactive, so we must only use a small part.' },
  { question: 'Why does toast always land butter-side down?', answer: 'The butter makes that side heavier, so it falls down first.' },
]

const diagnosis = {
  title: 'Distance is not the culprit',
  summary: 'Earth’s orbit is nearly circular. The seasons come from the tilt of Earth’s axis, which changes the angle and length of sunlight in each hemisphere.',
  signal: 'Cause and effect mix-up',
  reasoningGap: 'You connected two ideas that often travel together, but are not the same cause.',
  repair: {
    explanation: 'The seasons are not caused by Earth moving dramatically closer to the Sun. They come from the tilt of Earth’s axis, which changes how directly sunlight reaches each hemisphere.',
    steps: ['Earth’s axis is tilted', 'Tilt changes sunlight angle', 'Sunlight angle changes heating', 'Heating creates the seasons'],
  },
  challengeQuestion: 'Australia has summer in December while Canada has winter. How does Earth’s tilt explain this?',
}

function App() {
  const [question, setQuestion] = useState('')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [status, setStatus] = useState('idle')
  const [stage, setStage] = useState('diagnosis')
  const [activeDiagnosis, setActiveDiagnosis] = useState(diagnosis)
  const [error, setError] = useState('')
  const isComplete = status === 'complete'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!question.trim() || !studentAnswer.trim()) return
    setStatus('loading')
    setError('')
    diagnoseThought(question, studentAnswer)
      .then((result) => {
        setActiveDiagnosis({
          title: result.misconception || 'A reasoning pattern to revisit',
          summary: result.understands || result.repair,
          signal: result.misconceptionType || 'Reasoning gap',
          reasoningGap: result.reasoningGap,
          repair: { explanation: result.repair, steps: [result.understands, result.reasoningGap, result.repair] },
          challengeQuestion: result.challengeQuestion,
          misconception: result.misconception,
          misconceptionType: result.misconceptionType,
        })
        setStage('diagnosis')
        setStatus('complete')
      })
      .catch((requestError) => {
        setError(requestError.message)
        setStatus('idle')
      })
  }

  const chooseExample = (example) => {
    setQuestion(example.question)
    setStudentAnswer(example.answer)
    setStatus('idle')
    setStage('diagnosis')
    setError('')
  }

  return (
    <main className="app-shell">
      <nav className="topbar">
        <a className="brand" href="/" aria-label="Misconception Clinic home"><span className="brand-mark">+</span><span>misconception<span className="brand-accent">clinic</span></span></a>
        <div className="nav-meta"><span className="status-dot" /><span>Curiosity playground / 01</span><button className="avatar" type="button" aria-label="Open profile">NB</button></div>
      </nav>

      <header className="intro">
        <div className="eyebrow"><span>01</span> No silly questions allowed</div>
        <h1>Drop your random<br /><em>late-night thoughts.</em></h1>
        <p className="intro-copy">Bring the hot take, half-baked theory, or “wait... how does that work?” moment. We’ll untangle it together.</p>
        <div className="intro-stamp" aria-hidden="true"><span>ask</span><strong>↗</strong><span>away</span></div>
      </header>

      <section className="clinic-layout">
        <div className="input-column">
          <div className="section-label"><span>01</span> Drop it here</div>
          <form className="thought-form" onSubmit={handleSubmit}>
            <label htmlFor="question">What weird thing is on your mind?</label>
            <textarea id="question" value={question} maxLength="280" onChange={(event) => { setQuestion(event.target.value); setStatus('idle') }} placeholder="Is it true that..." />
            <label className="answer-label" htmlFor="student-answer">What do you think the answer is?</label>
            <textarea id="student-answer" value={studentAnswer} maxLength="280" onChange={(event) => { setStudentAnswer(event.target.value); setStatus('idle') }} placeholder="Okay, hear me out..." />
            <div className="form-footer"><span className="helper">{question.length + studentAnswer.length}/560</span><button className="diagnose-button" type="submit" disabled={!question.trim() || !studentAnswer.trim() || status === 'loading'}>{status === 'loading' ? 'Looking closer...' : 'Diagnose my thinking'} <span>→</span></button></div>
            {error && <p className="request-error" role="alert">{error}</p>}
          </form>
          <div className="examples"><span className="helper">Pick a curious myth</span>{examples.map((example) => <button type="button" key={example.question} onClick={() => chooseExample(example)}>{example.question}</button>)}</div>
        </div>

        <div className={`result-column ${isComplete ? 'is-complete' : ''}`} aria-live="polite">
          <div className="section-label"><span>02</span> Your aha moment</div>
          {!isComplete ? <div className="empty-note"><div className="note-orbit"><span>?</span></div><h2>Your diagnosis<br /><em>will appear here.</em></h2><p>No judgement. Just a clearer map of what you know, what you’re assuming, and where to look next.</p></div> : <div className="cards-stack">
            {stage === 'diagnosis' && <DiagnosisCard diagnosis={activeDiagnosis} onRepair={() => setStage('repair')} />}
            {stage === 'repair' && <RepairCard repair={activeDiagnosis.repair} onChallenge={() => setStage('challenge')} />}
            {stage === 'challenge' && <ChallengeCard question={activeDiagnosis.challengeQuestion} diagnosis={activeDiagnosis} repair={activeDiagnosis.repair} />}
          </div>}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand"><span className="footer-mark">+</span><div><strong>misconception<span>clinic</span></strong><small>Made for curious minds.</small></div></div>
        <div className="footer-prompt"><span>Still wondering?</span><strong>Good. Keep going.</strong></div>
        <div className="footer-meta"><span><i className="status-dot" /> playground online</span><small>© 2026 Misconception Clinic</small></div>
      </footer>
    </main>
  )
}

export default App
