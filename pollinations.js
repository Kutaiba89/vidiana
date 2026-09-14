(function () {
  "use strict";

  const API_URL = "https://vidiana-api.qutaibalaila89.workers.dev";

  const CATEGORY_MAP = {
    "تعليمي": "educational",
    "قصصي": "storytelling",
    "أطفال": "children",
    "ترفيهي": "entertainment",
    "إعلاني": "advertising",
    "معلوماتي": "informational"
  };

  const STYLE_MAP = {
    "3D": "high-quality 3D animated",
    "كرتوني": "colorful cartoon",
    "واقعي": "photorealistic",
    "سينمائي": "cinematic",
    "أنيمي": "anime"
  };

  const LANGUAGE_MAP = {
    "العربية": "Arabic",
    "English": "English",
    "Français": "French"
  };

  function value(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function buildPrompt() {
    const idea = value("idea").trim();
    const category = CATEGORY_MAP[value("category")] || value("category");
    const style = STYLE_MAP[value("style")] || value("style");
    const language = LANGUAGE_MAP[value("language")] || value("language");

    return [
      idea,
      "Create a coherent visual scene that follows the user's idea exactly.",
      "Video type: " + category + ".",
      "Visual style: " + style + ".",
      "Requested language/context: " + language + ".",
      "Keep the main subject consistent and clearly visible.",
      "Smooth natural motion, strong composition, no text on screen."
    ].join(" ");
  }

  async function generateVideo(event) {
    event.preventDefault();

    const result = document.getElementById("result");
    const button = document.querySelector('#videoForm button[type="submit"]');
    const idea = value("idea").trim();

    if (!idea) {
      result.style.display = "block";
      result.innerHTML = "<p>❌ اكتب فكرة الفيديو أولًا.</p>";
      return;
    }

    const targetDuration = Number(value("duration") || 60);
    const prompt = buildPrompt();

    try {
      result.style.display = "block";
      result.innerHTML =
        "<p>🎬 جاري إنشاء الفيديو بالذكاء الاصطناعي...</p>" +
        "<p>يرجى الانتظار وعدم إغلاق الصفحة.</p>";

      button.disabled = true;
      button.textContent = "⏳ جاري الإنشاء...";

      const response = await fetch(API_URL + "/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          duration: 3,
          targetDuration
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل إرسال الطلب.");
      }

      if (!data.event_id) {
        throw new Error("لم يصل رقم عملية الفيديو.");
      }

      result.innerHTML =
        "<p>⏳ المحرك يعمل الآن...</p>" +
        "<p>جاري تجهيز المقطع.</p>";

      const videoUrl = await getVideo(data.event_id);

      result.innerHTML = `
        <div style="text-align:center">
          <p>✅ تم إنشاء الفيديو بنجاح!</p>
          <video
            controls
            playsinline
            src="${videoUrl}"
            style="width:100%;max-width:700px;border-radius:15px;background:#000;">
          </video>
          <br><br>
          <a
            href="${videoUrl}"
            target="_blank"
            rel="noopener"
            style="display:inline-block;padding:12px 20px;border-radius:10px;background:#6d3df5;color:white;text-decoration:none;">
            🎬 فتح الفيديو
          </a>
        </div>
      `;
    } catch (error) {
      console.error("Vidiana:", error);
      result.style.display = "block";
      result.innerHTML =
        "<p>❌ تعذر إنشاء الفيديو.</p><p>" +
        (error.message || "حدث خطأ.") +
        "</p>";
    } finally {
      button.disabled = false;
      button.textContent = "🚀 إنشاء الفيديو";
    }
  }

  async function getVideo(eventId) {
    const response = await fetch(
      API_URL + "/generate-video?event_id=" + encodeURIComponent(eventId)
    );

    if (!response.ok) {
      throw new Error("تعذر متابعة إنشاء الفيديو.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value: chunk, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(chunk, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        for (const line of event.split("\n")) {
          if (!line.startsWith("data:")) continue;

          const text = line.slice(5).trim();
          if (!text || text === "[DONE]") continue;

          try {
            const data = JSON.parse(text);
            const video = findVideo(data);
            if (video) {
              return video.url || video.path || video;
            }
          } catch (_) {}
        }
      }
    }

    throw new Error("لم يتم العثور على ملف الفيديو.");
  }

  function findVideo(value) {
    if (!value) return null;

    if (typeof value === "object" && (value.url || value.path)) {
      return value;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findVideo(item);
        if (found) return found;
      }
    }

    if (typeof value === "object") {
      for (const key in value) {
        const found = findVideo(value[key]);
        if (found) return found;
      }
    }

    if (
      typeof value === "string" &&
      (value.includes(".mp4") ||
        value.includes(".webm") ||
        value.includes("file="))
    ) {
      return value;
    }

    return null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("videoForm");
    if (form) {
      form.addEventListener("submit", generateVideo);
    }
  });
})();
