/**
 * Mock: API response schemas.
 * In production these would be zod schemas for runtime validation.
 * Here they're just identity passthrough markers.
 */

export const joinResponseSchema = { parse: (d: any) => d };
export const statusResponseSchema = { parse: (d: any) => d };
