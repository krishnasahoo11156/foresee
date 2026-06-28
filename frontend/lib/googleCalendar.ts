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
    const errorJson = await response.json().catch(() => null);
    let activationUrl = "";

    // Extract Google Console activation URL from details if API is disabled
    if (errorJson?.error?.details) {
      for (const detail of errorJson.error.details) {
        if (detail.metadata?.activationUrl) {
          activationUrl = detail.metadata.activationUrl;
          break;
        }
      }
    }

    const errMsg = errorJson?.error?.message || `Google Calendar API Error: ${response.status}`;
    const err = new Error(errMsg) as any;
    err.status = response.status;
    err.activationUrl = activationUrl;
    err.errorDetails = errorJson;
    throw err;
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
): Promise<{ success: boolean; count: number; error?: string; activationUrl?: string }> {
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

      // Handle service disabled (403 with activationUrl)
      if (err.status === 403 && err.activationUrl) {
        return {
          success: false,
          count: syncedCount,
          error: err.message,
          activationUrl: err.activationUrl
        };
      }

      // Remove token if actual auth error (401 or general invalid credentials)
      if (
        err.status === 401 ||
        err.message.includes("unauthorized") ||
        err.message.includes("Invalid Credentials")
      ) {
        localStorage.removeItem(`google_calendar_token_${userId}`);
        return {
          success: false,
          count: syncedCount,
          error: "Credentials expired. Please re-authorize Google Calendar sync."
        };
      }

      // Other general error
      return {
        success: false,
        count: syncedCount,
        error: err.message || "Failed to synchronize event blocks."
      };
    }
  }

  return {
    success: true,
    count: syncedCount
  };
}

/**
 * Updates a single event on the user's primary Google Calendar via REST API PATCH request.
 */
export async function updateGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<any> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

  const body: any = {};
  if (event.summary !== undefined) body.summary = event.summary;
  if (event.description !== undefined) body.description = event.description;
  if (event.startTime !== undefined) {
    body.start = {
      dateTime: event.startTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    };
  }
  if (event.endTime !== undefined) {
    body.end = {
      dateTime: event.endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    };
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errMsg = errorJson?.error?.message || `Google Calendar API PATCH Error: ${response.status}`;
    const err = new Error(errMsg) as any;
    err.status = response.status;
    throw err;
  }

  return response.json();
}

/**
 * Lists upcoming events from the user's primary Google Calendar.
 */
export async function listGoogleCalendarEvents(
  accessToken: string,
  timeMin: string
): Promise<any[]> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errMsg = errorJson?.error?.message || `Google Calendar API GET Error: ${response.status}`;
    const err = new Error(errMsg) as any;
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.items || [];
}
