const samp = require("samp-query");

/**
 * Query Server SA-MP
 * @param {string} host
 * @param {number} port
 * @returns {Promise<Object>}
 */
function querySamp(host, port) {
    return new Promise((resolve, reject) => {

        samp(
            {
                host,
                port,
                timeout: 5000
            },
            (error, response) => {

                if (error) {
                    console.error("SA-MP QUERY ERROR:", error);
                    return reject(error);
                }

                // Debug hasil query
                console.log("===== SA-MP RESPONSE =====");
                console.log(response);
                console.log("==========================");

                // Ambil jumlah player dari beberapa kemungkinan field
                const players =
                    response.online ??
                    response.players ??
                    response.playerCount ??
                    0;

                resolve({
                    online: true,
                    hostname: response.hostname || "Unknown Server",
                    gamemode: response.gamemode || "",
                    language: response.language || "",
                    players: players,
                    maxplayers: response.maxplayers || response.maxPlayers || 0
                });
            }
        );

    });
}

module.exports = querySamp;