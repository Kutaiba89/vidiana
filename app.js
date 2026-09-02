document.addEventListener("DOMContentLoaded", function () {

    var form = document.getElementById("videoForm");
    var result = document.getElementById("result");
    var resultText = document.getElementById("resultText");

    if (!form || !result || !resultText) {
        console.error("Vidiana: عناصر النموذج غير موجودة");
        return;
    }

    window.login = function () {
        alert("تسجيل الدخول في فيديانا قيد التطوير.");
    };

    function getValue(id) {
        var element = document.getElementById(id);

        if (!element) {
            return "";
        }

        return element.value || "";
    }

    function getDurationCount(duration) {

        if (duration === "30") return 4;
        if (duration === "60") return 6;
        if (duration === "120") return 8;
        if (duration === "180") return 10;

        return 4;
    }

    function createButton(text) {

        var button = document.createElement("button");

        button.type = "button";
        button.textContent = text;

        button.style.cssText = `
            display:block;
            width:100%;
            margin-top:18px;
            padding:16px;
            border:none;
            border-radius:14px;
            background:#30384d;
            color:white;
            font-size:20px;
            font-weight:bold;
            cursor:pointer;
        `;

        return button;
    }

    function createVideoArea() {

        var oldArea =
            document.getElementById("vidianaVideoArea");

        if (oldArea) {
            oldArea.remove();
        }

        var area =
            document.createElement("div");

        area.id = "vidianaVideoArea";

        area.style.cssText = `
            margin-top:25px;
            padding:20px;
            background:white;
            border-radius:20px;
            box-shadow:0 8px 30px rgba(0,0,0,.08);
            text-align:center;
        `;

        result.parentNode.insertBefore(
            area,
            result.nextSibling
        );

        return area;
    }

    function drawRoundedRect(
        ctx,
        x,
        y,
        width,
        height,
        radius
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x + radius,
            y
        );

        ctx.lineTo(
            x + width - radius,
            y
        );

        ctx.quadraticCurveTo(
            x + width,
            y,
            x + width,
            y + radius
        );

        ctx.lineTo(
            x + width,
            y + height - radius
        );

        ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height
        );

        ctx.lineTo(
            x + radius,
            y + height
        );

        ctx.quadraticCurveTo(
            x,
            y + height,
            x,
            y + height - radius
        );

        ctx.lineTo(
            x,
            y + radius
        );

        ctx.quadraticCurveTo(
            x,
            y,
            x + radius,
            y
        );

        ctx.closePath();
    }

    function drawScene(
        ctx,
        canvas,
        sceneNumber,
        totalScenes,
        idea
    ) {

        var width = canvas.width;
        var height = canvas.height;

        var colors = [
            ["#eef4ff", "#dce8ff"],
            ["#fff5dc", "#ffe8ad"],
            ["#e9fff2", "#c9f5d9"],
            ["#f7eaff", "#e6ceff"]
        ];

        var pair =
            colors[
                (sceneNumber - 1) % colors.length
            ];

        var gradient =
            ctx.createLinearGradient(
                0,
                0,
                width,
                height
            );

        gradient.addColorStop(
            0,
            pair[0]
        );

        gradient.addColorStop(
            1,
            pair[1]
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        /*
         * عنوان فيديانا
         */

        ctx.fillStyle = "#30384d";

        ctx.font = "bold 48px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "✨ فيديانا ✨",
            width / 2,
            85
        );

        /*
         * رقم المشهد
         */

        ctx.fillStyle =
            "rgba(48,56,77,.12)";

        drawRoundedRect(
            ctx,
            50,
            120,
            width - 100,
            70,
            20
        );

        ctx.fill();

        ctx.fillStyle = "#30384d";

        ctx.font = "bold 32px Arial";

        ctx.fillText(
            "المشهد " +
            sceneNumber +
            " من " +
            totalScenes,
            width / 2,
            167
        );

        /*
         * شخصية بوبا
         */

        var centerX = width / 2;

        var centerY = 560;

        /*
         * الظل
         */

        ctx.fillStyle =
            "rgba(0,0,0,.12)";

        ctx.beginPath();

        ctx.ellipse(
            centerX,
            centerY + 260,
            190,
            45,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
         * جسم بوبا
         */

        ctx.fillStyle = "#9b6b45";

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY + 100,
            155,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
         * رأس بوبا
         */

        ctx.fillStyle = "#a8754d";

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            190,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
         * أذنا بوبا
         */

        ctx.beginPath();

        ctx.arc(
            centerX - 135,
            centerY - 125,
            55,
            0,
            Math.PI * 2
        );

        ctx.arc(
            centerX + 135,
            centerY - 125,
            55,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
         * العيون
         */

        ctx.fillStyle = "#172033";

        ctx.beginPath();

        ctx.arc(
            centerX - 65,
            centerY - 15,
            14,
            0,
            Math.PI * 2
        );

        ctx.arc(
            centerX + 65,
            centerY - 15,
            14,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
         * الأنف
         */

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY + 35,
            22,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
         * الابتسامة
         */

        ctx.strokeStyle = "#172033";

        ctx.lineWidth = 8;

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY + 35,
            65,
            0.2,
            Math.PI - 0.2
        );

        ctx.stroke();

        /*
         * نص الفكرة
         */

        var text = idea;

        if (text.length > 45) {
            text =
                text.substring(0, 45) +
                "...";
        }

        ctx.font = "bold 40px Arial";

        drawRoundedRect(
            ctx,
            55,
            930,
            width - 110,
            145,
            28
        );

        ctx.fillStyle =
            "rgba(255,255,255,.82)";

        ctx.fill();

        ctx.fillStyle = "#172033";

        ctx.fillText(
            text,
            width / 2,
            995
        );

        /*
         * النصوص التعليمية
         */

        ctx.font = "bold 34px Arial";

        var sceneTexts = [
            "هيا نتعلم مع بوبا! 🌟",
            "انظروا إلى الألوان! 🎨",
            "ما اللون الذي تراه؟ 🤔",
            "أحسنت! رائع جدًا! 🎉"
        ];

        ctx.fillText(
            sceneTexts[
                (sceneNumber - 1) %
                sceneTexts.length
            ],
            width / 2,
            1035
        );

        /*
         * شريط في الأسفل
         */

        ctx.fillStyle = "#30384d";

        drawRoundedRect(
            ctx,
            70,
            1150,
            width - 140,
            100,
            25
        );

        ctx.fill();

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 32px Arial";

        ctx.fillText(
            "Vidiana • إنشاء فيديو ذكي",
            width / 2,
            1212
        );
    }

    async function generateVideo() {

        var idea = getValue("idea");
        var category = getValue("category");
        var duration = getValue("duration");
        var style = getValue("style");
        var language = getValue("language");

        if (idea.trim() === "") {

            alert(
                "اكتب فكرة الفيديو أولًا."
            );

            return;
        }

        var durationSeconds =
            parseInt(
                duration,
                10
            );

        if (
            !durationSeconds ||
            durationSeconds < 5
        ) {
            durationSeconds = 30;
        }

        var totalScenes =
            getDurationCount(duration);

        result.hidden = false;

        resultText.textContent =
            "⏳ فيديانا بدأت إنشاء الفيديو...";

        var area =
            createVideoArea();

        var status =
            document.createElement("div");

        status.style.cssText = `
            font-size:20px;
            font-weight:bold;
            color:#30384d;
            margin-bottom:15px;
        `;

        status.textContent =
            "جاري تجهيز الفيديو...";

        area.appendChild(status);

        var canvas =
            document.createElement("canvas");

        canvas.width = 720;

        canvas.height = 1280;

        canvas.style.cssText = `
            width:100%;
            max-width:420px;
            border-radius:18px;
            display:block;
            margin:auto;
        `;

        area.appendChild(canvas);

        var ctx =
            canvas.getContext("2d");

        /*
         * التأكد من دعم تسجيل الفيديو
         */

        if (!window.MediaRecorder) {

            status.textContent =
                "متصفحك لا يدعم إنشاء الفيديو مباشرة.";

            return;
        }

        if (!canvas.captureStream) {

            status.textContent =
                "متصفحك لا يدعم تسجيل الفيديو من Canvas.";

            return;
        }

        var stream =
            canvas.captureStream(30);

        var mimeType = "";

        if (
            MediaRecorder.isTypeSupported(
                "video/webm;codecs=vp9"
            )
        ) {

            mimeType =
                "video/webm;codecs=vp9";

        } else if (
            MediaRecorder.isTypeSupported(
                "video/webm;codecs=vp8"
            )
        ) {

            mimeType =
                "video/webm;codecs=vp8";

        } else {

            mimeType =
                "video/webm";
        }

        var recorder =
            new MediaRecorder(
                stream,
                {
                    mimeType: mimeType
                }
            );

        var chunks = [];

        recorder.ondataavailable =
            function (event) {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    chunks.push(
                        event.data
                    );
                }
            };

        recorder.onstop =
            function () {

                var blob =
                    new Blob(
                        chunks,
                        {
                            type: mimeType
                        }
                    );

                var videoURL =
                    URL.createObjectURL(
                        blob
                    );

                var video =
                    document.createElement(
                        "video"
                    );

                video.controls = true;

                video.playsInline = true;

                video.src = videoURL;

                video.style.cssText = `
                    width:100%;
                    max-width:420px;
                    border-radius:18px;
                    display:block;
                    margin:20px auto;
                    background:#000;
                `;

                area.appendChild(video);

                var downloadButton =
                    createButton(
                        "⬇️ تحميل الفيديو"
                    );

                downloadButton.onclick =
                    function () {

                        var link =
                            document.createElement(
                                "a"
                            );

                        link.href =
                            videoURL;

                        link.download =
                            "Vidiana-video.webm";

                        document.body.appendChild(
                            link
                        );

                        link.click();

                        link.remove();
                    };

                area.appendChild(
                    downloadButton
                );

                status.textContent =
                    "🎉 تم إنشاء الفيديو بنجاح!";

                resultText.textContent =
                    "تم إنشاء فيديو فعلي بواسطة فيديانا. " +
                    "الفكرة: " +
                    idea +
                    " | النوع: " +
                    category +
                    " | المدة: " +
                    durationSeconds +
                    " ثانية" +
                    " | الأسلوب: " +
                    style +
                    " | اللغة: " +
                    language;

                area.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            };

        recorder.onerror =
            function () {

                status.textContent =
                    "❌ حدث خطأ أثناء إنشاء الفيديو.";

                resultText.textContent =
                    "تعذر إنشاء الفيديو. حاول مرة أخرى.";
            };

        /*
         * بدء التسجيل
         */

        recorder.start();

        var startTime =
            performance.now();

        function animate(now) {

            var elapsed =
                (now - startTime) / 1000;

            var progress =
                Math.min(
                    elapsed /
                    durationSeconds,
                    1
                );

            var scene =
                Math.min(
                    totalScenes,
                    Math.floor(
                        progress *
                        totalScenes
                    ) + 1
                );

            drawScene(
                ctx,
                canvas,
                scene,
                totalScenes,
                idea
            );

            var percent =
                Math.floor(
                    progress * 100
                );

            status.textContent =
                "🎬 إنشاء الفيديو... " +
                percent +
                "%";

            if (
                elapsed <
                durationSeconds
            ) {

                requestAnimationFrame(
                    animate
                );

            } else {

                drawScene(
                    ctx,
                    canvas,
                    totalScenes,
                    totalScenes,
                    idea
                );

                setTimeout(
                    function () {

                        if (
                            recorder.state !==
                            "inactive"
                        ) {

                            recorder.stop();
                        }

                    },
                    500
                );
            }
        }

        requestAnimationFrame(
            animate
        );
    }

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            generateVideo();
        }
    );

    console.log(
        "Vidiana VIDEO ENGINE READY"
    );

});
