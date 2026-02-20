# 🪐 Lyra

## 📖 Motivation

### 1. The Current Dilemma in Education and AI

In today’s classrooms, AI is often met with suspicion. Educators worry that students will **outsource thinking** — generating essays, solving problem sets, or even writing code entirely with AI.
The immediate institutional response has often been prohibition: _ban AI outright_.

But history shows that banning tools rarely stops their use. Instead, it encourages unstructured, unguided use — which, in education, is even more dangerous.

---

A good human tutor rarely gives the solution directly. Instead, they:

- Ask guiding questions
- Offer hints
- Encourage students to verbalize their thought process

---

### 3. A Story of Origin 🪶

This project was inspired by experiences in **CS50**. In [**Visual Studio Code**](https://en.wikipedia.org/wiki/Visual_Studio_Code), there’s [**GitHub Copilot**](https://en.wikipedia.org/wiki/GitHub_Copilot) — a powerful coding assistant — and there was also the [**CS50 Rubber Duck Assistant**](https://cs50.harvard.edu/ai/2023/tools/duck/).

Despite Copilot’s technical strength and deep IDE integration, the duck was often more valuable.
If the duck hadn’t existed, students might have drifted entirely toward Copilot. But the duck’s **structured, pedagogical guidance** demonstrated a better balance: AI can coexist with classrooms — but under **educational guardrails**.

🎥 [Teaching CS50 with AI](https://youtu.be/6rAWxGAG6EI?si=VrfxKYoILtx4CGhP)

Thus, Lyra was born — as a **central AI backend** designed with _pedagogical principles_ at its core.

---

### 4. Goals of Lyra

- Encourage **verbalization of problems**, similar to [**rubber duck debugging**](https://en.wikipedia.org/wiki/Rubber_duck_debugging)
- Reduce over-reliance on direct answers
- Guide learning through hints, analogies, and Socratic questioning
- Enable scalable AI tutoring with **educational ethics at the core**
- Allow **deep customization for schools, classes, and teachers**
  - Schools can tune the system prompts to match their teaching philosophy.
  - Teachers can adjust how the AI responds — with more hints, examples, or questions.
  - Subject teachers can customize the AI’s behavior for all students in that subject.
  - Teachers can even tailor the AI for **individual students**, offering differentiated support and personalized guidance — especially helpful for students needing special attention.

This ensures Lyra **adapts to local teaching styles**, rather than enforcing a one-size-fits-all model like general-purpose AIs.

---

## 🧩 Core Components

### 1. Prompt Engineering

Crafted prompts shape how the AI thinks, ensuring it behaves like a mentor rather than a solution generator.

---

### 2. **Few-Shot Prompting**

A few curated examples guide the AI to respond in a **tutor-like**, rather than **answer-only**, style.

---

### 3. [Retrieval-Augmented Generation (RAG)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)

RAG ensures that the AI doesn’t just _guess_ answers from pre-trained data. Instead, it:

1. Looks up **relevant information** from external sources.
2. Uses that information to **generate grounded, fact-based answers**.

**Why it matters:**

- **Reduces hallucination** — fewer made-up answers.
- **Customizable** — each school, teacher, or course can feed its own notes or materials.
- **Affordable specialization** — no retraining; just add new content to the database.
- **Fast retrieval** — only the most relevant data is fetched in real time.

---

### 4. [Vector Databases](https://en.wikipedia.org/wiki/Vector_database)

A vector database stores information as **semantic embeddings (vectors)** — capturing the _meaning_ of text, not just its words.
This allows the AI to **find conceptually similar content** instantly, making answers more relevant and accurate.

---

### 5. Firebase

We use **Firebase Auth** with **Google OAuth** for secure, seamless user authentication.
**Firestore** is used for storing chat history and other user-specific data.

---

### 6. Next.js

The frontend is built using **Next.js**, **React**, **Tailwind CSS**, and **Genkit**, with deployment on **Vercel** for reliability and speed.

---

## 🧑‍🏫 Credits

Created by **Akshay K. Rooben Abraham**
[Visit Personal Website / Contact](https://akshayabraham.vercel.app/)

Mentor: **Mr. Rishikesh Babu**
📧 [cbrishikesh007@gmail.com](mailto:cbrishikesh007@gmail.com)

---

## 📊 PostHog Analytics Setup

1. Install dependencies:

```bash
npm install posthog-js
```

2. Add the following variables to `.env.local` and your hosting provider:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_WHPsiyZp0ZU0nZRKP3BR5zmvoktBQkhZshzK6rgPDX3
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

3. For Next.js `15.3+`, PostHog is initialized in `instrumentation-client.ts`.

4. Add server-side model keys for multi-provider model selection:

```bash
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

5. In a new chat, select both a subject and a model. Lyra now supports:

- ChatGPT: GPT-5 Nano, GPT-5 Mini, GPT-5.2
- Gemini: 3 Flash, 3.1 Pro
- DeepSeek: DeepSeek-V3.2 non-thinking (`deepseek-chat`) and thinking (`deepseek-reasoner`)
