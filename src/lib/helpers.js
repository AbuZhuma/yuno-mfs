const os = require('os');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const localtunnel = require('localtunnel');
const { changesHash } = require('../globals');


function setChanges() {
  const filePath = 'yuno.changes.json';

  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    if (!content.trim()) {
      fs.writeFileSync(filePath, '{}');
      return;
    }
    const changes = JSON.parse(content);
    for (const [key, value] of Object.entries(changes)) {
      changesHash.set(key, value);
    }

  } catch (error) {
    console.error('Ошибка загрузки изменений:', error);
    fs.writeFileSync(filePath, '{}');
  }
}
function isFileExist(path) {
    return fs.existsSync(path)
}
function ensureFileExistsSync(filePath, initialContent = '', createFolders = true) {
  try {
    const normalizedPath = path.normalize(filePath);

    if (fs.existsSync(normalizedPath)) {
      return false;
    }

    if (createFolders) {
      const dir = path.dirname(normalizedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    fs.writeFileSync(normalizedPath, initialContent);
    return true;
  } catch (error) {
    console.error(`Ошибка при работе с файлом ${filePath}:`, error);
    throw error;
  }
}

function checkCodeErrors(filePath, command) {
  return new Promise((resolve) => {
    exec(`${command} ${filePath}`, (error, stdout, stderr) => {
      resolve(!(error || stderr));
    });
  });
}

const getGlobalIp = async (name = "unknown") => {
  const { port } = findConfig();
  const tunnel = await localtunnel({ port: port, subdomain: name });
  tunnel.url = "wss://" + tunnel.url.split("//")[1];
  return tunnel.url;
};

const getLocalIp = () => {
  const nets = os.networkInterfaces();
  let fallbackIp = null;

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4') {
        if (!net.internal) {
          return net.address;
        }
        fallbackIp = net.address;
      }
      else if (net.family === 4) {
        if (!net.internal) {
          return net.address;
        }
        fallbackIp = net.address;
      }
    }
  }

  return fallbackIp || '127.0.0.1';
};

async function ensureDirectoryExists(filePath, watcher) {
  const dirs = filePath.split(path.sep).slice(0, -1);
  let currentPath = '';
  for (const dir of dirs) {
    currentPath = path.join(currentPath, dir);
    if (!fs.existsSync(currentPath)) {
      try {
        watcher.unwatch(currentPath);
        await fs.promises.mkdir(currentPath);
        watcher.add(currentPath);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
    }
  }
}


const userProjectRoot = process.cwd();

function findConfig(pathOnly = false) {
  const configPaths = [
    path.join(userProjectRoot, 'yuno.json'),
    path.join(userProjectRoot, 'yuno', 'yuno.json'),
    path.join(__dirname, '..', 'yuno.json')
  ];
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (!config.type) {
          config.type = "global"
        } else if (config.type !== "global" && config.type !== "local") {
          config.type = "global"
        }
        if (!config.port) {
          config.port = 5005
        }
        if (!config.show_logs) {
          config.show_logs = true
        }
        if (pathOnly) return { configPath, config };
        return config;
      } catch (e) {
        console.error('⚠️ Error finding configs:', e);
        return null;
      }
    }
  }

  console.log('⚠️ No configs found');
  return null;
}
async function writeConfigs(changes) {
  const newConfigs = await findConfig(true)
  const config = { ...newConfigs.config, ...changes }
  fs.writeFileSync(newConfigs.configPath, JSON.stringify(config))
}


module.exports = { getLocalIp, isFileExist, getGlobalIp, findConfig, ensureDirectoryExists, checkCodeErrors, setChanges, ensureFileExistsSync, writeConfigs };