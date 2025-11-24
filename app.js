const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(cors()); // allow all websites to load your API

// ---------- SETTINGS ----------
const USER_ID = "1319567972335091773"; 
const BOT_TOKEN = process.env.BOT_TOKEN; // Render uses env variables
const PORT = process.env.PORT || 3000;
// ------------------------------

let profileCache = {
    username: "Loading...",
    avatar: "",
    tag: "",
    updated: 0
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// NEW EVENT NAME FOR DISCORD.JS v15+
client.on("clientReady", () => {
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
    setInterval(updateProfile, 10000);
});

client.login(BOT_TOKEN);

// API endpoint
app.get("/profile.json", (req, res) => {
    res.json(profileCache);
});

app.listen(PORT, () => {
    console.log(`Profile API running on port ${PORT}`);
});
