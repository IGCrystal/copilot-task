/**
 * Mock: fetch wrapper.
 * Returns mock responses for waitlist API calls.
 */

export async function fetchApi(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  console.log(`[mock fetch] ${options?.method ?? "GET"} ${url}`);

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 500));

  // POST = join waitlist
  if (options?.method === "POST") {
    return new Response(JSON.stringify({ status: "waitlisted" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // GET = check status
  return new Response(JSON.stringify({ status: "not_joined" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
