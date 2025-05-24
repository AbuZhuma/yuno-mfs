const { wssinit } = require('./wss');
const { wsconnect } = require('./ws');
const { findConfig, getGlobalIp, getLocalIp } = require('./lib/helpers');
const {onExit} = require('./lib/sys');

require('dotenv').config();

const init = () => {
  return new Promise(async(resolve, reject) => {
    const config = findConfig(true)
    let host
    let tonnel
    if(config.config.type ==="global"){
      tonnel = await getGlobalIp(config.config.port)
      host = tonnel.url
    }else if(config.config.type ==="local"){
      const localIp = await getLocalIp()
      host = "ws://"+localIp+":"+config.config.port
    }
    let ws = wsconnect(host);
    wssinit(resolve);
    ws.on("close", () => {
      tonnel.close()
    })
    ws.on('error', (erfreer) => {
      console.error('WebSocket client error:', erfreer.message);
    });
  });
};

process.on('SIGINT', onExit)

module.exports = { init };