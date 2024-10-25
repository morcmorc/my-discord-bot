const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
    name: 'join',
    description: 'Joins a voice channel',
    async execute(message) {
        if (message.member.voice.channel) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            connection.on('stateChange', (oldState, newState) => {
                if (newState.status === VoiceConnectionStatus.Ready) {
                    console.log('The bot has connected to the channel!');
                    const channel = message.member.voice.channel;
                    const members = channel.members
                        .filter(member => !member.user.bot)
                        .map(member => member.nickname || member.user.username)
                        .join(', ');
                    message.channel.send(`Joined voice channel: **${channel.name}**\nMembers in the channel: **${members}**`);
                }
            });

        } else {
            message.channel.send('You need to join a voice channel first!');
        }
    }
};
