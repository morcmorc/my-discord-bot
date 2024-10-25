const { SpeechEvents } = require('discord-speech-recognition');



module.exports = {
    startListening: (client, handleSpeechRecognition, message) => {
        if (!isListening) {
            // Start listening for speech recognition
            speechHandler = (msg) => handleSpeechRecognition(msg, message.channel);
            client.on(SpeechEvents.speech, speechHandler);
            isListening = true;
            message.channel.send('Listening started!');
        } else {
            message.channel.send('Already listening!');
        }
    },

    stopListening: (client, message) => {
        if (isListening) {
            // Stop listening for speech recognition
            client.off(SpeechEvents.speech, speechHandler);
            speechHandler = null;
            isListening = false;
            message.channel.send('Listening stopped!');
        } else {
            message.channel.send('Not currently listening!');
        }
    }
};
