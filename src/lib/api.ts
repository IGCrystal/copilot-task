/**
 * Mock: fetchApi wrapper.
 * Simulates the internal Microsoft fetch utility with schema validation.
 */

export type Schema<T> = {
  parse: (data: unknown) => T;
};

export async function fetchApi<T>(
  url: string,
  schema: Schema<T>,
  options?: { options?: RequestInit; analytics?: unknown },
): Promise<{ data: T }> {
  const method = options?.options?.method ?? "GET";
  console.log(`[mock fetchApi] ${method} ${url}`);
  await new Promise((r) => setTimeout(r, 300));

  const mockData: unknown = method === "POST" ? { status: "waitlisted" } : { status: "not_joined" };

  return { data: schema.parse(mockData) };
}
