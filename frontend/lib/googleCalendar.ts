export interface GoogleCalendarEvent {
  summary: string;
  description: string;
  startTime: string; // ISO 8601 String
  endTime: string; // ISO 8601 String
}

/**
 * Creates a single event on the user's primary Google Calendar via direct REST API POST request.
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEvent
): Promise<any> {
  const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

  const body = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: event.startTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    },
    end: {
      dateTime: event.endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Calendar API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Synchronizes multiple events to the user's Google Calendar.
 * Retrieves OAuth token from local storage.
 */
export async function syncEventsToGoogleCalendar(
  userId: string,
  events: GoogleCalendarEvent[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const token = localStorage.getItem(`google_calendar_token_${userId}`);
  if (!token) {
    return {
      success: false,
      count: 0,
      error: "Google Calendar access token not found. Please authorize Calendar access."
    };
  }

  let syncedCount = 0;
  for (const event of events) {
    try {
      await createGoogleCalendarEvent(token, event);
      syncedCount++;
    } catch (err: any) {
      console.error("Failed to sync event:", event, err);
      // Remove token if expired
      if (
        err.message.includes("401") ||
        err.message.includes("unauthorized") ||
        err.message.includes("Invalid Credentials") ||
        err.message.includes("403")
      ) {
        localStorage.removeItem(`google_calendar_token_${userId}`);
        return {
          success: false,
          count: syncedCount,
          error: "Credentials expired. Please re-authorize Google Calendar sync."
        };
      }
    }
  }

  return {
    success: true,
    count: syncedCount
  };
}
