const HF = "https://upsampler-ltx-video.hf.space";
const ORIGIN = "https://kutaiba89.github.io";

function headers(type = "application/json") {
  return {
    "Content-Type": type,
    "Access-Control-Allow-Origin": ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: headers()
  });
}

export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: headers()
      });
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return json({
        ok: true,
        service: "Vidiana API"
      });
    }

    if (url.pathname !== "/generate-video") {
      return json({
        error: "Endpoint not found"
      }, 404);
    }

    if (!env.HF_TOKEN) {
      return json({
        error: "HF_TOKEN غير مضاف"
      }, 500);
    }

    try {

      if (request.method === "POST") {

        const body = await request.json();
        const prompt = String(body.prompt || "").trim();

        if (!prompt) {
          return json({
            error: "الرجاء إدخال وصف للفيديو"
          }, 400);
        }

        const response = await fetch(
          `${HF}/gradio_api/call/generate_video`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.HF_TOKEN}`
            },
            body: JSON.stringify({
              data: [
                null,
                prompt,
                3,
                false,
                42,
                true,
                512,
                768
              ]
            })
          }
        );

        const text = await
