module.exports = {
    name: 'info',
    description: 'Provides information about the user',
    execute(message, args) {
        const member = message.member;
        const userInfo = [];

        userInfo.push(`**Username:** ${member.user.username}`);
        userInfo.push(`**Discriminator:** ${member.user.discriminator}`);
        userInfo.push(`**ID:** ${member.user.id}`);
        userInfo.push(`**Created At:** ${member.user.createdAt}`);
        userInfo.push(`**Joined Server At:** ${member.joinedAt}`);

        if (member.voice.channel) {
            userInfo.push(`**In Voice Channel:** Yes`);
            userInfo.push(`**Voice Channel Name:** ${member.voice.channel.name}`);
            userInfo.push(`**Voice Channel ID:** ${member.voice.channel.id}`);
        } else {
            userInfo.push(`**In Voice Channel:** No`);
        }

        message.channel.send(userInfo.join('\n'));
    },
};
