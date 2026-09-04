(function () {
  "use strict";

  // ==========================================
  // فيديانا 🎬
  // محرك الفيديو: LTX 2.3 - Hugging Face
  // ==========================================

  const SPACE_URL =
    "https://upsampler-ltx-video.hf.space";

  const API_URL =
  SPACE_URL + "/gradio_api/call/run/generate_video";

  // ------------------------------------------
  // الحصول على بيانات النموذج من فيديانا
  // ------------------------------------------

  function getPrompt() {
    const idea = document.getElementById("idea");

    if (!idea || !idea.value.trim()) {
      throw new Error("اكتب فكرة الفيديو أولًا.");
    }

    let prompt = idea.value.trim();

    const category = document.getElementById("category");
    const style = document.getElementById("style");
    const language = document.getElementById("language");

    if (category && category.value) {
      prompt += ". Category: " + category.value;
    }

    if (style && style.value) {
      prompt += ". Visual style: " + style.value;
    }

    if (language && language.value) {
      prompt += ". Language: " + language.value;
    }

    return prompt;
  }

  // ------------------------------------------
  // انتظار نتيجة Gradio
  // ------------------------------------------

  async function waitForResult(eventId) {
    const resultUrl =
      API_URL + "/" + encodeURIComponent(eventId);

    const response = await fetch(resultUrl, {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error(
        "تعذر الحصول على نتيجة الفيديو. HTTP " +
        response.status
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true
      });

      const lines = buffer.split("\n");

      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) {
          continue;
        }

        const data = line.slice(5).trim();

        if (!data) {
          continue;
        }

        if (data === "[DONE]") {
          continue;
        }

        let parsed;

        try {
          parsed = JSON.parse(data);
        } catch (e) {
          continue;
        }

        // النتيجة النهائية
        if (
          parsed &&
          parsed.msg === "process_completed"
        ) {
          if (parsed.output) {
            return parsed.output;
          }

          if (parsed.data) {
            return parsed.data;
          }
        }

        // خطأ من المحرك
        if (
          parsed &&
          parsed.msg === "process_failed"
        ) {
          throw new Error(
            "محرك LTX رفض إنشاء الفيديو."
          );
        }
      }
    }

    throw new Error(
      "انتهى الاتصال قبل وصول الفيديو."
    );
  }

  // ------------------------------------------
  // استخراج رابط الفيديو من نتيجة Gradio
  // ------------------------------------------

  function findVideoUrl(data) {
    if (!data) {
      return null;
    }

    if (typeof data === "string") {
      if (
        data.startsWith("http://") ||
        data.startsWith("https://")
      ) {
        return data;
      }

      return null;
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        const found = findVideoUrl(item);

        if (found) {
          return found;
        }
      }
    }

    if (typeof data === "object") {
      if (data.url) {
        return data.url;
      }

      if (data.path) {
        return SPACE_URL + "/file=" + data.path;
      }

      if (data.video) {
        return findVideoUrl(data.video);
      }

      if (data.data) {
        return findVideoUrl(data.data);
      }
    }

    return null;
  }

  // ------------------------------------------
  // عرض الفيديو داخل فيديانا
  // ------------------------------------------

  function showVideo(videoUrl) {
    const result = document.getElementById("result");
    const resultText =
      document.getElementById("resultText");

    if (resultText) {
      resultText.textContent =
        "تم إنشاء الفيديو بنجاح 🎬";
    }

    if (!result) {
      return;
    }

    result.innerHTML = "";

    const video = document.createElement("video");

    video.controls = true;
    video.playsInline = true;
    video.autoplay = false;

    video.style.width = "100%";
    video.style.maxWidth = "720px";
    video.style.borderRadius = "15px";
    video.style.marginTop = "15px";

    video.src = videoUrl;

    const download =
      document.createElement("a");

    download.href = videoUrl;
    download.target = "_blank";
    download.rel = "noopener";

    download.textContent =
      "⬇️ فتح / تحميل الفيديو";

    download.style.display = "inline-block";
    download.style.marginTop = "12px";
    download.style.padding = "10px 16px";

    result.appendChild(video);

    result.appendChild(
      document.createElement("br")
    );

    result.appendChild(download);
  }

  // ------------------------------------------
  // إنشاء الفيديو
  // ------------------------------------------

  async function generateVideo(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const resultText =
      document.getElementById("resultText");

    if (resultText) {
      resultText.textContent =
        "جاري إنشاء الفيديو بالذكاء الاصطناعي... ⏳";
    }

    try {
      const prompt = getPrompt();

      // إعدادات آمنة للاختبار
      const data = [
        null,        // input_image
        prompt,      // prompt
        3,           // duration
        false,       // enhance_prompt
        42,          // seed
        true,        // randomize_seed
        512,         // height
        768          // width
      ];

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          data: data
        })
      });

      if (!response.ok) {
        throw new Error(
          "فشل الاتصال بمحرك الفيديو. HTTP " +
          response.status
        );
      }

      const responseData =
        await response.json();

      if (!responseData.event_id) {
        throw new Error(
          "لم يُرجع المحرك رقم المهمة."
        );
      }

      if (resultText) {
        resultText.textContent =
          "تم إرسال الفيديو إلى المحرك... ⏳";
      }

      const output =
        await waitForResult(
          responseData.event_id
        );

      const videoUrl =
        findVideoUrl(output);

      if (!videoUrl) {
        console.log(
          "LTX result:",
          output
        );

        throw new Error(
          "تمت العملية ولكن لم أجد رابط الفيديو."
        );
      }

      showVideo(videoUrl);

    } catch (error) {
      console.error(
        "Vidiana LTX Error:",
        error
      );

      if (resultText) {
        resultText.textContent =
          "حدث خطأ أثناء إنشاء الفيديو.";
      }

      alert(
        "تعذر إنشاء الفيديو حاليًا.\n\n" +
        error.message
      );
    }
  }

  // ------------------------------------------
  // تشغيل المحرك عند إرسال النموذج
  // ------------------------------------------

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      const form =
        document.getElementById("videoForm");

      if (form) {
        form.addEventListener(
          "submit",
          generateVideo,
          true
        );
      }

      const button =
        document.querySelector(
          ".login-btn"
        );

      if (button) {
        button.style.display = "none";
      }

    }
  );

})();
