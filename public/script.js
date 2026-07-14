/* ==========================================
   My Sunshine Roleplay - Official Script
========================================== */

const chat = document.getElementById("chat");
const prompt = document.getElementById("prompt");
const playersEl = document.getElementById("players");

let loading = false;

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

// Event Listener untuk tombol Enter
if (prompt) {
    prompt.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });
}

/* ==========================================
   Server Stats System
========================================== */
async function getPlayers() {
    if (!playersEl) return;
    try {
        const res = await fetch("/api/server");
        const data = await res.json();
        playersEl.innerText = data.online ? `${data.players} / ${data.maxplayers}` : "Offline";
    } catch (e) {
        playersEl.innerText = "Offline";
    }
}

// Jalankan dan Update setiap 30 detik
getPlayers();
setInterval(getPlayers, 30000);

/* ==========================================
   UI Effects
========================================== */
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 40) {
        navbar.style.background = "rgba(10,10,10,.90)";
        navbar.style.boxShadow = "0 15px 30px rgba(0,0,0,.35)";
    } else {
        navbar.style.background = "rgba(10,10,10,.55)";
        navbar.style.boxShadow = "none";
    }
});

// Copy IP Button
const copyBtn = document.querySelector(".copy-btn");
if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        const ip = document.querySelector(".server-ip").innerText;
        await navigator.clipboard.writeText(ip);
        copyBtn.innerText = "✅ IP Tersalin";
        setTimeout(() => copyBtn.innerText = "📋 Copy IP", 2000);
    });
}

console.clear();
console.log("%c☀️ My Sunshine Roleplay", "font-size:24px;color:#FFD700;font-weight:bold;");
console.log("%cSunshine AI Ready", "color:#00ff88;");