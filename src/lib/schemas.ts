/**
 * Mock: API response schemas.
 * In production these would be zod schemas for runtime validation.
 * Here they're just identity passthrough markers.
 */

import type { Schema } from "./api";

export type WaitlistStatus = "not_joined" | "waitlisted" | "enrolled";

export interface JoinWaitlistResponse {
	status: Exclude<WaitlistStatus, "not_joined">;
}

export interface WaitlistStatusResponse {
	status: WaitlistStatus;
}

export const joinResponseSchema: Schema<JoinWaitlistResponse> = {
	parse: (d: unknown) => d as JoinWaitlistResponse,
};

export const statusResponseSchema: Schema<WaitlistStatusResponse> = {
	parse: (d: unknown) => d as WaitlistStatusResponse,
};
