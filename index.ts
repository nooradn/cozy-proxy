const allowedOrigin = "https://cozydownloader.netlify.app";
const allowedIPs = [""];

const server = Bun.serve({
  hostname: "::",
  port: process.env.PORT ?? 3000,

  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    const origin = request.headers.get("origin");
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";

    const isAllowedOrigin = origin === allowedOrigin;
    const isAllowedIP = allowedIPs.includes(clientIP);

    if (!isAllowedOrigin && !isAllowedIP) {
      return new Response("Orgin or IP is not allowed", { status: 403 });
    }

    if (!targetUrl) {
      return new Response("Parameter ?url= should be filled", { status: 400 });
    }

    let targetResp: Response;
    try {
      targetResp = await fetch(targetUrl);
    } catch (err) {
      return new Response("Failed to fetch target: " + (err as Error).message, { status: 500 });
    }

    const contentType = targetResp.headers.get("content-type") || "application/octet-stream";

    return new Response(targetResp.body, {
      status: targetResp.status,
      headers: {
        "Access-Control-Allow-Origin": origin || "*", 
        "Content-Type": contentType,
      },
    });
  },
});

console.log(`Proxy runs on http://localhost:${server.port}`);
