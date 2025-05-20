const WebSocket = require('ws');
const { wsurl } = require('../configs');
const { roomates, settings } = require('./globals');
const { findConfig, writeConfigs } = require('./lib/helpers');
const { sendHash } = require('./lib/sys');
const configs = findConfig()
process.stdout.write('\x1B[?1049h')
let users = []
function drawUI() {
    const width = process.stdout.columns
    const box = [
        '┌──────────────┐',
        `│ Online: ${users.length}`,
        ...users.map(u => `│ ${u.split("-")[0]}`),
        '└──────────────┘'
    ]
    console.log('\x1B[2J\x1B[0f')
    box.forEach((line, i) => {
        process.stdout.cursorTo(width - 18, i)
        process.stdout.write(line)
    })

    process.stdout.cursorTo(0, box.length + 1)
}
process.on('exit', () => process.stdout.write('\x1B[?1049l'))

const initOtherUser = (ip, id, sendChanges = false, count = 0) => {
    const ows = new WebSocket(ip);
    let pingInterval;
    let reconnectTimeout;
    const cleanup = () => {
        clearInterval(pingInterval);
        clearTimeout(reconnectTimeout);
        roomates.delete(id);
        users = users.filter((el) => el !== id)
        drawUI()
    };
    roomates.set(id, { ip, ws: ows });
    ows.on("open", () => {
        if (sendChanges) {
            sendHash(ows, configs.user_id);
        }
        !users.includes(id) && users.push(id)
        drawUI()
        pingInterval = setInterval(() => {
            if (ows.readyState === WebSocket.OPEN) {
                ows.ping();
            }
        }, 30000);
    });

    ows.on("close", (code) => {
        cleanup();
        if (count < 2) {
            reconnectTimeout = setTimeout(() => {
                initOtherUser(ip, id, false, count + 1);
                count++
            }, 5000);
        }
    });

    ows.on("error", (err) => {
        cleanup();
    });

    ows.on('pong', () => {
        clearTimeout(reconnectTimeout);
    });
};

const wsconnect = (host) => {
    try {
        const ws = new WebSocket(wsurl);
        ws.on("message", (data) => {
            try {
                const body = JSON.parse(data);
                if (body.type === "roomates" && body.users) {
                    users = body.users.map((el) => el.id)
                    drawUI()
                    body.users.forEach((el) => {
                        initOtherUser(el.ip, el.id);
                    });
                } else if (body.type === "new_user") {
                    initOtherUser(body.user.ip, body.user.id, true);
                } else if (body.type === "err-password") {
                    console.log("⛔ " + body.err);
                    roomates.clear();
                } else if (body.type === "settings") {
                    body.settings.map((el) => {
                        settings.set(el, true)
                    })
                } else if (body.type === "free") {
                    writeConfigs({ password: "free" })
                } else {
                    console.log(body);
                }
            } catch (err) {
                console.error("Error processing message:", err);
            }
        });

        ws.on("open", () => {
            try {
                const msg = {
                    client: "mfs",
                    type: "get_roomates",
                    configs: { ...configs, ip: host }
                };
                ws.send(JSON.stringify(msg));
            } catch (err) {
                console.error("Error sending initial message:", err);
            }
        });

        ws.on("error", (err) => {
            console.error("Main WebSocket error:", err);
        });

        return ws;
    } catch (err) {
        console.error("Error creating WebSocket connection:", err);
        throw err;
    }
};

module.exports = { wsconnect, initOtherUser };