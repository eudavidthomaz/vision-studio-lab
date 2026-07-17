const CHALLENGE_TOKEN = "[__GwvbaaVV8pridop-RY5ujFqb4Q3AZaeDkByGY-DQk]";

Deno.serve(() => {
  return new Response(CHALLENGE_TOKEN, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
});
