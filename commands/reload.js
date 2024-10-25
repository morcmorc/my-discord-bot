const fs = require('fs');
const path = require('path');
const { ownerId } = require('../config.json');

module.exports = {
    name: 'reload',
    description: 'Reloads all commands',
    execute(message, args) {
        if (message.author.id !== ownerId) {
            return message.reply('You do not have permission to reload commands.');
        }

        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            delete require.cache[require.resolve(path.join(commandsPath, file))];
        }

        message.client.commands.clear();

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            message.client.commands.set(command.name, command);
        }

        message.channel.send('Commands reloaded!');
    },
};
