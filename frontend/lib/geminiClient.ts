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
  subtasks: any[] = [],
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

  const subtasksContext = JSON.stringify(
    subtasks.map(s => ({
      subtaskId: s.id || s.subtaskId,
      taskId: s.taskId,
      title: s.title,
      estimatedHours: s.estimatedHours,
      isCompleted: s.isCompleted,
      startTime: s.startTime,
      endTime: s.endTime
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
5. If the user mentions a specific task ID (e.g. task_12345) and requests to reschedule or says they are not available for it, match that ID to the corresponding task in User Active Tasks, reschedule its timing to the new requested slot, and explain this change.

Database Context:
Current Local Time: ${now.toISOString()}
User Onboarding Profile: ${profileContext}
User Active Tasks: ${tasksContext}
User Active Subtasks: ${subtasksContext}
Existing Calendar Mappings: ${calendarContext}`;

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
      throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Received empty response candidate from Gemini API");
    }

    const parsed: CopilotResponse = JSON.parse(rawText.trim());
    return parsed;
  } catch (error) {
    console.error(`Gemini API call failed with key index ${retryCount}:`, error);

    // Rotate and retry
    if (retryCount < 2) {
      const rotated = rotateApiKey();
      if (rotated) {
        return askCopilot(message, tasks, profile, calendarMappings, subtasks, retryCount + 1);
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

/**
 * Decomposes a task into a structured list of subtasks with AI estimated durations.
 */
export async function generateSubtasksWithAI(
  title: string,
  category: string,
  difficulty: string,
  retryCount = 0
): Promise<Array<{ title: string; estimatedHours: number }>> {
  const currentKey = getActiveApiKey();
  const systemPrompt = `You are an expert project planner. Decompose the following task into a list of subtasks.
Provide the estimated hours required for each subtask.
The sum of subtask hours should align with typical durations (Easy: ~1-2 hours, Medium: ~3-5 hours, Hard: ~6-10 hours).
Return a JSON array of subtasks, where each subtask has "title" (string) and "estimatedHours" (number).
Do not include markdown formatting or wrapping, return raw JSON.
Example format:
[
  { "title": "Subtask Title 1", "estimatedHours": 1.5 },
  { "title": "Subtask Title 2", "estimatedHours": 2.0 }
]`;

  const prompt = `Task Title: ${title}\nCategory: ${category}\nDifficulty: ${difficulty}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\nTask:\n" + prompt }] }],
        generationConfig: { temperature: 0.25, responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini API");

    const parsed = JSON.parse(rawText.trim());
    return parsed;
  } catch (error) {
    console.error(`generateSubtasksWithAI failed, retry: ${retryCount}`, error);
    if (retryCount < 2) {
      const rotated = rotateApiKey();
      if (rotated) {
        return generateSubtasksWithAI(title, category, difficulty, retryCount + 1);
      }
    }
    // Fallback: return default subtasks based on difficulty
    const defaultHours = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 4;
    return [
      { title: `Decompose & plan: ${title}`, estimatedHours: Number((defaultHours * 0.3).toFixed(1)) || 0.5 },
      { title: `Core execution phase`, estimatedHours: Number((defaultHours * 0.5).toFixed(1)) || 1.0 },
      { title: `QA, review & submit`, estimatedHours: Number((defaultHours * 0.2).toFixed(1)) || 0.5 }
    ];
  }
}

/**
 * Automatically schedules new subtasks in optimal, non-overlapping future calendar slots.
 */
export async function scheduleSubtasksWithGemini(
  taskTitle: string,
  deadline: string,
  subtasks: Array<{ title: string; estimatedHours: number }>,
  existingTasks: Task[],
  profile: UserProfile | null,
  calendarMappings: any[],
  retryCount = 0
): Promise<Array<{ title: string; startTime: string; endTime: string }>> {
  const currentKey = getActiveApiKey();
  const now = new Date();

  const profileContext = profile ? JSON.stringify(profile.preferences || {}) : "No preferences configured";
  const tasksContext = JSON.stringify(
    existingTasks.map((t: any) => ({
      title: t.title,
      progress: t.progress,
      deadline: t.deadline,
      scheduledTime: t.scheduledTime
    }))
  );
  
  const mappingsContext = JSON.stringify(
    calendarMappings.map(m => ({
      scheduledBlocks: m.scheduledBlocks || []
    }))
  );

  const systemPrompt = `You are an AI Smart Calendar Scheduler.
Your job is to allocate future focus slots (start and end times) for each of the new subtasks of a main task.
Guidelines:
1. Schedule each subtask in a separate block in the future (relative to Current Local Time: ${now.toISOString()}).
2. The end time of the final subtask must be before the main task deadline: ${deadline}.
3. Respect the user's focus style preferences (e.g. workStart, workEnd, deepWorkHours). Try to schedule subtasks inside preferred work hours.
4. Avoid overlapping with already scheduled blocks.
5. Return a JSON array matching this format. Do not return markdown wrapping, just raw JSON:
[
  {
    "title": "Subtask Title (same as input)",
    "startTime": "ISO 8601 String",
    "endTime": "ISO 8601 String"
  }
]`;

  const prompt = `New Task: ${taskTitle}
Deadline: ${deadline}
Subtasks to Schedule:
${JSON.stringify(subtasks)}

User Preferences: ${profileContext}
Existing Active Task Deadlines/Schedules: ${tasksContext}
Existing Calendar Mappings: ${mappingsContext}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\nPrompt:\n" + prompt }] }],
        generationConfig: { temperature: 0.25, responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini API");

    const parsed = JSON.parse(rawText.trim());
    return parsed;
  } catch (error) {
    console.error(`scheduleSubtasksWithGemini failed, retry: ${retryCount}`, error);
    if (retryCount < 2) {
      const rotated = rotateApiKey();
      if (rotated) {
        return scheduleSubtasksWithGemini(taskTitle, deadline, subtasks, existingTasks, profile, calendarMappings, retryCount + 1);
      }
    }
    // Fallback: Schedule sequentially starting 2 hours from now
    let cursor = new Date(now.getTime() + 2 * 3600 * 1000);
    return subtasks.map(subtask => {
      const start = new Date(cursor);
      const end = new Date(start.getTime() + subtask.estimatedHours * 3600 * 1000);
      
      // Shift cursor for the next subtask to avoid overlap
      cursor = new Date(end.getTime() + 1 * 3600 * 1000);

      return {
        title: subtask.title,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };
    });
  }
}

export interface RescueStrategyShift {
  subtaskId: string;
  subtaskTitle: string;
  taskTitle: string;
  beforeStart: string;
  afterStart: string;
  afterEnd: string;
}

export interface GeminiRescuePlan {
  strategies: Array<{
    name: "Focused Sprint" | "Scope Compression" | "Emergency Rescue";
    description: string;
    predictedSuccessProbability: number;
    dailyWorkSchedule: Array<{ date: string; hours: number }>;
    requiredEffortIncreasePercent: number;
    tradeOffs: string[];
    confidenceScore: number;
    estimatedStressImpact: "low" | "medium" | "high";
    expectedCompletionDate: string;
    finalRecommendation: boolean;
    shifts: RescueStrategyShift[]; // Detailed subtask reschedules to apply
  }>;
}

/**
 * Generates an intelligent AI-driven rescue plan, shifting non-important tasks to free up slots for the critical task.
 */
export async function generateRescuePlanWithAI(
  criticalTask: Task,
  criticalSubtasks: any[],
  allTasks: Task[],
  allSubtasks: any[],
  profile: UserProfile | null,
  calendarMappings: any[],
  retryCount = 0
): Promise<GeminiRescuePlan> {
  const currentKey = getActiveApiKey();
  const now = new Date();

  const profileContext = profile ? JSON.stringify(profile.preferences || {}) : "No preferences configured";
  
  const activeTasksContext = JSON.stringify(
    allTasks.map(t => ({
      taskId: t.id || t.taskId,
      title: t.title,
      isImportant: t.isImportant,
      deadline: t.deadline,
      progress: t.progress
    }))
  );

  const activeSubtasksContext = JSON.stringify(
    allSubtasks.map(s => ({
      subtaskId: s.id || s.subtaskId,
      taskId: s.taskId,
      title: s.title,
      estimatedHours: s.estimatedHours,
      isCompleted: s.isCompleted,
      startTime: s.startTime,
      endTime: s.endTime
    }))
  );

  const systemPrompt = `You are a Productivity Optimizer and Rescue Engine.
The user has a critical/endangered task: "${criticalTask.title}" which needs rescue.
Generate three distinct rescue strategies:
1. "Focused Sprint": Shift non-important tasks (where isImportant is false) that are scheduled today/tomorrow to future free slots, to clear today's focus hours for this critical task.
2. "Scope Compression": Defer some subtasks or reduce their scope.
3. "Emergency Rescue": Lock calendar, notify buddy, push everything non-essential out.

You MUST identify all subtasks of other tasks that are NOT important (isImportant === false) and need to be shifted, and return their new rescheduled start/end times.
Return a valid JSON document matching this schema:
{
  "strategies": [
    {
      "name": "Focused Sprint" or "Scope Compression" or "Emergency Rescue",
      "description": "Short explanation",
      "predictedSuccessProbability": 0-100,
      "dailyWorkSchedule": [ { "date": "YYYY-MM-DD", "hours": number } ],
      "requiredEffortIncreasePercent": number,
      "tradeOffs": [ "string" ],
      "confidenceScore": 0-100,
      "estimatedStressImpact": "low" or "medium" or "high",
      "expectedCompletionDate": "ISO String",
      "finalRecommendation": true or false,
      "shifts": [
        {
          "subtaskId": "ID of the subtask being shifted",
          "subtaskTitle": "Title of the subtask",
          "taskTitle": "Title of its parent task",
          "beforeStart": "Previous start ISO string",
          "afterStart": "New start ISO string",
          "afterEnd": "New end ISO string"
        }
      ]
    }
  ]
}`;

  const prompt = `Critical Task: ${JSON.stringify(criticalTask)}
Critical Task Subtasks: ${JSON.stringify(criticalSubtasks)}
All User Active Tasks: ${activeTasksContext}
All User Subtasks: ${activeSubtasksContext}
User Profile: ${profileContext}
Current Time: ${now.toISOString()}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt + "\n\nPrompt:\n" + prompt }] }],
        generationConfig: { temperature: 0.25, responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini API");

    const parsed = JSON.parse(rawText.trim());
    return parsed;
  } catch (error) {
    console.error("Rescue plan generation failed, retry index: " + retryCount, error);
    if (retryCount < 2) {
      const rotated = rotateApiKey();
      if (rotated) {
        return generateRescuePlanWithAI(criticalTask, criticalSubtasks, allTasks, allSubtasks, profile, calendarMappings, retryCount + 1);
      }
    }
    // Fallback Mock Rescue Plan matching the schema
    return generateFallbackRescuePlan(criticalTask, criticalSubtasks);
  }
}

function generateFallbackRescuePlan(task: Task, subtasks: any[]): GeminiRescuePlan {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const totalHours = subtasks.reduce((sum, s) => sum + s.estimatedHours, 0);

  return {
    strategies: [
      {
        name: "Focused Sprint",
        description: "[FALLBACK] Clear non-essential tasks to focus on this deadline.",
        predictedSuccessProbability: 80,
        dailyWorkSchedule: [{ date: dateStr, hours: totalHours }],
        requiredEffortIncreasePercent: 20,
        tradeOffs: ["Delays low-priority work"],
        confidenceScore: 85,
        estimatedStressImpact: "medium",
        expectedCompletionDate: task.deadline,
        finalRecommendation: true,
        shifts: []
      },
      {
        name: "Scope Compression",
        description: "[FALLBACK] Minimize effort on secondary subtasks.",
        predictedSuccessProbability: 75,
        dailyWorkSchedule: [{ date: dateStr, hours: totalHours * 0.7 }],
        requiredEffortIncreasePercent: 0,
        tradeOffs: ["Reduces draft details"],
        confidenceScore: 78,
        estimatedStressImpact: "low",
        expectedCompletionDate: task.deadline,
        finalRecommendation: false,
        shifts: []
      },
      {
        name: "Emergency Rescue",
        description: "[FALLBACK] Halt all other scheduling to finish today.",
        predictedSuccessProbability: 90,
        dailyWorkSchedule: [{ date: dateStr, hours: totalHours }],
        requiredEffortIncreasePercent: 40,
        tradeOffs: ["High stress", "Postpones all other tasks"],
        confidenceScore: 90,
        estimatedStressImpact: "high",
        expectedCompletionDate: task.deadline,
        finalRecommendation: false,
        shifts: []
      }
    ]
  };
}
