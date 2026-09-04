(function () {
    "use strict";

    // ==========================================
    // فيديانا 🎬
    // محرك الفيديو: LTX 2.3 - Hugging Face
    // ==========================================

    const SPACE_URL = "https://upsampler-ltx-video.hf.space";

    // ------------------------------------------
    // إنشاء الفيديو
    // ------------------------------------------

    async function generateVideo(event) {

        if (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        const result = document.getElementById("result");

        try {

            const idea = document.getElementById("idea");

            if (!idea || !idea.value.trim()) {
                throw new Error("اكتب فكرة الفيديو أولاً.");
            }

            let prompt = idea.value.trim();

            const category = document.getElementById("category");
            const style = document.getElementById("style");
            const language = document.getElementById("language");

            if (category && category.value) {
                prompt += ". Category: " + category.value;
            }

            if (style && style.value) {
                prompt += ". Style: " + style.value;
            }

            if (language && language.value) {
                prompt += ". Language: " + language.value;
            }

            // رسالة انتظار
            if (result) {
                result.innerHTML =
                    "<p>🎬 جاري إنشاء الفيديو...<br>" +
                    "قد يستغرق الأمر قليلًا، يرجى الانتظار.</p>";
            }

            // تحميل Gradio Client
            const module = await import(
                "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js"
            );

            const Client = module.Client;

            if (!Client) {
                throw new Error("تعذر تحميل محرك الاتصال.");
            }

            // الاتصال بمحرك LTX
            const app = await Client.connect(SPACE_URL);

            // إرسال الطلب إلى API
            const response = await app.predict(
                "/generate_video",
                [
                    null,
                    prompt,
                    3,
                    false,
                    42,
                    true,
                    512,
                    768
                ]
            );

            console.log("Vidiana API response:", response);

            // استخراج الفيديو
            const videoData = findVideoData(response);

            if (!videoData) {
                throw new Error("تم إنشاء النتيجة لكن لم يتم العثور على ملف الفيديو.");
            }

            let videoUrl = videoData.url || videoData.path || videoData;

            if (typeof videoUrl !== "string") {
                throw new Error("تعذر قراءة رابط الفيديو.");
            }

            // تحويل المسار النسبي إلى رابط كامل
            if (videoUrl.startsWith("/")) {
                videoUrl = SPACE_URL + videoUrl;
            }

            // عرض الفيديو
            if (result) {
                result.innerHTML = `
                    <div style="text-align:center;">
                        <p>✅ تم إنشاء الفيديو بنجاح!</p>
                        <video
                            controls
                            playsinline
                            style="width:100%;max-width:700px;border-radius:15px;"
                            src="${videoUrl}">
                        </video>
                        <br><br>
                        <a
                            href="${videoUrl}"
                            target="_blank"
                            rel="noopener"
                            style="
                                display:inline-block;
                                padding:12px 20px;
                                border-radius:10px;
                                background:#6d3df5;
                                color:white;
                                text-decoration:none;
                            ">
                            🎬 فتح الفيديو
                        </a>
                    </div>
                `;
            }

        } catch (error) {

            console.error("Vidiana error:", error);

            if (result) {
                result.innerHTML =
                    "<p>❌ تعذر إنشاء الفيديو حاليًا.</p>" +
                    "<p style='font-size:14px;opacity:.8;'>" +
                    (error.message || "حدث خطأ غير معروف.") +
                    "</p>";
            }
        }
    }


    // ------------------------------------------
    // البحث عن ملف الفيديو داخل النتيجة
    // ------------------------------------------

    function findVideoData(value) {

        if (!value) {
            return null;
        }

        // FileData مباشر
        if (
            typeof value === "object" &&
            (
                value.url ||
                value.path
            )
        ) {
            return value;
        }

        // مصفوفة
        if (Array.isArray(value)) {

            for (const item of value) {

                const found = findVideoData(item);

                if (found) {
                    return found;
                }
            }
        }

        // كائن
        if (typeof value === "object") {

            for (const key in value) {

                const found = findVideoData(value[key]);

                if (found) {
                    return found;
                }
            }
        }

        // رابط فيديو
        if (
            typeof value === "string" &&
            (
                value.includes(".mp4") ||
                value.includes(".webm") ||
                value.includes("file=")
            )
        ) {
            return value;
        }

        return null;
    }


    // ------------------------------------------
    // تشغيل فيديانا
    // ------------------------------------------

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const form = document.getElementById("videoForm");

            if (form) {

                form.addEventListener(
                    "submit",
                    generateVideo,
                    true
                );
            }

            const button =
                document.querySelector(".login-btn");

            if (button) {
                button.style.display = "none";
            }
        }
    );

})();
