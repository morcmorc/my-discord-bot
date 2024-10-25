const { ownerId } = require('../config.json');
module.exports = {
    name: 'stop',
    description: 'Stops the bot',
    execute(message, args) {
        if (message.author.id !== ownerId) {
            return message.reply('You do not have permission to stop the bot.');
        }
        message.channel.send('Shutting down...').then(() => {
            process.exit(0);
        });
    },
};
