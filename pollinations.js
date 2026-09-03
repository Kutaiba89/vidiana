(function () {
  "use strict";

  // ==============================
  // إعدادات فيديانا + Pollinations
  // ==============================

  const CLIENT_ID = "pk_8Aa2VqewKVivzwuA";

  const REDIRECT_URI = "https://kutaiba89.github.io/vidiana/";

  const AUTHORIZE_URL = "https://enter.pollinations.ai/authorize";
  const TOKEN_URL = "https://enter.pollinations.ai/api/oauth/token";
  const VIDEO_URL = "https://gen.pollinations.ai/video/";

  const TOKEN_KEY = "vidiana_pollinations_token";
  const VERIFIER_KEY = "vidiana_pkce_verifier";
  const STATE_KEY = "vidiana_oauth_state";

  // ==============================
  // أدوات PKCE
  // ==============================

  function base64UrlEncode(bytes) {
    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function randomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    let result = "";

    for (let i = 0; i < array.length; i++) {
      result += chars[array[i] % chars.length];
    }

    return result;
  }

  async function createCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);

    const hash = await crypto.subtle.digest("SHA-256", data);

    return base64UrlEncode(new Uint8Array(hash));
  }

  // ==============================
  // تسجيل الدخول
  // ==============================

  async function login() {
    try {
      const verifier = randomString(64);
      const state = randomString(32);

      const challenge = await createCodeChallenge(verifier);

      sessionStorage.setItem(VERIFIER_KEY, verifier);
      sessionStorage.setItem(STATE_KEY, state);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "profile usage",
        state: state,
        code_challenge: challenge,
        code_challenge_method: "S256"
      });

      window.location.href =
        AUTHORIZE_URL + "?" + params.toString();

    } catch (error) {
      console.error(error);
      alert("تعذر بدء تسجيل الدخول. تأكد من تشغيل الموقع عبر HTTPS.");
    }
  }

  // نجعل زر تسجيل الدخول في فيديانا يستخدم Pollinations
  window.login = login;

  // ==============================
  // استلام رمز OAuth
  // ==============================

  async function handleCallback() {
    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");
    const returnedState = params.get("state");
    const error = params.get("error");

    if (error) {
      console.error("OAuth error:", error);
      alert("لم يتم إكمال تسجيل الدخول.");
      return;
    }

    if (!code) {
      return;
    }

    const savedState = sessionStorage.getItem(STATE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_KEY);

    if (!savedState || returnedState !== savedState) {
      alert("فشل التحقق من جلسة تسجيل الدخول.");
      return;
    }

    if (!verifier) {
      alert("انتهت جلسة تسجيل الدخول. حاول مرة أخرى.");
      return;
    }

    try {
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier
      });

      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Token error:", text);
        throw new Error("Token exchange failed");
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new Error("No access token returned");
      }

      sessionStorage.setItem(TOKEN_KEY, data.access_token);

      sessionStorage.removeItem(STATE_KEY);
      sessionStorage.removeItem(VERIFIER_KEY);

      // تنظيف رابط الموقع من code و state
      window.history.replaceState(
        {},
        document.title,
        REDIRECT_URI
      );

      alert("تم تسجيل الدخول بنجاح إلى محرك فيديانا 🎉");

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إكمال تسجيل الدخول.");
    }
  }

  // ==============================
  // إنشاء Prompt للفيديو
  // ==============================

  function buildPrompt() {
    const ideaElement = document.getElementById("idea");
    const categoryElement = document.getElementById("category");
    const styleElement = document.getElementById("style");
    const languageElement = document.getElementById("language");

    const idea = ideaElement
      ? ideaElement.value.trim()
      : "";

    const category = categoryElement
      ? categoryElement.value
      : "";

    const style = styleElement
      ? styleElement.value
      : "";

    const language = languageElement
      ? languageElement.value
      : "";

    if (!idea) {
      throw new Error("NO_IDEA");
    }

    return `
Create a high quality AI video.

Main idea:
${idea}

Category:
${category}

Visual style:
${style}


Language:
${language}

The video should be visually attractive,
coherent, cinematic, detailed and suitable
for the requested idea.
No subtitles unless specifically requested.
`;
  }

  // ==============================
  // عرض الفيديو
  // ==============================

  function showVideo(blob) {
    const result = document.getElementById("result");
    const resultText = document.getElementById("resultText");

    const url = URL.createObjectURL(blob);

    if (resultText) {
      resultText.textContent = "تم إنشاء الفيديو بنجاح 🎬";
    }

    if (result) {
      result.innerHTML = "";

      const video = document.createElement("video");

      video.controls = true;
      video.autoplay = false;
      video.playsInline = true;

      video.style.width = "100%";
      video.style.maxWidth = "720px";
      video.style.borderRadius = "15px";
      video.style.marginTop = "15px";

      video.src = url;

      const download = document.createElement("a");

      download.href = url;
      download.download = "vidiana-video.mp4";
      download.textContent = "⬇️ تحميل الفيديو";

      download.style.display = "inline-block";
      download.style.marginTop = "15px";
      download.style.padding = "12px 20px";
      download.style.borderRadius = "10px";
      download.style.textDecoration = "none";
      download.style.background = "#ffffff";
      download.style.color = "#000000";
      download.style.fontWeight = "bold";

      result.appendChild(video);
      result.appendChild(document.createElement("br"));
      result.appendChild(download);
    }
  }

  // ==============================
  // إنشاء الفيديو
  // ==============================

  async function generateWithPollinations(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const token = sessionStorage.getItem(TOKEN_KEY);

    if (!token) {
      alert("يجب تسجيل الدخول أولًا إلى محرك فيديانا.");
      login();
      return;
    }

    let prompt;

    try {
      prompt = buildPrompt();
    } catch (error) {
      if (error.message === "NO_IDEA") {
        alert("اكتب فكرة الفيديو أولًا.");
        return;
      }

      alert("تعذر تجهيز طلب الفيديو.");
      return;
    }

    const resultText = document.getElementById("resultText");

    if (resultText) {
      resultText.textContent =
        "جاري إنشاء الفيديو بالذكاء الاصطناعي... ⏳";
    }

    try {
      const url =
        VIDEO_URL +
        encodeURIComponent(prompt) +
        "?model=veo&duration=4";

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (response.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);

        alert(
          "انتهت صلاحية تسجيل الدخول. سيتم تسجيل الدخول مرة أخرى."
        );

        login();
        return;
      }

      if (response.status === 402) {
        if (resultText) {
          resultText.textContent =
            "الرصيد غير كافٍ لإنشاء الفيديو.";
        }

        alert("الرصيد غير كافٍ لإنشاء الفيديو حاليًا.");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Video generation error:",
          errorText
        );

        throw new Error("Video generation failed");
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error("Empty video response");
      }

      showVideo(blob);

    } catch (error) {
      console.error(error);

      if (resultText) {
        resultText.textContent =
          "حدث خطأ أثناء إنشاء الفيديو.";
      }

      alert("حدث خطأ أثناء إنشاء الفيديو.");
    }
  }

  // ==============================
  // تشغيل النظام
  // ==============================

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      handleCallback();

      // تشغيل زر تسجيل الدخول الجديد
      const loginButton =
        document.querySelector(".login-btn");

      if (loginButton) {
        loginButton.addEventListener("click", login);
      }

      const form =
        document.getElementById("videoForm");

      if (form) {
        form.addEventListener(
          "submit",
          generateWithPollinations,
          true
        );
      }

    }
  );

})();
