/**
 * Interface for Time Management subsystem integration
 * This allows the recruitment module to work standalone with a stub implementation,
 * and later swap in the real Time Management module when integrated.
 */
export interface ITimeManagementService {
  /**
   * Create a calendar event for an interview
   * @param eventDetails - Event details including title, start time, end time, attendees
   * @returns Calendar event ID
   */
  createCalendarEvent(eventDetails: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: string[]; // Employee IDs
    location?: string;
    videoLink?: string;
  }): Promise<{ eventId: string; calendarLink?: string }>;

  /**
   * Check availability of panel members for a time slot
   * @param employeeIds - Array of employee IDs (panel members)
   * @param startTime - Start time of the interview
   * @param endTime - End time of the interview
   * @returns Availability status for each employee
   */
  checkAvailability(
    employeeIds: string[],
    startTime: Date,
    endTime: Date,
  ): Promise<Array<{ employeeId: string; available: boolean; conflicts?: any[] }>>;

  /**
   * Send calendar invite (iCal format) to attendees
   * @param eventId - Calendar event ID
   * @param attendeeEmails - Array of attendee email addresses
   */
  sendCalendarInvite(eventId: string, attendeeEmails: string[]): Promise<void>;
}

