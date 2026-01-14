const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(cors());

// ---------- SETTINGS ----------
const USER_ID = process.env.USER_ID || "1319567972335091773";
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
// ------------------------------

let profileCache = {
    username: "Loading...",
    displayName: "Loading...",
    avatar: "",
    updated: 0,
    status: "offline",
    activity: "None"
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// Discord.js v15+
client.once("clientReady", () => {
    console.log(`Bot logged in as ${client.user.tag}`);

    async function updateProfile() {
        try {
            // Fetch user
            const user = await client.users.fetch(USER_ID, { force: true });

            // Try to fetch member from any guild the bot is in
            let member = null;
            for (const guild of client.guilds.cache.values()) {
                try {
                    member = await guild.members.fetch(USER_ID);
                    if (member) break;
                } catch {}
            }

            // Activity parsing
            let activity = "None";
            if (member?.presence?.activities?.length) {
                activity = member.presence.activities.map(a => {
                    switch (a.type) {
                        case 0: return `Playing ${a.name}`;
                        case 2: return `Listening to ${a.name}`;
                        case 3: return `Watching ${a.name}`;
                        case 4: return a.state ? `Custom: ${a.state}` : "Custom Status";
                        default: return a.name;
                    }
                }).join(", ");
            }

            profileCache = {
                username: user.username,
                displayName: user.globalName || member?.displayName || user.username,
                avatar: user.displayAvatarURL({ extension: "png", size: 256 }),
                updated: Date.now(),
                status: member?.presence?.status || "offline",
                activity
            };

            console.log(
                "Profile updated:",
                profileCache.displayName,
                profileCache.status,
                profileCache.activity
            );
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
