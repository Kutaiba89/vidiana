(function () {
    "use strict";

    const API_URL =
        "https://vidiana-api.qutaibalaila89.workers.dev";

    async function generateVideo(event) {
        if (event) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }

        const result = document.getElementById("result");
        const button = document.querySelector(
            '#videoForm button[type="submit"]'
        );

        try {
            const idea = document.getElementById("idea");

            if (!idea || !idea.value.trim()) {
                throw new Error("اكتب فكرة الفيديو أولًا.");
            }

            let prompt = idea.value.trim();

            const category =
                document.getElementById("category");
            const style =
                document.getElementById("style");
            const language =
                document.getElementById("language");
const duration =
    document.getElementById("duration");

const targetDuration =
    Number(duration?.value || 60);
            if (category && category.value)
                prompt += ". Category: " + category.value;

            if (style && style.value)
                prompt += ". Style: " + style.value;

            if (language && language.value)
                prompt += ". Language: " + language.value;

            if (result) {
                result.style.display = "block";
                result.innerHTML =
                    "<p>🎬 جاري إنشاء الفيديو...</p>" +
                    "<p>يرجى الانتظار وعدم إغلاق الصفحة.</p>";
            }

            if (button) {
                button.disabled = true;
                button.textContent = "⏳ جاري الإنشاء...";
            }

            const response = await fetch(
                API_URL + "/generate-video",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        duration: 3,
                            targetDuration: targetDuration
                    })
                }
            );

            const data = await response.json();

            if (!response.ok)
                throw new Error(
                    data.error || "فشل إرسال الطلب."
                );

            if (!data.event_id)
                throw new Error(
                    "لم يصل رقم عملية الفيديو."
                );

            if (result)
                result.innerHTML =
                    "<p>⏳ المحرك يعمل الآن...</p>" +
                    "<p>جاري تجهيز الفيديو.</p>";

            const videoUrl =
                await getVideo(data.event_id);

            if (result) {
                result.innerHTML = `
                    <div style="text-align:center">
                        <p>✅ تم إنشاء الفيديو بنجاح!</p>

                        <video
                            controls
                            playsinline
                            style="
                                width:100%;
                                max-width:700px;
                                border-radius:15px;
                                background:#000;
                            "
                            src="${videoUrl}">
                        </video>

                        <br><br>

                        <a
                            href="${videoUrl}"٧
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

            console.error("Vidiana:", error);

            if (result) {
                result.style.display = "block";
                result.innerHTML =
                    "<p>❌ تعذر إنشاء الفيديو.</p>" +
                    "<p>" +
                    (error.message || "حدث خطأ.") +
                    "</p>";
            }

        } finally {

            if (button) {
                button.disabled = false;
                button.textContent = "🚀 إنشاء الفيديو";
            }
        }
    }

    async function getVideo(eventId) {

    const response = await fetch(
        API_URL +
        "/generate-video?event_id=" +
        encodeURIComponent(eventId)
    );

    if (!response.ok)
        throw new Error(
            "تعذر متابعة إنشاء الفيديو."
        );

    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder();

    let buffer = "";

    while (true) {

        const { value, done } =
            await reader.read();

        if (done) break;

        buffer += decoder.decode(value);

        const events =
            buffer.split("\n\n");

        buffer = events.pop();

        for (const event of events) {

            for (const line of event.split("\n")) {

                if (!line.startsWith("data:"))
                    continue;

                const text =
                    line.slice(5).trim();

                if (!text || text === "[DONE]")
                    continue;

                try {

                    const data =
                        JSON.parse(text);

                    const video =
                        findVideo(data);

                    if (video) {
                        return video.url ||
                            video.path ||
                            video;
                    }

                } catch (_) {}
            }
        }
    }

    throw new Error(
        "لم يتم العثور على ملف الفيديو."
    );
}    function findVideo(value) {

        if (!value) return null;

        if (
            typeof value === "object" &&
            (value.url || value.path)
        ) {
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

                const found =
                    findVideo(value[key]);

                if (found) return found;
            }
        }

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


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const button =
                document.querySelector(
                    '#videoForm button[type="submit"]'
                );

            const form =
                document.getElementById("videoForm");

            if (button) {

                button.addEventListener(
                    "click",
                    generateVideo,
                    true
                );

            } else if (form) {

                form.addEventListener(
                    "submit",
                    generateVideo,
                    true
                );
            }

            const login =
                document.querySelector(".login-btn");

            if (login) {
                login.style.display = "none";
            }
        }
    );

})();
