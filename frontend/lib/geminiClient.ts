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

Guidelines for Scheduling:
1. Divide the task into focus sessions matching the user's focus session length preference (e.g. 45-minute blocks).
2. Avoid scheduling tasks in time ranges occupied by existing events.
3. If a task is marked as highly important (isImportant: true), you can choose to reschedule/shift existing lower-priority tasks (where isImportant is false or it is a routine category). Explain in the reasoning block why you did this (e.g., 'Shifted [Task A] to make room for [Task B] because [Task B] is highly important and due soon').
4. Return a structured JSON response. You MUST return ONLY valid JSON matching the following schema. Do NOT include markdown code blocks, just raw JSON:
{
  "reasoning": "A paragraph explaining your scheduling strategy, why you chose these slots, and any task shift rationale.",
  "proposedEvents": [
    {
      "title": "Title of the calendar event slot (e.g. Focus Block: Coding - Part 1)",
      "startTime": "ISO 8601 string of the start time (must be in the future)",
      "endTime": "ISO 8601 string of the end time",
      "description": "Details of what to do in this block",
      "shiftRequired": true or false,
      "shiftedTaskId": "The taskId of the existing task that is being shifted, if applicable",
      "shiftedTaskTitle": "The title of the existing task being shifted, if applicable"
    }
  ]
}

Database Context:
Current Local Time: ${now.toISOString()}
User Onboarding Profile: ${profileContext}
User Active Tasks: ${tasksContext}
Existing Calendar Mappings: ${calendarContext}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentKey}`;
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
  const matchingTask = tasks.find(t => lowercase.includes(t.title.toLowerCase()) || lowercase.includes(t.category.toLowerCase())) || tasks.find(t => t.progress < 100);

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
