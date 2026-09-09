export default function handler(_req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const geminiKey = process.env.GEMINI_API_KEY;
  const aiStudioKey = process.env.AI_STUDIO_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  function maskKey(k?: string) {
    if (!k || typeof k !== "string") return null;
    const clean = k.trim();
    if (clean.length < 8) return `present (${clean.length} chars)`;
    return `${clean.slice(0, 6)}...${clean.slice(-4)} (${clean.length} chars)`;
  }

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: "ok",
      serverTimestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      keyStatus: {
        GEMINI_API_KEY: maskKey(geminiKey),
        AI_STUDIO_API_KEY: maskKey(aiStudioKey),
        GOOGLE_API_KEY: maskKey(googleKey),
        hasAnyValidKey: Boolean((geminiKey && geminiKey.trim().length > 10) || (aiStudioKey && aiStudioKey.trim().length > 10) || (googleKey && googleKey.trim().length > 10)),
      },
    })
  );
}
