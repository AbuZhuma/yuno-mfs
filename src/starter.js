const { setChanges, isFileExist } = require("./lib/helpers")
const { program } = require('commander');
const { initOpenRooms } = require("./openrooms");
const { settings } = require("./globals");
const fs = require("fs").promises

const starter = async(data = {room:"room name", password:"free", user_id: "user"}) => {
      const isYunoExist = await isFileExist(".yuno")
      const isConfigsExist = await isFileExist(".yuno/yuno.json")
      const isChangesExist = await isFileExist(".yuno/yuno.changes.json")
      if (!data.room || !data.password || !data.user_id) return program.error()
      data.user_id = data.user_id + "-" + Date.now()
      data.show_logs = false
      if(!data.type) data.type = "global"
      if (!data.password) data.password = "free"
      if (!isYunoExist) await fs.mkdir(".yuno")
      if (!isConfigsExist) await fs.writeFile(".yuno/yuno.json", JSON.stringify(data, null, 2))
      if (!isChangesExist) await fs.writeFile(".yuno/yuno.changes.json", JSON.stringify({}))
      setChanges()
      initOpenRooms()
}
module.exports = { starter }