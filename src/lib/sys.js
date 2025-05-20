const { changesHash, roomates } = require("../globals")
const fs = require("fs").promises

const onExit = async () => {
      try {
            await fs.writeFile(".yuno/yuno.changes.json", JSON.stringify(Object.fromEntries(changesHash)))
            process.exit()
      } catch (error) {
            process.exit()
      }
}
const sendHash = (ows, id) => {
      const msg = { type: "changes", id: id, changes: Object.fromEntries(changesHash) }
      ows.send(JSON.stringify(msg))
}
const updateToHash = (changes) => {
      if (!changes || typeof changes !== 'object') return
      const array = Object.entries(changes)
      const { handleFileOperation } = require("../wss")
      array.forEach((el) => {
            changesHash.set(el[0], el[1])
            if (el[1].content) {
                  handleFileOperation("change", el[1].type, el[1].path, el[1].content)
            } else {
                  handleFileOperation("change", el[1].type, el[1].path)
            }
      })
}
const loopChanges = async (data) => {
      try {
            const user = roomates.get(data.id);
            if (!user?.ws) return;

            const ows = user.ws;
            const changesMap = new Map(Object.entries(data.changes));
            const currentMap = changesHash;
            const out = new Map();
            const inn = new Map();

            for (const [name, content] of changesMap) {
                  const serverContent = currentMap.get(name);
                  if (!serverContent) {
                        inn.set(name, content);
                        continue;
                  }
                  if (serverContent.time < content.time) inn.set(name, content);
                  else if (serverContent.time > content.time) out.set(name, serverContent);
            }

            for (const [name, content] of currentMap) {
                  const clientContent = changesMap.get(name);
                  if (!clientContent) {
                        out.set(name, content);
                        continue;
                  }
                  if (clientContent.time < content.time) out.set(name, content);
                  else if (clientContent.time > content.time) inn.set(name, clientContent);
            }

            if (out.size) ows.send(JSON.stringify({
                  type: "backChanges",
                  changes: Object.fromEntries(out)
            }));

            if (inn.size) updateToHash(Object.fromEntries(inn));

      } catch (error) {
            console.error("Sync error:", error);
      }
};
const path = require('path');

const checkTodo = async (content, user, filePath = '') => {
      try {
            const todoData = parseTodo(content, user, filePath);
            if (!todoData) return null;

            const todoEntry = formatTodoEntry(todoData);
            await saveTodoToFile(todoEntry);
            return todoEntry;

      } catch (error) {
            console.error('⚠️ TODO processing error:', error);
            return null;
      }
};


const parseTodo = (content, author, filePath) => {
      const match = content.match(/TODO:\s*(.*?)\s*\|\s*(.*)|TODO-\((.+?)\)-TODO(.*)/s);
      if (!match) return null;

      const isNewFormat = match[1] !== undefined;
      const description = (isNewFormat ? match[1] : match[4] || '').trim();
      const paramsStr = (isNewFormat ? match[2] : match[3] || '').trim();

      const params = {};
      if (paramsStr) {
            paramsStr.split(/[, ]+/).forEach(pair => {
                  const [key, value] = pair.split(':').map(s => s.trim());
                  if (key && value) params[key.toLowerCase()] = value;
            });
      }

      return {
            task: params.task || params.t || 'Untitled task',
            priority: params.p || params.priority || 'medium',
            type: params.type || params.t || 'task',
            assignee: params.a || params.assignee || author,
            deadline: params.d || params.deadline || null,
            description: description || 'No description',
            author,
            filePath,
            createdAt: new Date()
      };
};


const formatTodoEntry = ({
      task,
      priority,
      type,
      author,
      assignee,
      deadline,
      description,
      filePath,
      createdAt
}) => {
      const priorityEmoji = {
            high: '🔴',
            medium: '🟡',
            low: '🟢',
            critical: '💢'
      }[priority.toLowerCase()] || '⚪';

      const typeEmoji = {
            bug: '🐛',
            feature: '✨',
            task: '📌',
            refactor: '♻️',
            docs: '📚',
            test: '🧪'
      }[type.toLowerCase()] || '📋';

      return `
${priorityEmoji} ${typeEmoji} ${task}
├── 👤 Author: @${author.replace('@', '')}
├── 👷 Assignee: @${assignee.replace('@', '')}
├── 🚩 Priority: ${capitalize(priority)}
├── 📅 Deadline: ${deadline || 'Not set'}
├── 📍 File: ${filePath ? path.relative(process.cwd(), filePath) : 'Not specified'}
├── 🕒 Created: ${formatDate(createdAt)}
└── 📝 Description:
${description.split('\n').map(line => `    ${line}`).join('\n')}
───────────────────────────────
`;
};


const saveTodoToFile = async (content) => {
      const TODO_FILE = 'todos.md';
      try {
            await fs.appendFile(TODO_FILE, content);
      } catch (error) {
            throw new Error(`Failed to save: ${error.message}`);
      }
};

const formatDate = (date) => {
      return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
      });
};


const capitalize = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

module.exports = { checkTodo };
module.exports = { onExit, loopChanges, sendHash, updateToHash, checkTodo }