const readline = require('readline');
const { findConfig } = require('./helpers');
const { roomates } = require('../globals');

const messangerInit = () => {
      const configs = findConfig()
      const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
      });
      function que() {
            rl.question("", (answer) => {
                  roomates.forEach((el) => {
                        el.ws.send(JSON.stringify({type: "message", message: `\x1b[1m\x1b[92m${configs.user_id.split("-")[0]}\x1b[0m\x1b[0m: ${answer}`}))
                  })
                  que()
            });  
      }
      que()
      return rl
}
const tokens = {
      "@":["\x1b[1m", "\x1b[0m"], 
      "#":["\x1b[91m", "\x1b[0m"]
}
    
    const logingMessage = (msg) => {
      const words = msg.split(' ');
      const result = [];
      let currentToken = null;
      let styledSegment = [];
    
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        if (!currentToken && word[0] in tokens && word.length > 1) {
          currentToken = word[0];
          styledSegment.push(word.slice(1));
          continue;
        }
        
        if (currentToken && word.endsWith(currentToken)) {
          styledSegment.push(word.slice(0, -1));
          const styledText = styledSegment.join(' ');
          result.push(tokens[currentToken][0] + styledText + tokens[currentToken][1]);
          styledSegment = [];
          currentToken = null;
          continue;
        }
        
        if (currentToken) {
          styledSegment.push(word);
        } else {
          result.push(word);
        }
      }
    
      if (currentToken) {
        result.push(...styledSegment);
      }
    
      console.log(result.join(' '));
    };
    
module.exports = {messangerInit, logingMessage}