/**
 * Mock: fetchApi wrapper.
 * Simulates the internal Microsoft fetch utility with schema validation.
 */

export async function fetchApi(
  url: string,
  _schema: any,
  options?: { options?: RequestInit; analytics?: any },
): Promise<{ data: any }> {
  const method = options?.options?.method ?? "GET";
  console.log(`[mock fetchApi] ${method} ${url}`);

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));

  if (method === "POST") {
    return { data: { status: "waitlisted" } };
  }

  return { data: { status: "not_joined" } };
}
