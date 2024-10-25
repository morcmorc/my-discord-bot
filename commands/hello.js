module.exports = {
    name: 'hello',
    description: 'Greets the user',
    execute(message, args) {
        message.reply(`Hello, ${message.author.username}!`);
    },
};
