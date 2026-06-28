import { getActiveApiKey, rotateApiKey } from "./geminiKeys";
import { Task, UserProfile } from "./types";

export interface ProposedEvent {
  title: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  description: string;
  shiftRequired: boolean;
  shiftedTaskId?: string;
  shiftedTaskTitle?: string;
}

export interface CopilotResponse {
  reasoning: string;
  proposedEvents: ProposedEvent[];
}

/**
 * Sends a message along with tasks and profile context to Gemini, returning a structured schedule and reasoning.
 * Handles key fallback rotation.
 */
export async function askCopilot(
  message: string,
  tasks: Task[],
  profile: UserProfile | null,
  calendarMappings: any[],
  retryCount = 0
): Promise<CopilotResponse> {
  const currentKey = getActiveApiKey();
  const now = new Date();

  // Format context data for Gemini
  const profileContext = profile ? JSON.stringify(profile.preferences || {}) : "No preferences configured";
  const tasksContext = JSON.stringify(
    tasks.map(t => ({
      taskId: t.id || t.taskId,
      title: t.title,
      category: t.category,
      taskType: t.taskType,
      isImportant: t.isImportant,
      progress: t.progress,
      estimatedHours: t.estimatedHours,
      deadline: t.deadline,
      riskLevel: t.riskLevel,
      riskScore: t.riskScore
    }))
  );

  const calendarContext = JSON.stringify(
    calendarMappings.map(m => ({
      taskId: m.taskId,
      scheduledBlocks: m.scheduledBlocks || [],
      status: m.status
    }))
  );

  const systemPrompt = `You are ForeSee AI Copilot, a highly intelligent productivity assistant.
You have access to the user's active tasks, focus preferences, and calendar state.
When the user asks a question (like 'How should I complete my Coding task?' or 'What should I do first today?'), your goal is to analyze the context, formulate a plan, reason about task importance and priorities, and suggest calendar focus slots.

62: Guidelines for Scheduling:
63: 1. Divide the task into focus sessions matching the user's focus session length preference (e.g. 45-minute blocks).
64: 2. Avoid scheduling tasks in time ranges occupied by existing events.
65: 3. If a task is marked as highly important (isImportant: true), you can choose to reschedule/shift existing lower-priority tasks (where isImportant is false or it is a routine category). Explain in the reasoning block why you did this (e.g., 'Shifted [Task A] to make room for [Task B] because [Task B] is highly important and due soon').
66: 4. Return a structured JSON response. You MUST return ONLY valid JSON matching the following schema. Do NOT include markdown code blocks, just raw JSON:
67: {
68:   "reasoning": "A paragraph explaining your scheduling strategy, why you chose these slots, and any task shift rationale.",
69:   "proposedEvents": [
70:     {
71:       "title": "Title of the calendar event slot (e.g. Focus Block: Coding - Part 1)",
72:       "startTime": "ISO 8601 string of the start time (must be in the future)",
73:       "endTime": "ISO 8601 string of the end time",
74:       "description": "Details of what to do in this block",
75:       "shiftRequired": true or false,
76:       "shiftedTaskId": "The taskId of the existing task that is being shifted, if applicable",
77:       "shiftedTaskTitle": "The title of the existing task being shifted, if applicable"
78:     }
79:   ]
80: }
81: 5. If the user mentions a specific task ID (e.g. task_12345) and requests to reschedule or says they are not available for it, match that ID to the corresponding task in User Active Tasks, reschedule its timing to the new requested slot, and explain this change.
82: 
83: Database Context:
84: Current Local Time: ${now.toISOString()}
85: User Onboarding Profile: ${profileContext}
86: User Active Tasks: ${tasksContext}
87: Existing Calendar Mappings: ${calendarContext}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + "\n\nUser Question: " + message }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed: CopilotResponse = JSON.parse(rawText.trim());
    return parsed;
  } catch (error) {
    console.error(`Gemini API call failed with key index ${retryCount}:`, error);

    // Rotate and retry
    if (retryCount < 2) {
      const rotated = rotateApiKey();
      if (rotated) {
        return askCopilot(message, tasks, profile, calendarMappings, retryCount + 1);
      }
    }

    // Heuristic fallback scheduling if API completely fails / network issues
    return generateFallbackMockResponse(message, tasks);
  }
}

function generateFallbackMockResponse(message: string, tasks: Task[]): CopilotResponse {
  const lowercase = message.toLowerCase();
  
  // Find which task the user might be asking about
  const matchingTask = tasks.find(t => {
    const titleMatch = t.title ? lowercase.includes(t.title.toLowerCase()) : false;
    const catMatch = t.category ? lowercase.includes(t.category.toLowerCase()) : false;
    return titleMatch || catMatch;
  }) || tasks.find(t => t.progress < 100);

  if (!matchingTask) {
    return {
      reasoning: "I analyzed your database, but you don't have any active tasks. Let's create one first!",
      proposedEvents: []
    };
  }

  const now = new Date();
  const startTime = new Date(now.getTime() + 2 * 3600 * 1000); // 2 hours from now
  const endTime = new Date(startTime.getTime() + 1.5 * 3600 * 1000); // 90 min block

  return {
    reasoning: `[OFFLINE FALLBACK] I analyzed your timeline for "${matchingTask.title}". Since it is important, I scheduled a focus block later today when your workday is typically open.`,
    proposedEvents: [
      {
        title: `Focus Block: ${matchingTask.title}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: `Structured focus session to make progress on: ${matchingTask.title}`,
        shiftRequired: false
      }
    ]
  };
}
