module.exports = {
    name: 'help',
    description: 'List all commands',
    execute(message, args) {
        const commands = message.client.commands;
        const commandList = commands.map(command => command.name).join(', ');
        
        message.channel.send(`Available commands: ${commandList}`);
    },
};
