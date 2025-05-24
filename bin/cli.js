#!/usr/bin/env node
const { program } = require('commander');
const { version } = require('../package.json');
const { createRoom } = require('../src/room');
const { ensureFileExistsSync } = require('../src/lib/helpers');
const { messangerInit } = require('../src/lib/messanger');
const { starter } = require('../src/starter');
const { setRoomSettings, setting } = require('../src/setRoomSettings');
const { clearDirectory } = require('../src/lib/reconect');
program
  .name('yuno')
  .description('Yuno — Multi File Systems')
  .version(version);

program
  .command('start')
  .description('Start synchronization server')
  .action(async () => {
    await starter()
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
  .option('-pr, --port <port>', 'choose port', "5001")
  .option('-t, --type <type>', 'choose type of connecting', "global")
  .action(async (data) => {
    await clearDirectory("/")
    await starter(data)
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
  .command('acces')
  .description('Acces for room settings')
  .option('-r, --room <room>', 'enter room name')
  .option('-p, --password <room>', 'enter room author password')
  .action(async (data) => {
    if (!data.room) return console.log("Please write room name! (--room)");
    if (!data.password) return console.log("Please write room password! (--password)");

    await setRoomSettings(data)
  });
program
  .command('save')
  .description('Save settings')
  .action(async () => {
    await setting()
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
        npx yuno init --room [name] --password free --user_id [you'r name]
      `);
  });
program.showHelpAfterError();
program.parse();