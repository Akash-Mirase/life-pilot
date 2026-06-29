const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

async function callGemini(prompt, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            if (i === retries) throw err;

            await new Promise(resolve =>
                setTimeout(resolve, 1000 * (i + 1))
            );
        }
    }
}

// ── Planner Agent ─────────────────────────────────────────────────────────
async function plannerAgent(goal) {
  const prompt = `You are an expert productivity coach and project manager. A user wants to achieve this goal:

"${goal}"

Create a detailed, actionable plan. Structure your response with:

# Goal Roadmap: ${goal}

## Overview
Brief summary of the approach and expected outcome.

## Timeline & Milestones
Break the goal into weekly or daily milestones depending on scope.

## Daily Action Plan
List specific daily tasks/habits. For each phase:
- Morning actions
- Main focus blocks
- Evening review

## Resources & Tools
Recommended resources, tools, courses, or communities.

## Success Metrics
How to measure progress week by week.

## Common Pitfalls to Avoid
3-5 common mistakes and how to avoid them.

## Quick Start (Today's Tasks)
3 things to do TODAY to start immediately.

Be specific, realistic, and motivating. Use concrete examples.`;

  return callGemini(prompt);
}

// ── Priority Agent ────────────────────────────────────────────────────────
async function priorityAgent(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [tasks];
  const prompt = `You are a productivity expert specializing in task prioritization. Analyze these tasks and provide smart prioritization advice:

Tasks:
${taskList.map((t, i) => `${i+1}. "${t.title || t}" - Priority: ${t.priority || 'unknown'}, Deadline: ${t.deadline || 'none'}, Category: ${t.category || 'general'}`).join('\n')}

Analyze using the Eisenhower Matrix (Urgent/Important) and provide:

## Priority Analysis

For each task, explain WHY it has that priority level.

## Recommended Order
List tasks in the exact order to tackle them today with reasoning.

## Time Blocking Suggestion
Suggest specific time blocks for each task (e.g., 9-10 AM: Task X).

## Quick Wins
Which tasks can be completed in under 30 minutes for momentum?

## Risk Assessment
Flag any tasks that could become critical if delayed further.

## Delegation Candidates
Any tasks that could potentially be delegated or automated?

Be concise and actionable. Focus on what creates the most value today.`;

  return callGemini(prompt);
}

// ── Procrastination Agent ─────────────────────────────────────────────────
async function procrastinationAgent(context) {
  const prompt = `You are a behavioral psychologist and productivity coach specializing in procrastination. Analyze this situation:

"${context}"

Provide a compassionate but direct analysis:

## Root Cause Analysis
What psychological factors are likely causing the procrastination? (Fear of failure, perfectionism, overwhelm, unclear next steps, etc.)

## Procrastination Pattern
Identify the specific pattern at play.

## Immediate Circuit-Breaker
One 5-minute action to break the current procrastination cycle RIGHT NOW.

## Restructured Approach
How to reframe and break down the avoided task into non-threatening micro-steps.

## Environment Design
Simple environmental changes to make starting easier.

## Accountability System
How to create external accountability for this specific situation.

## Motivation Reframe
Reframe the task in terms of personal values and long-term goals.

Be empathetic, non-judgmental, and highly practical.`;

  return callGemini(prompt);
}

// ── Rescue Agent ──────────────────────────────────────────────────────────
async function rescueAgent(situation) {
  const prompt = `You are a crisis management expert and productivity specialist. Someone needs emergency help:

SITUATION: "${situation}"

This is urgent. Provide a crisis action plan:

## ⚡ EMERGENCY ASSESSMENT
Estimate completion probability and what's realistically achievable.

## 🔥 IMMEDIATE ACTION (Next 30 minutes)
Exact steps to take RIGHT NOW. No fluff.

## ⏱️ TIME-BOXED PLAN
Hour-by-hour breakdown for the remaining time.

## ✂️ CUT LIST
What to ruthlessly eliminate, simplify, or defer without destroying the core deliverable.

## 🎯 MINIMUM VIABLE DELIVERABLE
The absolute minimum that still counts as "done" and meets the core requirement.

## 💪 ENERGY MANAGEMENT
How to maintain focus and energy under pressure (breaks, nutrition, mindset).

## 📞 COMMUNICATION STRATEGY
If needed, how to communicate the situation to stakeholders.

Be direct, decisive, and action-focused. Every word must count. No padding.`;

  return callGemini(prompt);
}

// ── Reflection Agent ──────────────────────────────────────────────────────
async function reflectionAgent(dayContext) {
  const prompt = `You are a mindful productivity coach conducting an end-of-day reflection session. Based on this context:

"${dayContext}"

Generate a thoughtful daily reflection:

## 🌟 Today's Wins
Celebrate specific accomplishments, even small ones.

## 📈 Productivity Score
Score the day 1-10 with detailed reasoning.

## 💡 Key Insights
What did you learn about yourself and your work patterns today?

## ⚠️ What Didn't Work
Honest assessment of obstacles, mistakes, or inefficiencies — without judgment.

## 🔧 One Improvement
The single most impactful change for tomorrow.

## 🌅 Tomorrow's Top 3
The three most important tasks for tomorrow, in priority order, with why.

## 💭 Evening Mindset
A brief encouraging thought to end the day with clarity.

Be warm, insightful, and specific. Avoid generic advice.`;

  return callGemini(prompt);
}

// ── Habit Agent ───────────────────────────────────────────────────────────
async function habitAgent(habits) {
  const habitsText = Array.isArray(habits)
    ? habits.map(h => `- ${h.name}: streak ${h.streak} days, completed today: ${h.completedToday}`).join('\n')
    : habits;

  const prompt = `You are a behavioral scientist specializing in habit formation. Analyze these habits:

${habitsText}

Provide personalized insights:

## 💪 Strongest Habits
Celebrate what's working and why these habits are sticking.

## ⚠️ Habits at Risk
Which habits might be on the verge of breaking and why.

## 🔗 Habit Stacking Opportunities
Suggest 2-3 specific habit stacks using existing habits as anchors.

## 📊 Pattern Analysis
What do these habits reveal about the person's priorities and work style?

## 🎯 This Week's Focus
One habit to double down on and one new micro-habit to add.

## 🌙 Evening Routine Suggestion
A 15-minute evening routine based on current habits to improve tomorrow.

Keep insights specific, science-backed, and immediately actionable.`;

  return callGemini(prompt);
}

// ── Voice/General Agent ───────────────────────────────────────────────────
async function voiceAgent(command) {
  const prompt = `You are LifePilot AI, a helpful and concise AI productivity assistant responding to a voice command. 

User command: "${command}"

Respond naturally and helpfully in 2-4 sentences max. Be conversational, warm, and direct.
If it's a task ("add task", "create reminder"), confirm what you'd create.
If it's a question about productivity/schedule, give a smart, brief answer.
If it's unclear, ask one clarifying question.

Keep response under 100 words for voice readability.`;

  return callGemini(prompt);
}

// ── Quick Suggestion ──────────────────────────────────────────────────────
async function quickSuggestion(userContext) {
  const prompt = `You are LifePilot AI. Generate a single, specific, actionable productivity tip for right now.
Context: ${userContext || 'general user starting their day'}
Response: One paragraph, max 50 words, specific and motivating. No preamble.`;

  return callGemini(prompt);
}

module.exports = {
  plannerAgent, priorityAgent, procrastinationAgent,
  rescueAgent, reflectionAgent, habitAgent,
  voiceAgent, quickSuggestion,
};
