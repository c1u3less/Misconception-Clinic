# Misconception Clinic
### *Fix the thinking, not just the answer.*

**Team:** CLUELESS
**Members:** [Member 1], [Member 2]
**Theme:** EdTech — Prompt Wars

---

## The Problem

Most EdTech tools tell students whether their answer is right or wrong. Very few tell them *why* their thinking led them to the wrong answer in the first place — which means the same misconception often resurfaces on the next similar question, even after correction.

## The Solution

Misconception Clinic is a diagnostic front-end tool: a student submits a question and their own answer, and instead of just marking it right or wrong, the AI diagnoses the specific reasoning gap behind a wrong answer, explains what the student *does* understand correctly, repairs the exact misconception (not the whole topic), and then tests whether the repair actually worked with a follow-up question on the same concept in a different context.

The core idea: **fixing the mental model, not just correcting the fact.**

## User Flow

1. Student enters a question and their own answer.
2. AI diagnoses the answer — correctness, what's understood correctly, the specific reasoning gap, and a misconception type.
3. Student sees a short, targeted repair explanation (not a generic re-teach of the topic).
4. AI generates a new challenge question testing the same concept in a different context, so the student can't just pattern-match the original question.
5. Student answers the challenge question.
6. AI checks whether the *original* misconception is still present or has been resolved, and gives short feedback.

This closes the loop: **Diagnose → Repair → Challenge → Recovery.**

## Key Features

- **Structured AI diagnosis** — every response is returned as strict JSON (isCorrect, misconception, misconceptionType, understands, reasoningGap, repair, challengeQuestion), so the UI renders reliably instead of parsing free-form text.
- **Misconception-specific repair** — the explanation targets the exact reasoning gap identified, not a general topic summary.
- **Non-repeatable challenge questions** — the follow-up question tests the same concept through a different surface context, so success requires genuine understanding, not memorization.
- **Recovery verification** — a second AI check confirms whether the original misconception specifically was resolved, rather than just checking if the second answer happens to be correct.
- **Input guarding** — empty or gibberish input is detected and handled without the AI inventing a false diagnosis.
- **Not styled like a chatbot** — purpose-built UI (diagnosis card, repair card, challenge card) rather than a chat interface, to reinforce that this is a diagnostic tool, not a generic AI assistant.

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API (`@google/genai`), called directly from the client — no backend, per competition constraints
- **State/persistence:** In-browser React state only (no accounts, no database)

## Prompt Engineering Approach

Two prompts drive the app end-to-end: a **Diagnosis Prompt** and a **Recovery Check Prompt**, both constrained to return strict JSON. Both went through several iterations to fix false-positive misconceptions, oversized repair text, and unhandled edge-case input.

The full prompt text and iteration history are included in the attached prompt log: `misconception-clinic-prompts.md`.

---

*Built in 4 hours for Prompt Wars — EdTech theme.*
