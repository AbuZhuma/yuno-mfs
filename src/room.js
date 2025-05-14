const { url } = require("../configs");

const createRoom = async ({name}) => {
      try {
            if (!name || typeof name !== 'string' || name.trim() === '') {
                  throw new Error('Invalid name');
            }
            const response = await fetch(`${url}/room`, {
                  method: 'POST',
                  headers: {
                        'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ name: name })
            });
            const result = await response.json();
            console.log(result);
      } catch (error) {
            console.log(error);
      }
};
module.exports = { createRoom }