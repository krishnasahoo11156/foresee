import { collection, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { calculateRiskAndClassification } from "./riskEngine";
import { listGoogleCalendarEvents, updateGoogleCalendarEvent } from "./googleCalendar";
import { Task, Subtask } from "./types";

/**
 * Synchronizes subtasks and calendar events bidirectionally.
 * Checks for completions in Google Calendar and updates Firestore subtasks & task progress/risk.
 * Also updates Google Calendar titles to prefix "✓ Completed: " for completed subtasks.
 */
export async function syncSubtasksAndCalendar(userId: string): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  const token = localStorage.getItem(`google_calendar_token_${userId}`);
  if (!token) {
    return { success: false, updatedCount: 0, error: "Google Calendar token not found" };
  }

  try {
    // 1. Fetch user tasks and subtasks from Firestore
    const tasksSnap = await getDocs(collection(db, "users", userId, "tasks"));
    const tasks: Task[] = [];
    tasksSnap.forEach((d) => tasks.push({ id: d.id, ...d.data() } as Task));

    const subtasksSnap = await getDocs(collection(db, "users", userId, "subtasks"));
    const subtasks: Subtask[] = [];
    subtasksSnap.forEach((d) => subtasks.push({ id: d.id, ...d.data() } as Subtask));

    // 2. Fetch events from Google Calendar (for the last 7 days)
    const timeMin = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const calEvents = await listGoogleCalendarEvents(token, timeMin);

    let updatedCount = 0;
    const affectedTaskIds = new Set<string>();

    // 3. Bidirectional Sync Loop
    for (const subtask of subtasks) {
      // Find matching calendar event by ID first, or description tag
      let matchedEvent = calEvents.find(e => e.id === subtask.calendarEventId);
      
      if (!matchedEvent && subtask.subtaskId) {
        // Fallback: match by parsing subtask ID in description
        matchedEvent = calEvents.find(e => {
          const desc = e.description || "";
          return desc.includes(`[Subtask ID: ${subtask.subtaskId}]`) || desc.includes(`[ID: ${subtask.subtaskId}]`);
        });
      }

      if (matchedEvent) {
        // Save the event ID in Firestore if it was missing
        if (!subtask.calendarEventId) {
          const subtaskRef = doc(db, "users", userId, "subtasks", subtask.id || subtask.subtaskId);
          await updateDoc(subtaskRef, { calendarEventId: matchedEvent.id });
          subtask.calendarEventId = matchedEvent.id;
        }

        const calSummary = matchedEvent.summary || "";
        const isCalCompleted = calSummary.startsWith("✓") || 
                              calSummary.toLowerCase().startsWith("completed:") || 
                              calSummary.toLowerCase().includes("[completed]") ||
                              calSummary.toLowerCase().includes("[x]");

        if (isCalCompleted && !subtask.isCompleted) {
          // Calendar -> Firestore Sync: Mark subtask as completed
          const subtaskRef = doc(db, "users", userId, "subtasks", subtask.id || subtask.subtaskId);
          await updateDoc(subtaskRef, {
            isCompleted: true,
            completedAt: new Date().toISOString()
          });
          subtask.isCompleted = true;
          subtask.completedAt = new Date().toISOString();
          affectedTaskIds.add(subtask.taskId);
          updatedCount++;
        } else if (!isCalCompleted && subtask.isCompleted) {
          // Firestore -> Calendar Sync: Mark calendar event as completed
          const cleanTitle = calSummary.replace(/^✓\s*(Completed:\s*)?/, "").replace(/^\[Completed\]\s*/, "");
          const newSummary = `✓ Completed: ${cleanTitle}`;
          try {
            await updateGoogleCalendarEvent(token, matchedEvent.id, { summary: newSummary });
            updatedCount++;
          } catch (err) {
            console.error(`Failed to update calendar event summary for ${subtask.subtaskId}:`, err);
          }
        }
      }
    }

    // 4. Update task progress & risk scores for affected tasks
    for (const taskId of affectedTaskIds) {
      const task = tasks.find(t => t.id === taskId || t.taskId === taskId);
      if (task) {
        // Get all subtasks for this task
        const taskSubtasks = subtasks.filter(s => s.taskId === taskId);
        if (taskSubtasks.length > 0) {
          const completedHours = taskSubtasks.filter(s => s.isCompleted).reduce((sum, s) => sum + s.estimatedHours, 0);
          const totalHours = taskSubtasks.reduce((sum, s) => sum + s.estimatedHours, 0);
          const newProgress = totalHours > 0 ? Math.min(100, Math.round((completedHours / totalHours) * 100)) : 0;

          // Recalculate risk using the risk engine
          const updatedTask = { ...task, progress: newProgress };
          const analysis = calculateRiskAndClassification(updatedTask, tasks, null);
          
          const taskDocRef = doc(db, "users", userId, "tasks", task.id || task.taskId);
          await updateDoc(taskDocRef, {
            progress: newProgress,
            riskScore: analysis.riskScore,
            riskLevel: analysis.riskLevel,
            completionProbability: analysis.completionProbability,
            urgency: analysis.urgency,
            importance: analysis.importance,
            behaviorState: analysis.behaviorState,
            calendarState: analysis.calendarState,
            progressState: analysis.progressState,
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    return { success: true, updatedCount };
  } catch (err: any) {
    console.error("Bidirectional sync failed:", err);
    return { success: false, updatedCount: 0, error: err.message };
  }
}
