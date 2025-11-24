const express = require("express");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(cors()); // allow website to fetch JSON

// ---------- SETTINGS ----------
const USER_ID = process.env.USER_ID || "1319567972335091773"; 
const BOT_TOKEN = process.env.BOT_TOKEN; // set this in Render env variables
const PORT = process.env.PORT || 3000;
// ------------------------------

let profileCache = {
    username: "Loading...",
    avatar: "",
    tag: "",
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

// Discord.js v15+ uses clientReady instead of ready
client.on("clientReady", () => {
    console.log(`Bot logged in as ${client.user.tag}`);

    async function updateProfile() {
        try {
            const user = await client.users.fetch(USER_ID, { force: true });
            const member = await client.guilds.cache.first()?.members.fetch(USER_ID).catch(()=>null);

            let activity = "None";
            if (member?.presence?.activities?.length) {
                activity = member.presence.activities.map(a => {
                    if (a.type === 0) return `Playing ${a.name}`;
                    if (a.type === 2) return `Listening to ${a.name}`;
                    if (a.type === 3) return `Watching ${a.name}`;
                    if (a.type === 4) return `Custom: ${a.state}`;
                    return a.name;
                }).join(", ");
            }

            profileCache = {
                username: user.username,
                avatar: user.displayAvatarURL({ extension: "png", size: 256 }),
                tag: `${user.username}`,
                updated: Date.now(),
                status: member?.presence?.status || "offline",
                activity
            };

            console.log("Profile updated:", profileCache.username, profileCache.status, profileCache.activity);
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
