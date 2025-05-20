const { wsurl } = require("../configs");
const fs = require("fs").promises;
const WebSocket = require("ws");

const initOpenRooms = async () => {
    const ws = new WebSocket(wsurl);

    ws.onopen = () => {
        ws.send(JSON.stringify({ client: "web", type: "public_rooms" }));
    };

    ws.onmessage = async (event) => {
        const newMessage = JSON.parse(event.data);
        
        if (newMessage.type === "public_rooms") {
            const rooms = newMessage.final;
            await saveRoomsAsText(rooms);
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
};

const formatRoomAsText = (room) => {
    return `
╭────────────────────────────────────────────────╮
│  ✦ ${room.name}   ID: ${room._id}
├────────────────────────────────────────────────┤
│  ${room.description}
│
│  👤 Author:    ${room.author}
│  🏢 Company:   ${room.company}
│  🌐 Language:  ${room.language}
│  📅 Created:   ${room.createdAt}
│
│  🏷 Tags:        ${room.tags.join(', ')}
│  🛠 Tech:       ${room.technologies.join(', ')}
╰────────────────────────────────────────────────╯
`;
};

const saveRoomsAsText = async (rooms) => {
    let output = `
╔════════════════════════════════════════════════╗
║            PUBLIC ROOMS LIST                   ║
╚════════════════════════════════════════════════╝
`;

    rooms.forEach((room, index) => {
        output += formatRoomAsText(room);
        if (index < rooms.length - 1) {
            output += '\n├────────────────────────────────────────────────┤\n';
        }
    });

    await fs.writeFile(".yuno/open.server.txt", output);
};

module.exports = { initOpenRooms };