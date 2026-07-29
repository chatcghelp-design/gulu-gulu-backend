/**
 * Keep-Alive Utility for Render Free Tier
 * Pings the server every 14 minutes to prevent it from sleeping.
 * Render free tier sleeps after 15 minutes of inactivity.
 */

const https = require('https');
const http = require('http');

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

function startKeepAlive() {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;

    if (!serverUrl) {
        console.log('[KeepAlive] ⚠️  No RENDER_EXTERNAL_URL set. Keep-alive disabled.');
        return;
    }

    console.log(`[KeepAlive] ✅ Started. Pinging ${serverUrl} every 14 minutes.`);

    setInterval(() => {
        const url = new URL('/health', serverUrl);
        const requester = url.protocol === 'https:' ? https : http;

        const req = requester.get(url.href, (res) => {
            console.log(`[KeepAlive] 🏓 Ping sent → Status: ${res.statusCode} at ${new Date().toISOString()}`);
        });

        req.on('error', (err) => {
            console.error(`[KeepAlive] ❌ Ping failed: ${err.message}`);
        });

        req.end();
    }, PING_INTERVAL_MS);
}

module.exports = { startKeepAlive };
