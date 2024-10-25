import valo_api
import os
from dotenv import load_dotenv
from prettytable import PrettyTable

# Load environment variables
load_dotenv()

# Set the API key
KEY = os.getenv("VALORANT_KEY")
valo_api.set_api_key(KEY)

# Player details
player_name = "mahyonaihse"
tag = "saucy"
region = "eu"

def color_hs_rate(hs_percentage):
    """Return a color-coded HS% string based on the value."""
    if hs_percentage > 25:
        color = 'green'
    elif hs_percentage >= 15:
        color = 'yellow'
    else:
        color = 'red'
    return f"{hs_percentage:.2f}%"

try:
    # Fetch the match history
    match_history = valo_api.get_match_history_by_name_v3(region, player_name, tag, size=3)
    
    # Create a table for each match
    for match in match_history:
        table = PrettyTable()
        table.field_names = ["Name", "Kills", "Total Shots", "Headshots", "HS%"]
        table.align["Name"] = "l"
        table.align["Kills"] = "r"
        table.align["Total Shots"] = "r"
        table.align["Headshots"] = "r"
        table.align["HS%"] = "r"

        # Determine the player's team
        player_team = None
        for player in match.players.all_players:
            if player.name == player_name and player.tag == tag:
                player_team = player.team
                break

        if player_team is None:
            print("Player not found in the match.")
            continue

        player_data = []
        for player in match.players.all_players:
            # Extract stats
            headshots = player.stats.headshots
            bodyshots = player.stats.bodyshots
            legshots = player.stats.legshots
            kills = player.stats.kills
            
            # Calculate total shots and HS%
            total_shots = headshots + bodyshots + legshots
            hs_percentage = (headshots / total_shots) * 100 if total_shots > 0 else 0

            player_data.append({
                'name': player.name,
                'kills': kills,
                'total_shots': total_shots,
                'headshots': headshots,
                'hs_percentage': hs_percentage,
                'team': player.team
            })

        # Sort players by kills
        player_data.sort(key=lambda x: x['kills'], reverse=True)

        for data in player_data:
            # Add colored rows to the table (note: colors will not display in the text file, only in the console)
            table.add_row([
                data['name'],
                data['kills'],
                data['total_shots'],
                data['headshots'],
                color_hs_rate(data['hs_percentage'])
            ])

        # Save table to a text file
        with open(f"./python-scripts/output.txt", "w", encoding="utf-8") as file:
            file.write(f"Match ID: {match.metadata.matchid}\n")
            file.write(f"Map: {match.metadata.map}\n")
            file.write(str(table))

except Exception as e:
    print(f"An error occurred: {e}")
