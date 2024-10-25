const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const { joinVoiceChannel } = require("@discordjs/voice");
const { startListening, stopListening } = require('./events/speech'); // Import speech event handling logic

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.MessageContent
    ] 
});

// Create a collection (map) for commands
client.commands = new Collection();

// Function to load commands
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.name, command);
    }
    console.log("commands");
}
// Initial load of commands
loadCommands();

function loadEvents(){
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
    console.log("events");
}
// Initial load of events
loadEvents();



client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('messageCreate', message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if the message starts with your command prefix
    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    // Parse the command name and arguments from the message
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if the command exists in the collection
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        // Execute the command
        command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

// client.on('messageCreate', (msg) => {
//     const voiceChannel = msg.member?.voice.channel;
//     if (voiceChannel) {
//       joinVoiceChannel({
//         channelId: voiceChannel.id,
//         guildId: voiceChannel.guild.id,
//         adapterCreator: voiceChannel.guild.voiceAdapterCreator,
//         selfDeaf: false,
//       });
//     }
// });

client.login(token);
