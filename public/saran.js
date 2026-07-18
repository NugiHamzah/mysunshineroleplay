const express = require("express");
const axios = require("axios");
const multer = require("multer");

const app = express();

const upload = multer({
    storage: multer.memoryStorage()
});

const WEBHOOK_URL = "https://discord.com/api/webhooks/1526011757594935450/MqSk8SxGFVswHoW1EdDKtsLasSeMng-4zUo11ByCP0aJaN9Rz4lWgB5EcAnBp_rjJRuJ";

app.post("/api/feedback", upload.single("lampiran"), async (req, res) => {

    try {

        const {
            ucp,
            character,
            kategori,
            judul,
            pesan
        } = req.body;

        const embed = {
            title: "💡 Kritik & Saran Baru",
            color: 0xFFD700,
            fields: [
                {
                    name: "👤 Nama UCP",
                    value: ucp || "-",
                    inline: true
                },
                {
                    name: "🎮 Character",
                    value: character || "-",
                    inline: true
                },
                {
                    name: "📂 Kategori",
                    value: kategori || "-",
                    inline: true
                },
                {
                    name: "📝 Judul",
                    value: judul || "-",
                    inline: false
                },
                {
                    name: "💬 Isi Kritik / Saran",
                    value: pesan || "-",
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "My Sunshine Roleplay"
            }
        };

        await axios.post(WEBHOOK_URL, {
            embeds: [embed]
        });

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});