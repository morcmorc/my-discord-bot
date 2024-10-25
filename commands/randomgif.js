const { giphyApiKey } = require('../config.json');

module.exports = {
    name: 'randomgif',
    description: 'Sends a random GIF',
    async execute(message, args) {
        const apiKey = giphyApiKey; 
        const url = `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}`;

        try {
            const fetch = await import('node-fetch');
            const response = await fetch.default(url);
            const data = await response.json();

            console.log(data.data.url);
            if (data.data && data.data.url) {
                message.channel.send(data.data.url);
            } else {
                message.channel.send('Error fetching GIF.');
            }
        } catch (error) {
            console.error('Error fetching GIF:', error);
            message.channel.send('Error fetching GIF.');
        }
    },
};
