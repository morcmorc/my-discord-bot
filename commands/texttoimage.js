// require('dotenv').config();

// module.exports = {
//     name: 'texttoimage',
//     description: 'Generates an image from text using a Hugging Face model',
//     async execute(message, args) {
//         const textPrompt = args.join(' ');
//         if (!textPrompt) {
//             return message.channel.send('Please provide some text to generate an image.');
//         }

//         const apiKey = process.env.HUGGING_FACE_API_KEY;
//         const url = 'https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4';

//         try {
//             const fetch = (await import('node-fetch')).default;
//             const response = await fetch(url, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${apiKey}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     inputs: textPrompt
//                 })
//             });

//             if (!response.ok) {
//                 throw new Error(`Error: ${response.statusText}`);
//             }

//             const result = await response.json();

//             if (result.error) {
//                 throw new Error(result.error);
//             }

//             // Assuming the model returns a URL to the generated image
//             const imageUrl = result.url;

//             message.channel.send(`Here is your image: ${imageUrl}`);
//         } catch (error) {
//             console.error('Error generating image:', error);
//             message.channel.send('Error generating image. Please try again later.');
//         }
//     },
// };
