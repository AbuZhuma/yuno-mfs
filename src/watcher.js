const chokidar = require('chokidar');
const { watcherIgnore } = require('./lib/configs');
const fs = require("fs").promises;
const { roomates, changesHash } = require('./globals');

module.exports.watcher = chokidar.watch('./', {
      ignored: watcherIgnore,
      ignoreInitial: true,
      persistent: true,
      usePolling: false
});

module.exports.watcher_methods = {
      change: async (path) => {
            try {
                  const content = await fs.readFile(path, { encoding: 'utf-8' });
                  const message = JSON.stringify({ type: "watcher", method: 'writeFile', path, content});
                  messageSender(message)
            } catch (err) {
                  console.error('🛑 Error reading file:', err);
            }
      },
      addDir: (path) => {
            const message = JSON.stringify({ type: "watcher", method: 'mkdir', path});
            messageSender(message)
      },
      unlink: (path) => {
            const message = JSON.stringify({ type: "watcher", method: 'unlink', path});
            messageSender(message)
      },
      unlinkDir: (path) => {
            const message = JSON.stringify({ type: "watcher", method: 'rmdir', path});
            messageSender(message)
      },
      saveHash: async (type, path) => {
            let content
            let method
            if (type === "change" || type === "add") {
                  content = await fs.readFile(path)
                  method = "writeFile"
            } else if (type === "addDir") {
                  method = "mkdir"
            } else if (type === "unlink") {
                  method = "unlink"
            } else if (type === "unlinkDir") {
                  method = "rmdir"
            }
            const timeStamp = Date.now()

            const stats = {
                  type: method,
                  path: path,
                  content: content ? content.toString() : null,
                  time: Number(String(timeStamp).slice(0, 9))
            }
            changesHash.set(path, stats)
      }
}

const messageSender = (msg) => {
      roomates.forEach(({ ip, ws }) => {
            if (ws.readyState === WebSocket.OPEN) {
                  ws.send(msg, { compress: true });
            }
      });
}