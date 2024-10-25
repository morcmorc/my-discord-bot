const fs = require('fs');
const path = require('path');
const { joinVoiceChannel, getVoiceConnection, EndBehaviorType, VoiceConnectionStatus } = require('@discordjs/voice');
const { exec } = require('child_process');
const { OpusEncoder } = require('@discordjs/opus');

let recording = false;
let currentRecordingStreams = [];
const recordingsDir = path.join(__dirname, '../recordings');

if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir);
}

module.exports = {
    name: 'record',
    description: 'Handles recording commands',
    execute(message, args) {
        if (args[0] === 'start') {
            startRecording(message);
        } else if (args[0] === 'stop') {
            stopRecording(message);
        } else {
            message.channel.send('Unknown command. Use `!record start` or `!record stop`.');
        }
    }
};

async function startRecording(message) {
    if (!recording) {
        const connection = getVoiceConnection(message.guild.id);
        if (connection && connection.state.status === VoiceConnectionStatus.Ready) {
            const voiceChannel = message.member.voice.channel;
            if (voiceChannel && voiceChannel.members.size > 0) {
                message.channel.send('Recording started!');
                recording = true;
                currentRecordingStreams = [];
                const receiver = connection.receiver;
                const date = new Date().toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(/[, :]/g, '-');

                voiceChannel.members.forEach((member) => {
                    if (member.user.bot) return;
                    const userId = member.user.id;
                    const userName = member.user.username;
                    const filePath = path.join(recordingsDir, `${userName}-${date}.pcm`);
                    const audioStream = fs.createWriteStream(filePath);
                    currentRecordingStreams.push(audioStream);

                    const opusStream = receiver.subscribe(userId, {
                        end: {
                            behavior: EndBehaviorType.Manual,
                            duration: 0,
                        }
                    });

                    const encoder = new OpusEncoder(48000, 2);
                    opusStream.on('data', (chunk) => {
                        const decoded = encoder.decode(chunk);
                        audioStream.write(decoded);
                    });

                    audioStream.on('finish', () => {
                        console.log(`Finished recording ${filePath}`);
                    });

                    opusStream.on('end', () => {
                        console.log(`Opus stream ended for user ${userName}`);
                    });
                });
            } else {
                message.channel.send('I need to be in a voice channel with members to start recording.');
            }
        } else {
            message.channel.send('I need to be in a voice channel to start recording.');
        }
    } else {
        message.channel.send('Recording is already in progress.');
    }
}

async function stopRecording(message) {
    if (recording) {
        message.channel.send('Recording stopped! Converting and sending recorded audio...');
        recording = false;

        currentRecordingStreams.forEach(stream => {
            stream.end(); // Close the stream
        });

        // Wait for all streams to finish writing data before starting conversion
        await Promise.all(currentRecordingStreams.map(stream => {
            return new Promise(resolve => {
                stream.on('finish', () => {
                    resolve();
                });
            });
        }));

        // Add a delay to ensure file system has flushed the data
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

        const mp3Files = [];
        const conversionPromises = currentRecordingStreams.map(stream => {
            const filePath = stream.path;
            if (filePath.endsWith('.pcm')) {
                const mp3FileName = `${path.basename(filePath, '.pcm')}.mp3`;
                const mp3FilePath = path.join(recordingsDir, mp3FileName);
                const cmd = `ffmpeg -f s16le -ar 48000 -ac 2 -i "${filePath}" "${mp3FilePath}"`;

                return new Promise((resolve, reject) => {
                    exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error converting file: ${error.message}`);
                            reject(error);
                        } else {
                            mp3Files.push(mp3FilePath);
                            // console.log(mp3Files);
                            fs.unlinkSync(filePath);
                            resolve();
                        }
                    });
                });
            }
        });

        if (conversionPromises.length === 0) {
            message.channel.send('No audio files found for conversion.');
        } else {
            try {
                await Promise.all(conversionPromises);
                mp3Files.forEach(mp3FilePath => {
                    message.channel.send({
                        content: `Recorded audio: ${path.basename(mp3FilePath)}`,
                        files: [mp3FilePath]
                    });
                });
            } catch (error) {
                console.error('Conversion failed:', error);
                message.channel.send('Error converting audio files.');
            }
        }

        // Reset recording streams after stopping and converting
        currentRecordingStreams = [];
    } else {
        message.channel.send('No recording is in progress.');
    }
}
