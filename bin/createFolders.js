const { resolve } = require('path');
const { mkdirSync } = require('fs')
const res = resolve;

async function createFolders() {
    await mkdirSync(res('src'));
    await mkdirSync(res('src/events'));
    await mkdirSync(res('src/commands'));
    await mkdirSync(res('src/interfaces'));
    await mkdirSync(res('src/types'));
}

async function createInfoFolder() {
    await mkdirSync(res('src/commands/info'));
}

exports.createFolders = createFolders
exports.createInfoFolder = createInfoFolder