const { wssinit } = require('./wss');
const { wsconnect } = require('./ws');
const { findConfig, getGlobalIp, getLocalIp, setChanges } = require('./lib/helpers');
const {onExit} = require('./lib/sys');

require('dotenv').config();

const init = () => {
  return new Promise(async(resolve, reject) => {
    const config = findConfig(true);
    setChanges()
    let host
    if(config.config.type ==="global"){
      host = await getGlobalIp(config.config.port)
    }else if(config.config.type ==="local"){
      const localIp = await getLocalIp()
      host = "ws://"+localIp+":"+config.config.port
    }
    wssinit(resolve);
    let ws = wsconnect(host);
    ws.on('error', (erfreer) => {
      console.error('WebSocket client error:', err.message);
    });
  });
};

process.on('SIGINT', onExit)

module.exports = { init };