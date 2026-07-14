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