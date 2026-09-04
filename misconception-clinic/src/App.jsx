import { useState } from 'react'
import './App.css'
import DiagnosisCard from './components/DiagnosisCard'
import RepairCard from './components/RepairCard'
import ChallengeCard from './components/ChallengeCard'

const examples = [
  'I think seasons happen because Earth gets closer to the Sun.',
  'Why does a negative number times a negative number become positive?',
  'Plants eat food from the soil through their roots.',
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
  const [thought, setThought] = useState('')
  const [status, setStatus] = useState('idle')
  const [stage, setStage] = useState('diagnosis')
  const isComplete = status === 'complete'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!thought.trim()) return
    setStatus('loading')
    window.setTimeout(() => setStatus('complete'), 650)
  }

  const chooseExample = (example) => {
    setThought(example)
    setStatus('idle')
    setStage('diagnosis')
  }

  return (
    <main className="app-shell">
      <nav className="topbar">
        <a className="brand" href="/" aria-label="Misconception Clinic home"><span className="brand-mark">+</span><span>misconception<span className="brand-accent">clinic</span></span></a>
        <div className="nav-meta"><span className="status-dot" /><span>Learning lab / 01</span><button className="avatar" type="button" aria-label="Open profile">NB</button></div>
      </nav>

      <header className="intro">
        <div className="eyebrow"><span>01</span> A kinder way to be wrong</div>
        <h1>Find the <em>knot</em><br />in your thinking.</h1>
        <p className="intro-copy">Bring a half-formed idea, a sticky question, or a confident wrong answer. We’ll gently take it apart and rebuild it.</p>
        <div className="intro-stamp" aria-hidden="true"><span>think</span><strong>↗</strong><span>again</span></div>
      </header>

      <section className="clinic-layout">
        <div className="input-column">
          <div className="section-label"><span>01</span> Your thought</div>
          <form className="thought-form" onSubmit={handleSubmit}>
            <label htmlFor="thought">What are you wondering about?</label>
            <textarea id="thought" value={thought} maxLength="280" onChange={(event) => { setThought(event.target.value); setStatus('idle') }} placeholder="I think that..." />
            <div className="form-footer"><span className="helper">{thought.length}/280</span><button className="diagnose-button" type="submit" disabled={!thought.trim() || status === 'loading'}>{status === 'loading' ? 'Looking closer...' : 'Diagnose thought'} <span>→</span></button></div>
          </form>
          <div className="examples"><span className="helper">Try an example</span>{examples.map((example) => <button type="button" key={example} onClick={() => chooseExample(example)}>{example}</button>)}</div>
        </div>

        <div className={`result-column ${isComplete ? 'is-complete' : ''}`} aria-live="polite">
          <div className="section-label"><span>02</span> Your clinic note</div>
          {!isComplete ? <div className="empty-note"><div className="note-orbit"><span>?</span></div><h2>Your diagnosis<br /><em>will appear here.</em></h2><p>No judgement. Just a clearer map of what you know, what you’re assuming, and where to look next.</p></div> : <div className="cards-stack">
            {stage === 'diagnosis' && <DiagnosisCard diagnosis={diagnosis} onRepair={() => setStage('repair')} />}
            {stage === 'repair' && <RepairCard repair={diagnosis.repair} onChallenge={() => setStage('challenge')} />}
            {stage === 'challenge' && <ChallengeCard question={diagnosis.challengeQuestion} />}
          </div>}
        </div>
      </section>

      <footer className="footer"><span>Made for curious minds.</span><span>Misconception Clinic <b>©</b> 2026</span></footer>
    </main>
  )
}

export default App
