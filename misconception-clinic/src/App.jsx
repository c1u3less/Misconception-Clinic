import { useEffect, useRef, useState } from 'react'
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

const demoDiagnosis = {
  title: 'Indigestible does not mean stuck',
  summary: 'You are right that gum cannot be broken down by your stomach. The part to rethink is what happens next: your digestive system can still move it along.',
  signal: 'A missing step in the story',
  reasoningGap: 'You connected “cannot digest” with “cannot leave,” but movement through the gut does not depend on digestion.',
  repair: {
    explanation: 'Your stomach does not need to dissolve something for it to move on. Muscles push food and other small things through the digestive system until they leave your body.',
    steps: ['Some things cannot be digested', 'Muscles still push them forward', 'They pass through the intestines', 'They leave the body normally'],
  },
  challengeQuestion: 'If someone swallows a small watermelon seed that cannot be digested, what will happen to it?',
  misconception: 'Indigestible means stuck',
  misconceptionType: 'Missing process step',
}

const demoDiagnoses = [
  demoDiagnosis,
  {
    title: 'Your brain is not mostly switched off',
    summary: 'The brain does not have a simple 10% on and 90% off split. Different areas work at different times, and scans show activity across the brain over the course of a day.',
    signal: 'A catchy claim treated as a measurement',
    reasoningGap: 'You took an old slogan as a precise fact, even though brain activity changes with the task.',
    repair: { explanation: 'Your brain uses many areas, but not every area works at full power at the same moment. Think of it like a team taking turns, not a room with most of the lights permanently off.', steps: ['The brain has many specialised areas', 'Different tasks use different areas', 'Activity changes over time', 'The 10% claim is a myth'] },
    challengeQuestion: 'Why might a brain scan show different areas becoming active when someone reads, moves, and remembers something?',
    misconception: 'The 10% brain myth',
    misconceptionType: 'Slogan treated as a fact',
  },
  {
    title: 'Butter does not choose the landing side',
    summary: 'Toast usually starts close to table height and rotates as it falls. The height and spin matter more than the butter changing its weight distribution.',
    signal: 'A familiar outcome given the wrong cause',
    reasoningGap: 'You blamed the heavier side, but the toast often does not have enough height to complete another turn before it lands.',
    repair: { explanation: 'Toast tips off the table and begins rotating. From a normal table height, it often makes about half a turn, which is why the buttered side can face down. A higher drop could give it more time to spin.', steps: ['Toast tips over the edge', 'It starts rotating', 'The table height limits the fall time', 'The landing side depends on the starting position and spin'] },
    challengeQuestion: 'What might change if the same slice of toast were dropped from a much taller table?',
    misconception: 'Butter makes toast fall butter-side down',
    misconceptionType: 'Surface feature used as the cause',
  },
]

function App() {
  const [question, setQuestion] = useState('')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [status, setStatus] = useState('idle')
  const [stage, setStage] = useState('diagnosis')
  const [activeDiagnosis, setActiveDiagnosis] = useState(diagnosis)
  const [error, setError] = useState('')
  const [infoOpen, setInfoOpen] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('misconception-clinic-gemini-key') || '')
  const [isDemo, setIsDemo] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const previousApiKeyRef = useRef(apiKey)
  const questionInputRef = useRef(null)
  const resultRef = useRef(null)
  const isComplete = status === 'complete'

  useEffect(() => {
    if (!isComplete || !window.matchMedia('(max-width: 700px)').matches) return

    window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [isComplete])

  useEffect(() => {
    if (!savedMessage) return undefined
    const timeoutId = window.setTimeout(() => setSavedMessage(''), 3500)
    return () => window.clearTimeout(timeoutId)
  }, [savedMessage])

  useEffect(() => {
    if (previousApiKeyRef.current && !apiKey) {
      setSavedMessage('Key cleared.')
      setInfoOpen(false)
    }
    previousApiKeyRef.current = apiKey
  }, [apiKey])

  const focusQuestionInput = () => {
    questionInputRef.current?.focus({ preventScroll: true })
    questionInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!question.trim() || !studentAnswer.trim()) return
    if (isDemo && !apiKey.trim()) {
      setStatus('complete')
      setStage('diagnosis')
      return
    }
    if (!apiKey.trim()) {
      setError('To diagnose your own question, open the info button, add your Gemini key, and save it. The example buttons work without a key.')
      setSavedMessage('Add your Gemini API key in the info popup, then try again. The examples work without a key.')
      setInfoOpen(true)
      return
    }
    setIsDemo(false)
    setStatus('loading')
    setError('')
    diagnoseThought(question, studentAnswer, apiKey)
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
    setActiveDiagnosis(demoDiagnoses[examples.indexOf(example)] || demoDiagnosis)
    setStatus('idle')
    setStage('diagnosis')
    setError('')
    setIsDemo(true)
  }

  const saveApiKey = (event) => {
    event.preventDefault()
    const key = new FormData(event.currentTarget).get('api-key').toString().trim()
    setApiKey(key)
    if (key) localStorage.setItem('misconception-clinic-gemini-key', key)
    else localStorage.removeItem('misconception-clinic-gemini-key')
    setSavedMessage(key ? 'Key saved. You can now diagnose your own question.' : 'Key cleared.')
    setInfoOpen(false)
  }

  return (
    <main className="app-shell">
      <nav className="topbar">
        <a className="brand" href="/" aria-label="Misconception Clinic home"><span className="brand-mark">+</span><span>misconception<span className="brand-accent">clinic</span></span></a>
        <div className="nav-meta"><span>Curiosity playground</span><button className="info-button" type="button" onClick={() => setInfoOpen(true)} aria-label="About Misconception Clinic"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.1" /></svg></button></div>
      </nav>

      <header className="intro">
        <div className="eyebrow">No silly questions allowed</div>
        <h1>Drop your random<br /><em>late-night thoughts.</em></h1>
        <p className="intro-copy">Bring the hot take, half-baked theory, or “wait... how does that work?” moment. We’ll untangle it together.</p>
        <button className="intro-stamp" type="button" onClick={focusQuestionInput} aria-label="Jump to the question field"><span>start</span><strong>+</strong><span>here</span></button>
      </header>

      <section className="clinic-layout">
        <div className="input-column">
          <div className="section-label">Drop it here</div>
          <form className="thought-form" onSubmit={handleSubmit}>
            <label htmlFor="question">What weird thing is on your mind?</label>
            <textarea ref={questionInputRef} id="question" value={question} maxLength="280" onChange={(event) => { setQuestion(event.target.value); setIsDemo(false); setStatus('idle') }} placeholder="Is it true that..." />
            <label className="answer-label" htmlFor="student-answer">What do you think the answer is?</label>
            <textarea id="student-answer" value={studentAnswer} maxLength="280" onChange={(event) => { setStudentAnswer(event.target.value); setIsDemo(false); setStatus('idle') }} placeholder="Okay, hear me out..." />
            <div className="form-footer"><span className="helper">{question.length + studentAnswer.length}/560</span><span className="diagnose-control" title={!apiKey.trim() && !isDemo ? 'Add your API key or try one of the examples below.' : undefined}><button className={`diagnose-button ${!apiKey.trim() && !isDemo ? 'needs-key' : ''}`} type="submit" aria-disabled={!question.trim() || !studentAnswer.trim() || status === 'loading'} disabled={!question.trim() || !studentAnswer.trim() || status === 'loading'}>{isDemo && !apiKey.trim() ? 'View demo diagnosis' : status === 'loading' ? 'Looking closer...' : 'Diagnose my thinking'}</button></span></div>
            {error && <p className="request-error" role="alert">{error}</p>}
          </form>
          <div className="examples"><span className="helper">Try one of these</span>{examples.map((example) => <button type="button" key={example.question} onClick={() => chooseExample(example)}>{example.question}</button>)}</div>
        </div>

        <div ref={resultRef} className={`result-column ${isComplete ? 'is-complete' : ''}`} aria-live="polite">
          <div className="section-label">Your aha moment</div>
          {!isComplete ? <div className="empty-note"><div className="note-orbit"><span>?</span></div><h2>Your diagnosis<br /><em>will appear here.</em></h2><p>No judgement. Just a clearer map of what you know, what you’re assuming, and where to look next.</p></div> : <div key={stage} className="cards-stack">
            {stage === 'diagnosis' && <DiagnosisCard diagnosis={activeDiagnosis} onRepair={() => setStage('repair')} />}
            {stage === 'repair' && <RepairCard repair={activeDiagnosis.repair} onBack={() => setStage('diagnosis')} onChallenge={() => setStage('challenge')} />}
            {stage === 'challenge' && <ChallengeCard question={activeDiagnosis.challengeQuestion} diagnosis={activeDiagnosis} repair={activeDiagnosis.repair} apiKey={apiKey} isDemo={isDemo} onBack={() => setStage('repair')} />}
          </div>}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand"><span className="footer-mark">+</span><div><strong>misconception<span>clinic</span></strong><small>For questions that keep bugging you.</small></div></div>
        <div className="footer-prompt"><span>Got another question?</span><strong>Put it down.</strong></div>
        <div className="footer-meta"><span>© 2026 Misconception Clinic</span><small>Built for better questions</small><div className="footer-links"><a href="./misconception-clinic-submission.md">Notes</a><a href="https://github.com/nabinbhatt/Misconception-Clinic" target="_blank" rel="noreferrer">GitHub</a></div></div>
      </footer>
      {savedMessage && <div className="saved-toast" role="status">{savedMessage}</div>}
      {infoOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInfoOpen(false) }}><section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-title"><button className="modal-close" type="button" onClick={() => setInfoOpen(false)} aria-label="Close information">×</button><p className="modal-kicker">A quick note</p><h2 id="info-title">How this place works</h2><p>Misconception Clinic helps you find the idea underneath a wrong answer, so you can fix the thinking instead of memorising a correction.</p><p>Enter a question and your answer. You will get a diagnosis, a repair, and a challenge question to prove you have got it.</p><h2>Use your own API key</h2><p>Your key stays in this browser and is sent only to this app when you ask Gemini for a diagnosis. <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer">Get one from the Gemini AI Studio <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
  width="0.85em"
  height="0.85em"
  fill="none"
  stroke="currentColor"
  strokeWidth="34"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
  <path d="M160 352L448 64M320 64H448V192" />
</svg>
</a></p><form className="key-form" onSubmit={saveApiKey}><label htmlFor="api-key">Your Gemini API key</label><input id="api-key" name="api-key" type="password" defaultValue={apiKey} placeholder="Paste your key here" autoComplete="off" /><div className="key-actions"><button className="key-save" type="submit">Save key</button><button className="key-clear" type="button" onClick={() => { setApiKey(''); localStorage.removeItem('misconception-clinic-gemini-key') }}>Clear</button></div></form><div className="author-links"><span>Built by</span><a href="https://github.com/nabinbhatt/Misconception-Clinic" target="_blank" rel="noreferrer">CLUELESS on GitHub</a><a href="./misconception-clinic-submission.md">Project notes</a></div></section></div>}
    </main>
  )
}

export default App
