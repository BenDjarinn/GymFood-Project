/**
 * Chat type definitions for GetStream-powered consultation chat.
 */

/** A single chat message mapped from GetStream's message format */
export interface ChatMessageItem {
  id: string;
  text: string;
  isCoach: boolean;
  createdAt: Date;
}

/** Response from the stream-token Edge Function */
export interface StreamTokenResponse {
  token: string;
  channelId: string;
}

/** Coach Jim bot user ID in GetStream */
export const COACH_JIM_ID = "coach-jim";
