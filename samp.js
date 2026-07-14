const samp = require("samp-query");

/**
 * Query Server SA-MP
 */
function querySamp(host, port) {
    return new Promise((resolve, reject) => {

        samp(
            {
                host,
                port,
                timeout: 5000
            },
            (err, response) => {

                if (err) {
                    console.error(err);
                    return reject(err);
                }

                console.log("===== SA-MP RESPONSE =====");
                console.dir(response, { depth: null });
                console.log("==========================");

                resolve({
                    online: true,

                    hostname: response.hostname || "Unknown",

                    gamemode: response.gamemode || "",

                    language: response.language || "",

                    onlinePlayers:
                        response.online ??
                        response.playerCount ??
                        (Array.isArray(response.players)
                            ? response.players.length
                            : 0),

                    maxplayers:
                        response.maxplayers ??
                        response.maxPlayers ??
                        0,

                    players: Array.isArray(response.players)
                        ? response.players
                        : []
                });

            }
        );

    });
}

module.exports = querySamp;