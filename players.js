const playerListEl = document.getElementById("player-list");

let activePlayers = [];

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

function formatDuration(seconds) {

    seconds = Number(seconds) || 0;

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0)
        return `${days} Hari ${hours} Jam`;

    if (hours > 0)
        return `${hours} Jam ${minutes} Menit`;

    if (minutes > 0)
        return `${minutes} Menit ${secs} Detik`;

    return `${secs} Detik`;
}

async function fetchPlayers() {

    try {

        const res = await fetch("/api/server");
        const data = await res.json();

        activePlayers = Array.isArray(data.players)
            ? data.players
            : [];

        updateTable();

    } catch (err) {

        console.error(err);

        playerListEl.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center;">
                Server Offline
            </td>
        </tr>`;
    }

}

function updateTable() {

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

        playerListEl.innerHTML += `
            <tr>
                <td>${escapeHTML(player.name)}</td>
                <td>${formatDuration(player.loginDuration)}</td>
                <td>${player.ping} ms</td>
                <td>${player.score}</td>
            </tr>
        `;

    });

}

fetchPlayers();

setInterval(fetchPlayers, 5000);