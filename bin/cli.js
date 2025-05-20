#!/usr/bin/env node
const { program } = require('commander');
const { version } = require('../package.json');
const { createRoom } = require('../src/room');
const { ensureFileExistsSync } = require('../src/lib/helpers');
const { messangerInit } = require('../src/lib/messanger');
const fs = require("fs").promises
program
  .name('yuno')
  .description('Yuno — Multi File Systems')
  .version(version);

program
  .command('start')
  .description('Start synchronization server')
  .action(async () => {
    require('../src/server').init().then(async () => {
      console.log(`🚀 Server running`);
      messangerInit()
      ensureFileExistsSync(".yuno/yuno.changes.json", "{}")
    })
      .catch(err => {
        console.error('💥 Server failed to start:', err);
      });
  });

program
  .command('init')
  .description('Init synchronization server')
  .option('-r, --room <room>', 'enter room name')
  .option('-p, --password <password>', 'enter room password')
  .option('-u, --user_id <user_id>', 'enter your id')
  .option('-pr, --port <port>', 'choose port', "5050")
  .option('-t, --type <type>', 'choose type of connecting', "global")
  .action(async (data) => {
    if (!data.room || !data.password || !data.user_id) return program.error()
    data.user_id = data.user_id + "-" + Date.now()
    data.show_logs = false
    await fs.mkdir(".yuno")
    if(!data.password){
      data.password = "free"
    }
    console.log(data);
    
    await fs.writeFile(".yuno/yuno.json", JSON.stringify(data))
    await fs.writeFile(".yuno/yuno.changes.json", JSON.stringify({}))
    require('../src/server').init().then(() => {
      console.log(`🚀 Server running`);
      messangerInit()
    })
      .catch(err => {
        console.error('💥 Server failed to start:', err);
      });
  });

program
  .command('create')
  .description('Create room')
  .option('-r, --room <room>', 'enter room name')
  .action(async (data) => {
    if (!data.room) return console.log("Please write room name! (--room)");
    await createRoom({ name: data.room })
  });

program
  .command('help')
  .action(() => {
    console.log(`
      🛠️  Launch Helper
      
      Options:
        -r,  --room <room>         Specify the room name
        -p,  --password <password> Room password (if any)
        -u,  --user_id <user_id>   Your unique user ID
        -pr, --port <port>         Port to run the server on (default: 5050)
      
      🔰 Example usage:
        npx yuno init --room [name] --password free --user_id [you'r name] --port 5005
      `);
  });
program.showHelpAfterError();
program.parse();