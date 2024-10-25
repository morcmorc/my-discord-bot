const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "mh",
  description: "Fetch and display match history.",
  async execute(message, args) {
    // Construct the Python command
    const pythonScript = path.join(
      __dirname,
      "..",
      "python-scripts",
      "fetchMatchHistory.py"
    );
    const command = `python "${pythonScript}" ${args.join(" ")}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }

      // Check if there's any stderr
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      // Read the generated output file
      const outputFile = path.join(
        __dirname,
        "..",
        "python-scripts",
        `output.txt`
      );
      fs.readFile(outputFile, "utf-8", (err, data) => {
        if (err) {
          console.error(`Read file error: ${err}`);
          return;
        }

        // Send the file to Discord
        message.channel
          .send({
            content: "Here's the match history:",
            files: [outputFile],
          })
          .catch(console.error);
      });
    });
  },
};
