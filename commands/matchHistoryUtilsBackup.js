const axios = require("axios"); // Make sure to install axios or use any other HTTP library
require("dotenv").config();

const API_KEY = process.env.VALORANT_KEY; // Ensure this is set in your .env file

const colorHSRate = (hsPercentage) => {
  if (hsPercentage > 25) return `\x1b[32m${hsPercentage.toFixed(2)}%\x1b[0m`; // Green
  if (hsPercentage >= 15) return `\x1b[33m${hsPercentage.toFixed(2)}%\x1b[0m`; // Yellow
  return `\x1b[31m${hsPercentage.toFixed(2)}%\x1b[0m`; // Red
};

const getMatchHistory = async (playerName, tag, region) => {
  try {
    const response = await axios.get(
      `https://api.valapi.io/matches/${region}/${playerName}/${tag}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    );

    const matches = response.data.matches;
    let message = "";

    for (const match of matches) {
      message += `**Match ID:** ${match.metadata.matchid}\n**Map:** ${match.metadata.map}\n`;

      let playerData = [];

      // Determine player team and fetch stats
      const playerTeam = match.players.all_players.find(
        (p) => p.name === playerName && p.tag === tag
      )?.team;
      if (!playerTeam) {
        message += "Player not found in the match.\n";
        continue;
      }

      for (const player of match.players.all_players) {
        const { headshots, bodyshots, legshots, kills } = player.stats;
        const totalShots = headshots + bodyshots + legshots;
        const hsPercentage =
          totalShots > 0 ? (headshots / totalShots) * 100 : 0;

        playerData.push({
          name: player.name,
          kills,
          totalShots,
          headshots,
          hsPercentage,
          team: player.team,
        });
      }

      playerData.sort((a, b) => b.kills - a.kills);

      message += `\`\`\`Name        Kills   Total Shots  Headshots  HS%\n`;
      playerData.forEach((data) => {
        const color = data.team === playerTeam ? "\x1b[34m" : "\x1b[31m"; // Blue for allies, Red for enemies
        message += `${color}${data.name.padEnd(10)} ${data.kills
          .toString()
          .padEnd(7)} ${data.totalShots.toString().padEnd(12)} ${data.headshots
          .toString()
          .padEnd(9)} ${colorHSRate(data.hsPercentage)}\x1b[0m\n`;
      });
      message += "```";
    }

    return message;
  } catch (error) {
    throw new Error("Failed to fetch match history");
  }
};

module.exports = { getMatchHistory };
