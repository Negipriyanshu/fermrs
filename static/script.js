// /* =========================
//    DOM Elements
// ========================= */

// const cameraBtn = document.getElementById("cameraBtn");
// const uploadBtn = document.getElementById("uploadBtn");
// const imageUpload = document.getElementById("imageUpload");

// const previewImage = document.getElementById("previewImage");
// const video = document.getElementById("video");
// const canvas = document.getElementById("canvas");
// const analyzeBtn = document.getElementById("analyzeBtn");
// const resultBox = document.getElementById("resultBox");

// let stream = null;


// /* =========================
//    Camera Logic
// ========================= */

// if (cameraBtn) {
//     cameraBtn.addEventListener("click", async () => {
//         try {
//             stream = await navigator.mediaDevices.getUserMedia({ video: true });

//             video.srcObject = stream;
//             video.style.display = "block";
//             previewImage.style.display = "none";

//         } catch (err) {
//             alert("Camera access denied 😢");
//         }
//     });
// }


// /* =========================
//    Upload Logic
// ========================= */

// if (uploadBtn) {
//     uploadBtn.addEventListener("click", () => {
//         imageUpload.click();
//     });
// }

// imageUpload.addEventListener("change", () => {
//     const file = imageUpload.files[0];
//     if (!file) return;

//     const reader = new FileReader();

//     reader.onload = function (e) {
//         previewImage.src = e.target.result;
//         previewImage.style.display = "block";
//         video.style.display = "none";
//     };

//     reader.readAsDataURL(file);
// });


// /* =========================
//    Analyze + Songs
// ========================= */

// if (analyzeBtn) {
//     analyzeBtn.addEventListener("click", async () => {

//     console.log("STEP 1: Button clicked");

//     let imageData = previewImage.src;
//     console.log("STEP 2: Image:", imageData);

//     try {
//         console.log("STEP 3: Calling emotion API");

//         const response = await fetch("/api/detect-emotion/", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ image: imageData })
//         });

//         console.log("STEP 4: Emotion API returned");

//         const data = await response.json();
//         console.log("STEP 5: Emotion data:", data);

//         // 🔥 FORCE emotion (even if undefined)
//         const emotion = data.emotion || "happy";

//         console.log("STEP 6: Calling songs API with:", emotion);

//         const songRes = await fetch("/api/recommend-songs/", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ emotion: emotion })
//         });

//         console.log("STEP 7: Songs API returned");

//         const songData = await songRes.json();
//         console.log("STEP 8: Songs data:", songData);

//         let html = `
//             <p>Emotion: ${emotion}</p>
//             <h3>🎵 Songs</h3>
//         `;

//         if (songData.songs) {
//             songData.songs.forEach(song => {
//                 html += `<p>${song.track_name}</p>`;
//             });
//         }

//         resultBox.innerHTML = html;

//     } catch (err) {
//         console.error("ERROR:", err);
//     }
// });
// }

/* =========================
   DOM Elements
========================= */

const cameraBtn = document.getElementById("cameraBtn");
const uploadBtn = document.getElementById("uploadBtn");
const imageUpload = document.getElementById("imageUpload");

const previewImage = document.getElementById("previewImage");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("resultBox");

let stream = null;


/* =========================
   Camera Logic
========================= */

if (cameraBtn) {
    cameraBtn.addEventListener("click", async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });

            video.srcObject = stream;
            video.style.display = "block";
            previewImage.style.display = "none";

        } catch (err) {
            alert("Camera access denied 😢");
            console.error(err);
        }
    });
}


/* =========================
   Upload Logic
========================= */

if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
        imageUpload.click();
    });
}

if (imageUpload) {
    imageUpload.addEventListener("change", () => {
        const file = imageUpload.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
            video.style.display = "none";
        };

        reader.readAsDataURL(file);
    });
}


/* =========================
   Analyze Emotion + Songs
========================= */

if (analyzeBtn) {
    analyzeBtn.addEventListener("click", async () => {

        let imageData = previewImage.src;

        if (!imageData || !imageData.includes("base64")) {
            alert("Upload image first 😎");
            return;
        }

        // 🔄 Loading UI
        resultBox.innerHTML = "<p>🔄 Analyzing emotion...</p>";

        try {
            /* ---------- Emotion API ---------- */
            const response = await fetch("/api/detect-emotion/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: imageData })
            });

            const data = await response.json();

            if (!data.emotion) {
                resultBox.innerHTML = "<p>❌ Emotion detection failed</p>";
                return;
            }

            const emotion = data.emotion;

            /* ---------- Songs API ---------- */
            const songRes = await fetch("/api/recommend-songs/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emotion: emotion })
            });

            const songData = await songRes.json();

            /* ---------- UI Display ---------- */
            let html = `
                <h2>Emotion: ${emotion}</h2>
                <p>Confidence: ${(data.confidence * 100).toFixed(2)}%</p>
                <h3>🎵 Recommended Songs</h3>
            `;

            if (!songData.songs || songData.songs.length === 0) {
                html += "<p>No songs found</p>";
            } else {
                songData.songs.forEach(song => {
                    html += `
                        <div class="song">
                            🎶 ${song.track_name}<br>
                            <small>${song.artist_name}</small>
                        </div>
                    `;
                });
            }

            resultBox.innerHTML = html;

        } catch (error) {
            console.error(error);
            resultBox.innerHTML = "<p>❌ Something went wrong</p>";
        }
    });
}