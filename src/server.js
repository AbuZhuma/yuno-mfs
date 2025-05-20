const { wssinit } = require('./wss');
const { wsconnect } = require('./ws');
const { findConfig, getGlobalIp, getLocalIp } = require('./lib/helpers');
const {onExit} = require('./lib/sys');
const { starter } = require('./starter');

require('dotenv').config();

const init = () => {
  return new Promise(async(resolve, reject) => {
    const config = findConfig(true)
    let host
    if(config.config.type ==="global"){
      host = await getGlobalIp(config.config.port)
    }else if(config.config.type ==="local"){
      const localIp = await getLocalIp()
      host = "ws://"+localIp+":"+config.config.port
    }
    let ws = wsconnect(host);
    wssinit(resolve);
    ws.on('error', (erfreer) => {
      console.error('WebSocket client error:', err.message);
    });
  });
};

process.on('SIGINT', onExit)

module.exports = { init };