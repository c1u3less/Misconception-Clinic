# Misconception Clinic

### *Fix the thinking, not just the answer.*

## Run Locally

Requirements: Node.js 20 or newer.

```bash
npm install
copy .env.example .env
npm run server
```

In a second terminal:

```bash
npm run dev
```

Add your Gemini API key to `.env`. The key is used only by the local Node API server and is never exposed through the React client. `npm run test:gemini` sends a minimal live request to verify the key and model access.

## Current Flow

The working prototype accepts a student thought, calls Gemini through `/api/diagnose`, and renders the returned diagnosis, repair steps, and challenge question. The challenge answer currently demonstrates the verification interaction with local feedback; AI-based challenge evaluation is the next feature to add.

Useful commands:

```bash
npm run test:gemini
npm run lint
npm run build
```

## 1. Proposed Solution

**Misconception Clinic** is an AI-powered learning assistant designed to identify and correct the underlying misconceptions behind a student's wrong answer.

Traditional educational tools often focus on whether an answer is **correct or incorrect**. However, knowing the correct answer does not necessarily mean that a student understands the concept. A student may repeatedly make the same mistake because the underlying mental model has not been corrected.

Misconception Clinic addresses this problem by analyzing **how a student arrived at an answer**, identifying the likely reasoning gap, and providing a targeted explanation designed to repair that specific misconception.

Instead of simply telling students *"the correct answer is..."*, the system asks:

> **"Why did you think this was the answer, and what needs to change in your understanding?"**

The learning process then continues with a new question that tests whether the misconception has actually been resolved.

---

## 2. How It Works

The application follows a simple learning cycle:

**Student Question + Answer**
↓
**AI analyzes the student's reasoning**
↓
**Misconception is identified**
↓
**Personalized explanation repairs the misunderstanding**
↓
**AI generates a new challenge**
↓
**Student answers again**
↓
**System evaluates whether the misconception was resolved**

This creates a **diagnose → repair → verify** learning loop rather than a simple question-and-answer interaction.

---

## 3. Key Features

### 🩺 1. Misconception Detection

The AI analyzes a student's answer and reasoning to identify the underlying conceptual misunderstanding rather than simply marking the answer as wrong.

### 🧠 2. Reasoning Analysis

The system distinguishes between different types of errors, such as conceptual misconceptions, calculation mistakes, incomplete reasoning, and terminology confusion.

### 💡 3. Personalized Concept Repair

Instead of providing a generic explanation, the AI generates a concise intervention targeted at the student's specific reasoning gap.

### 🎯 4. Adaptive Follow-up Question

The system generates a new question that tests the same underlying concept using a different context, allowing it to determine whether the student actually understands the concept.

### 📈 5. Learning Progress

The application can track recurring misconceptions and present students with a simple view of concepts that need additional attention.

### 🤖 6. Purposeful AI & Prompt Engineering

Generative AI is used as a reasoning and diagnostic layer rather than simply as a chatbot. Structured prompts guide the AI through analysis, misconception classification, intervention generation, and verification.

---

## 4. What Makes It Different

Misconception Clinic focuses on a problem that is often overlooked in digital learning:

> **A wrong answer is a symptom. The real problem is the reasoning behind it.**

Most AI learning assistants can provide an answer or explanation. Misconception Clinic goes one step further by attempting to understand **why the student made the mistake**, providing a targeted intervention, and then testing whether the student's understanding has improved.

The goal is not simply to help students get the next question right, but to help them **stop making the same mistake again**.

---

## 5. Expected Impact

Misconception Clinic aims to make AI-assisted learning more **personalized, reflective, and effective** by turning mistakes into learning opportunities.

By focusing on the reasoning behind errors, the system can help students:

* Understand concepts rather than memorize answers.
* Identify recurring weaknesses in their thinking.
* Receive targeted explanations instead of generic solutions.
* Test whether they have genuinely understood a concept.
* Become more aware of *how* they learn and make mistakes.

**Core idea:**

> **Don't just correct the answer. Diagnose the thinking. Repair the misconception. Verify the learning.**
