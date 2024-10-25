const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const request = require('request');

module.exports = {
    name: 'pic2story',
    description: 'Generate a story from an image and return the audio',
    async execute(message, args) {
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            const imagePath = path.join(__dirname, '..', 'output\\downloaded_image.jpg');
            const scenarioTextPath = path.join(__dirname, '..', 'output\\scenario.txt');
            const outputTextPath = path.join(__dirname, '..', 'output\\story.txt');
            const audioFilePath = path.join(__dirname, '..', 'output\\audio.flac');

            // Download the image
            request(attachment.url).pipe(fs.createWriteStream(imagePath)).on('close', () => {
                // Call the Python script
                const pythonProcess = spawn('python', ['app.py', imagePath]);

                pythonProcess.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`);
                });

                pythonProcess.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                });

                pythonProcess.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);

                    // Read the output files and send them to Discord
                    Promise.all([
                        fs.promises.readFile(scenarioTextPath, 'utf8'),
                        fs.promises.readFile(outputTextPath, 'utf8'),
                        fs.promises.readFile(audioFilePath)
                    ]).then(([scenario, story, audioData]) => {
                        message.channel.send(`scenario: ${scenario}`);
                        message.channel.send(`story: ${story}`);
                        message.channel.send({
                            files: [{
                                attachment: audioData,
                                name: 'audio.flac'
                            }]
                        }).catch(err => console.error('Error sending audio file:', err));
                    }).catch(err => console.error('Error reading output files:', err));
                });
            });
        } else {
            message.reply('Please attach an image to generate a story.');
        }
    }
};
