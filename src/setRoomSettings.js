const { default: axios } = require("axios");
const { url } = require("../configs");

const fs = require("fs").promises;

const setRoomSettings = async (data) => {
      const isExist = await axios.get(`${url}/room/${data.room}`)
      if (isExist.status !== 200) {
            return console.log("Failed to setup!")
      } else if (isExist.status === 301) {
            return console.log("Permission denied")
      }
      const opt = { ...isExist.data, password: data.password }
      await fs.writeFile(".yuno/room.settings.json", JSON.stringify(opt))
}
const setting = async () => {
      try {
            const sets = await fs.readFile(".yuno/room.settings.json")
            if (!sets) return console.log("not found settings!");
            const jsonForm = JSON.parse(sets)
            const opt = {
                  settings: jsonForm.settings,
                  tags: jsonForm.tags,
                  technologies: jsonForm.technologies,
                  language: jsonForm.language
            }
            const fn = {
                  changes: opt,
                  name: jsonForm.name,
                  password: jsonForm.password
            }
            const res = await axios.put(`${url}/room/`, fn)
            if (res.status === 200) {
                  console.log("Room settings saved!");
            }
      } catch (error) {
            if (error.status === 401) {
                  console.log("Incorrect password");
            }
            if (error.status === 404) {
                  console.log("Room not found");
            }
      }

}
module.exports = { setRoomSettings, setting }