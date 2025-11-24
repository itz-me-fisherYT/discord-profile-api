const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// ------------------------------
// Discord Profile API Server
// ------------------------------
const app = express();

// -------- ENVIRONMENT VARIABLES --------
// These come from Render (Environment → Environment Variables)
const USER_ID = process.env.DISCORD_USER_ID; // your Discord ID
const BOT_TOKEN = process.env.DISCORD_TOKEN; // your bot token
const PORT = process.env.PORT || 3000;
// ---------------------------------------

let profileCache = {
    username: "Loading...",
    avatar: "",
    tag: "",
    updated: 0
};

// ------------------------------
// Discord Bot
// ------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

client.on("ready", async () => {
    console.log(`Bot logged in as ${client.user.tag}`);

    async function updateProfile() {
        try {
            const user = await client.users.fetch(USER_ID, { force: true });

            profileCache = {
                username: user.username,
                avatar: user.displayAvatarURL({ extension: "png", size: 256 }),
                tag: `${user.username}`,
                updated: Date.now()
            };

            console.log("Profile updated:", profileCache.username);
        } catch (err) {
            console.error("Error updating profile:", err.message);
        }
    }

    updateProfile();
    setInterval(updateProfile, 10000); // updates every 10s
});

client.login(BOT_TOKEN);

// ------------------------------
// API Endpoint
// ------------------------------
app.get("/profile.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(profileCache, null, 2));
});

// ------------------------------
// Start Server
// ------------------------------
app.listen(PORT, () => {
    console.log(`Profile API running on port ${PORT}`);
});
