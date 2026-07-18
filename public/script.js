/* ==========================================
   My Sunshine Roleplay - Official Script
========================================== */

const chat = document.getElementById("chat");
const prompt = document.getElementById("prompt");
const playersEl = document.getElementById("players");
const playerListEl = document.getElementById("player-list");
const copyBtn = document.querySelector(".copy-btn");

let loading = false;
let activePlayers = [];

/* ==========================================
   Utility Functions
========================================== */
function escapeHTML(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

function addMessage(message, type = "bot") {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${type}`;
    wrapper.innerHTML = `<div class="bubble">${escapeHTML(message).replace(/\n/g, "<br>")}</div>`;
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
    const typing = document.createElement("div");
    typing.className = "message bot";
    typing.id = "typing";
    typing.innerHTML = `<div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

/* ==========================================
   AI Chat System
========================================== */
async function sendMessage() {
    if (loading) return;
    const message = prompt.value.trim();
    if (!message) return;

    addMessage(message, "user");
    prompt.value = "";
    loading = true;
    showTyping();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        hideTyping();
        const data = await response.json();
        
        if (!response.ok) throw new Error();
        addMessage(data.reply);
    } catch {
        hideTyping();
        addMessage("❌ Sunshine AI sedang tidak dapat dihubungi.\nSilakan coba beberapa saat lagi.");
    }
    loading = false;
    prompt.focus();
}

if (prompt) {
    prompt.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });
}

/* ==========================================
   Server Stats & Player List System
========================================== */
async function fetchServerData() {
    try {
        const res = await fetch("/api/server");
        const data = await res.json();

        activePlayers = Array.isArray(data.players) ? data.players : [];

        if (playersEl) {
            playersEl.innerText = data.online
                ? `${activePlayers.length} / ${data.maxplayers}`
                : "Offline";
        }

        updatePlayerTable();

    } catch (err) {
        console.error(err);

        if (playersEl) playersEl.innerText = "Offline";

        activePlayers = [];
        updatePlayerTable();
    }
}

function updatePlayerTable() {
    if (!playerListEl) return;

    playerListEl.innerHTML = "";

    if (activePlayers.length === 0) {
        playerListEl.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center;">
                Tidak ada pemain online
            </td>
        </tr>`;
        return;
    }

    activePlayers.forEach(player => {

        let duration = "-";

        if (player.startTime) {
            const diff = Math.floor((Date.now() - player.startTime) / 1000);

            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;

            duration = `${h}j ${m}m ${s}d`;
        }

        playerListEl.innerHTML += `
        <tr>
            <td>${escapeHTML(player.name || "-")}</td>
            <td>${duration}</td>
            <td>${player.ping ?? 0} ms</td>
            <td>${player.score ?? 0}</td>
        </tr>`;
    });
}

/* ==========================================
   Auto Refresh Server
========================================== */

fetchServerData();

// update setiap 5 detik
setInterval(fetchServerData, 5000);

// update durasi tiap detik
setInterval(updatePlayerTable, 1000);

/* ==========================================
   UI Effects
========================================== */
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        if (window.scrollY > 40) {
            navbar.style.background = "rgba(10,10,10,.90)";
            navbar.style.boxShadow = "0 15px 30px rgba(0,0,0,.35)";
        } else {
            navbar.style.background = "rgba(10,10,10,.55)";
            navbar.style.boxShadow = "none";
        }
    }
});

// Copy IP Button
if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        const ipEl = document.querySelector(".server-ip");
        if (ipEl) {
            const ip = ipEl.innerText;
            await navigator.clipboard.writeText(ip);
            copyBtn.innerText = "✅ IP Tersalin";
            setTimeout(() => copyBtn.innerText = "📋 Copy IP", 2000);
        }
    });
}

console.clear();
console.log("%c☀️ My Sunshine Roleplay", "font-size:24px;color:#FFD700;font-weight:bold;");
console.log("%cSunshine AI Ready", "color:#00ff88;");


/* ============================
   SUPABASE CONFIG
============================ */

const SUPABASE_URL = "https://yohbzbcfrjgljeazyeyz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oVfjyPl_-36k-ANn3aAq8g_aY5gb18T";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* ============================
   ELEMENT
============================ */

const form = document.getElementById("postForm");
const text = document.getElementById("text");
const image = document.getElementById("image");
const btn = document.getElementById("submitBtn");

const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");

/* ============================
   PREVIEW IMAGE
============================ */

image.addEventListener("change", () => {

    const file = image.files[0];

    if (!file) return;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    if (placeholder)
        placeholder.style.display = "none";

});

/* ============================
   POST
============================ */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const file = image.files[0];

    if (!file) {
        alert("Pilih gambar terlebih dahulu.");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = "⏳ Mengunggah...";

    try {

        /* Nama file unik */

        const fileName =
            Date.now() +
            "_" +
            Math.random().toString(36).substring(2) +
            "." +
            file.name.split(".").pop();

        /* Upload ke Storage */

        const { error: uploadError } = await supabase.storage
            .from("posts")
            .upload(fileName, file);

        if (uploadError)
            throw uploadError;

        /* Ambil URL gambar */

        const {
            data: { publicUrl }
        } = supabase.storage
            .from("posts")
            .getPublicUrl(fileName);

        /* Simpan ke Database */

        const { error: insertError } = await supabase
            .from("posts")
            .insert([
                {
                    text: text.value,
                    image: publicUrl,
                    created_at: new Date().toISOString()
                }
            ]);

        if (insertError)
            throw insertError;

        alert("Postingan berhasil dibuat!");

        window.location.href = "index.html";

    } catch (err) {

        console.error(err);

        alert("Gagal membuat postingan.");

    }

    btn.disabled = false;
    btn.innerHTML = "🚀 Posting";

});

// ===============================
// Preview Gambar
// ===============================

file.addEventListener("change", () => {

    preview.innerHTML = "";

    const f = file.files[0];

    if (!f) return;

    const maxSize = 10 * 1024 * 1024;

    if (f.size > maxSize) {

        alert("Ukuran gambar maksimal 10 MB.");

        file.value = "";

        return;

    }

    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowed.includes(f.type)) {

        alert("Format gambar harus JPG, PNG, atau WEBP.");

        file.value = "";

        return;

    }

    const url = URL.createObjectURL(f);

    preview.innerHTML = `
        <img src="${url}" alt="Preview">
        <div class="info">${f.name}</div>
    `;

});

// ===============================
// Submit Form
// ===============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Mengirim...";

    const data = new FormData(form);

    try {

        const response = await fetch("/api/feedback", {

            method: "POST",
            body: data

        });

        const result = await response.json();

        if (response.ok && result.success) {

            alert("✅ Terima kasih! Kritik & Saran berhasil dikirim.");

            form.reset();

            preview.innerHTML = "";

        } else {

            alert(result.message || "Gagal mengirim kritik & saran.");

        }

    } catch (err) {

        console.error(err);

        alert("❌ Tidak dapat terhubung ke server.");

    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = "💡 Kirim Kritik & Saran";

});