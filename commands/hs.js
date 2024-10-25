const path = require("path");
const { exec } = require("child_process");
const { AttachmentBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "matchhistory",
  description: "Fetch and display match history as images.",
  async execute(message, args, client) {
    if (args.length < 4) {
      return message.reply(
        "Usage: !matchhistory <player_name> <tag> <region> <num_matches>"
      );
    }

    // Concatenate all arguments that might include spaces into a single string
    const playerName = args.slice(0, -3).join(" "); // Assuming player name can be multiple words
    const tag = args[args.length - 3];
    const region = args[args.length - 2];
    const numMatches = args[args.length - 1];

    const pythonScriptPath = path.join(
      __dirname,
      "..",
      "python-scripts",
      "fetchMatchHistoryImage.py"
    );
    const outputDir = path.join(
      __dirname,
      "..",
      "python-scripts",
      "match_reports"
    );

    // Properly quote the arguments
    const command = `python "${pythonScriptPath}" "${playerName}" "${tag}" "${region}" "${numMatches}"`;

    // Debugging: Log the command to verify it
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return message.reply("There was an error running the Python script.");
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return message.reply("There was an error running the Python script.");
      }

      fs.readdir(outputDir, async (err, files) => {
        if (err) {
          console.error(err);
          return message.reply("Failed to read the output directory.");
        }

        // Filter and sort the files to ensure they are sent in the correct order
        const pngFiles = files.filter((file) => file.endsWith(".png")).sort(); // Sorting alphabetically by file name

        for (const file of pngFiles) {
          const filePath = path.join(outputDir, file);
          try {
            const attachment = new AttachmentBuilder(filePath);
            await message.channel.send({
              content: `Match Report: ${file}`,
              files: [attachment],
            });

            // Delete the file after sending it
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(`Failed to delete file: ${filePath}`, unlinkErr);
              } else {
                console.log(`Successfully deleted file: ${filePath}`);
              }
            });
          } catch (e) {
            console.error(`Error sending file: ${filePath}`, e);
            message.reply(
              "There was an error sending one of the match reports."
            );
          }
        }
      });
    });
  },
};
