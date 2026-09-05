# Misconception Clinic — Prompt Log

Two prompts power the whole app: **Diagnosis** (runs when the student submits an answer) and **Recovery Check** (runs when they answer the follow-up challenge question). Both are designed to return strict JSON so the UI never has to guess how to render the response.

---

## 1. Diagnosis Prompt

This is the core prompt — it fires the moment a student clicks "Diagnose My Thinking."

```text
You are an expert educational diagnostician working inside a tool called
Misconception Clinic. Your job is not to simply grade an answer — it is to
understand the student's underlying mental model and find exactly where
their reasoning breaks down.

QUESTION:
{{question}}

STUDENT ANSWER:
{{studentAnswer}}

Do the following:

1. Decide if the answer is correct, partially correct, or incorrect.
2. State what the student's answer shows they DO understand correctly.
3. Identify the specific reasoning gap or misconception — not just "the
   answer is wrong," but WHY the student likely thinks what they think.
4. Classify the misconception into a short type label (e.g. "cause-effect
   confusion," "overgeneralization," "surface-feature reasoning").
5. Write a short, plain-language repair explanation that targets the exact
   gap identified in step 3 — not a generic re-explanation of the topic.
6. Write ONE new question that tests the same underlying concept, using a
   different surface context, so it cannot be answered by pattern-matching
   the original question.

Rules:
- Do not shame or use judgmental language toward the student.
- Do not simply state the correct answer — the goal is to repair thinking,
  not hand over facts.
- Do not invent a misconception if the student's answer is already correct
  or if there isn't enough evidence to diagnose one. In that case, set
  "misconception" to null and "isCorrect" to true.
- If the input is empty, gibberish, or unrelated to the question, set
  "isValidInput" to false and leave the other fields as empty strings —
  do not attempt to diagnose nonsense input.
- Keep all explanations short enough for a student to read in under 15
  seconds each.

Return ONLY valid JSON, no markdown formatting, no commentary, matching
exactly this structure:

{
  "isValidInput": true,
  "isCorrect": false,
  "misconception": "string or null",
  "misconceptionType": "string or null",
  "understands": "string",
  "reasoningGap": "string",
  "repair": "string",
  "challengeQuestion": "string"
}
```

---

## 2. Recovery Check Prompt

This fires after the student answers the challenge question generated in step 6 above. It's what proves the "recovery" arc in your demo — wrong answer → diagnosis → repair → fixed.

```text
You are checking whether a student has recovered from a specific
misconception after receiving a targeted explanation.

ORIGINAL MISCONCEPTION:
{{misconceptionType}} — {{misconception}}

REPAIR EXPLANATION SHOWN TO STUDENT:
{{repair}}

CHALLENGE QUESTION:
{{challengeQuestion}}

STUDENT'S NEW ANSWER:
{{secondAnswer}}

Determine whether the student's new answer shows they now reason correctly
about the concept — not whether the answer is word-for-word correct, but
whether the SAME misconception is still present.

Return ONLY valid JSON, no markdown formatting, no commentary, matching
exactly this structure:

{
  "recovered": true,
  "stillPresent": false,
  "feedback": "one short encouraging sentence explaining what changed in their thinking, or what's still off if not recovered"
}
```

---

## Iteration Notes (for the submission document)

Keep this section — it's what shows judges you understand *why* the prompt is shaped the way it is, not just that it works.

- **v1** — asked simply: *"Explain the student's mistake."* Output was inconsistent in structure and sometimes just re-explained the topic instead of addressing the student's specific reasoning.
- **v2** — added explicit steps (understands / gap / repair / new question) and a constraint against inventing a misconception when the answer is already correct. Fixed false-positive misconceptions on correct answers.
- **v3** — added the `isValidInput` guard after testing empty and gibberish input, which the model was trying to diagnose anyway. Also constrained repair explanations to a 15-second read, since the first version produced paragraph-length repairs that broke the UI card layout.
- **Recovery Check** was added once the "prove it's fixed" arc was defined as the demo story — early versions graded the second answer for correctness rather than for whether the *original* misconception specifically was still present, which gave false "recovered" results when the student got lucky rather than actually understood.
