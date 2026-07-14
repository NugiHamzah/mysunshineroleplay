require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const querySamp = require("./samp");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ==========================================
   SA-MP SERVER STATUS
========================================== */

app.get("/api/server", async (req, res) => {

    try {

        const server = await querySamp(
            "139.99.6.217",
            7782
        );

        console.log("[SA-MP]", server);

        res.json(server);

    } catch (err) {

        console.error("[SA-MP ERROR]", err);

        res.json({
            online: false,
            hostname: "Offline",
            players: 0,
            maxplayers: 0
        });

    }

});

/* ==========================================
   UPDATE PENGUMUMAN
========================================== */

app.post("/update-pengumuman", (req, res) => {

    try {

        const { message } = req.body;

        fs.writeFileSync(
            path.join(__dirname, "public", "pengumuman_data.txt"),
            message || "",
            "utf8"
        );

        res.json({
            success: true,
            message: "Pengumuman berhasil diperbarui."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

/* ==========================================
   SUNSHINE AI
========================================== */

app.post("/api/chat", async (req, res) => {

    const { message } = req.body;

    if (!process.env.GROQ_API_KEY) {

        return res.status(500).json({
            reply: "GROQ_API_KEY belum diatur."
        });

    }

    try {

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "user",
                            content: message
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        res.json({
            reply: data.choices[0].message.content
        });

    } catch (err) {

        console.error("[AI ERROR]", err);

        res.status(500).json({
            reply: "Sunshine AI sedang bermasalah."
        });

    }

});

/* ==========================================
   HOME
========================================== */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, () => {

    console.clear();

    console.log(`
==============================================
☀️ My Sunshine Roleplay
==============================================
Status : Running
Port   : ${PORT}
SA-MP  : 139.99.6.217:7782
==============================================
API :
http://localhost:${PORT}/api/server
==============================================
`);

});