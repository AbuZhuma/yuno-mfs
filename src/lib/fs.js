const { checkCodeErrors } = require('./helpers');
const fs = require('fs').promises;

const methods = {
    js: async (path) => {
        const isErr = await checkCodeErrors(path, "node");
        return { isErr, comment: "//" };
    }
};

const checkCode = async (path, content) => {
    try {
        const extension = path.split('.').pop(); 
        const method = methods[extension];
        
        if (!method) return

        const { isErr, comment } = await method(path);
        
        if (!isErr) {
            const splited = content.split("\n").map((el) => {
                return comment + el;
            }).join("\n");
            await fs.writeFile(path, splited);
        }
    } catch (error) {
        return
    }
};

module.exports = { checkCode };