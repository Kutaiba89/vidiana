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
