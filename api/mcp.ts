export const config = {
  runtime: "edge",
};

const MCP_UPSTREAM_URL = "https://imitktxtunqovyqsmplb.supabase.co/functions/v1/mcp";

function upstreamUrl(requestUrl: string) {
  const incoming = new URL(requestUrl);
  const upstream = new URL(MCP_UPSTREAM_URL);
  upstream.search = incoming.search;
  return upstream;
}

function upstreamHeaders(request: Request) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  return headers;
}

export default async function handler(request: Request) {
  const upstream = await fetch(upstreamUrl(request.url), {
    method: request.method,
    headers: upstreamHeaders(request),
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
    // Required by the Fetch standard when forwarding a streamed request body.
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
}
