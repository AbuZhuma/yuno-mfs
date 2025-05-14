const WebSocket = require('ws');
const { watcher, watcher_methods } = require('./watcher');
const { findConfig, ensureDirectoryExists, setChanges } = require('./lib/helpers');
const { checkCode } = require('./lib/fs');
const { changesHash } = require('./globals');
const { loopChanges, updateToHash, checkTodo } = require('./lib/sys');
const { logingMessage } = require('./lib/messanger');
const fs = require('fs').promises;

const wssinit = async (resolve) => {
    const { port, show_logs } = await findConfig();
    const wss = new WebSocket.Server({
        port,
        noDelay: true,
        maxPayload: 2 * 1024 * 1024,
        perMessageDeflate: {
            zlibDeflateOptions: {
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
            clientNoContextTakeover: true,
            serverNoContextTakeover: true
        }
    });
    wss.on('error', (err) => {
        console.error('WebSocket Server error:', err);
    });

    wss.on('listening', () => {
        watcher.on('change', watcher_methods.change);
        watcher.on("addDir", watcher_methods.addDir);
        watcher.on("add", watcher_methods.change);
        watcher.on("unlink", watcher_methods.unlink);
        watcher.on("unlinkDir", watcher_methods.unlinkDir);
        watcher.on("all", watcher_methods.saveHash)

        wss.on('connection', (ws) => {
            ws.on('message', async (data) => {
                try {
                    const body = JSON.parse(data);
                    switch (body.type) {
                        case 'watcher':
                            if (show_logs) {
                                console.log("📦 -- " + body.method + " " + body.path);
                            }
                            if (body.method === "writeFile") {
                                await handleFileOperation(body.type, body.method, body.path, body.content);
                            } else {
                                await handleFileOperation(body.type, body.method, body.path, "");
                            }
                            break;
                        case "changes":                            
                            loopChanges(body)
                            break
                        case "message":
                            logingMessage(body.message)
                            break;
                        case "backChanges":
                            updateToHash(body.changes)
                            break
                        case 'notice':
                            console.log(body.msg);
                            break;
                        default:
                            console.warn('Unknown message type:', body.type);
                    }
                } catch (err) {
                    console.error('⛔ Error processing message:', err);
                }
            });
        });

        resolve();
    });

    return wss;
};

const handleFileOperation = async (type, method, path, content = "") => {
    try {
        const configs = await findConfig()
        watcher.unwatch(path);
        const timeStamp = Date.now()
        changesHash.set(path, { type: method, path: path, content: content, time: Number(String(timeStamp).slice(0, 9)) })
        if (method === "writeFile") {
            await ensureDirectoryExists(path, watcher)
            await fs[method](path, content, { mode: 0o755 });
            await checkTodo(content, configs.user_id.split("-")[0])
            await checkCode(path, content)
        } else if (method === "unlink") {
            try {
                await fs.unlink(path, { force: true });
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error(`⛔ Error in unlink operation:`, err);
                }
            }
        } else if (method === "rmdir") {
            await fs.rm(path, { recursive: true, force: true });
        } else {
            await fs[method](path, { force: true });
        }
        watcher.add(path);
    } catch (err) {
    }
};

module.exports = { wssinit, handleFileOperation };