const playerListEl = document.getElementById("player-list");

let activePlayers = [];

function escapeHTML(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

async function fetchPlayers() {
    try {
        const res = await fetch("/api/server");
        const data = await res.json();

        activePlayers = data.players || [];
        updateTable();

    } catch (err) {
        console.error(err);

        playerListEl.innerHTML = `
        <tr>
            <td colspan="4">Server Offline</td>
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
            <td>${escapeHTML(player.name)}</td>
            <td>${duration}</td>
            <td>${player.ping}</td>
            <td>${player.score}</td>
        </tr>`;
    });

}

fetchPlayers();

setInterval(fetchPlayers, 5000);
setInterval(updateTable, 1000);