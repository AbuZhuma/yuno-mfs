const fs = require('fs').promises;
const path = require('path');

async function clearDirectory(directoryPath) {
    try {
      await fs.rm(directoryPath, { recursive: true, force: true });
    } catch (err) {
        return
    }
}

module.exports = {clearDirectory}