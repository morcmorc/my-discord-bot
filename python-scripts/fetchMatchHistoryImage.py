from PIL import Image, ImageDraw, ImageFont
import valo_api
import os
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

# Set the API key
KEY = os.getenv("VALORANT_KEY")
valo_api.set_api_key(KEY)

def generate_match_report_image(match, player_name, output_path):
    try:
        img_width = 750  # Increased width for better readability
        img_height = 12 * 40  # Increased height for more rows
        background_color = (255, 255, 255)
        line_color = (0, 0, 0)
        font_color = (0, 0, 0)
        header_color = (200, 200, 200)
        over_head_color = (200, 200, 200)
        ally_color = (173, 216, 230)  # Light blue for allies
        enemy_color = (255, 160, 160)  # Light red for enemies

        # Create image and drawing context
        image = Image.new('RGB', (img_width, img_height), background_color)
        draw = ImageDraw.Draw(image)

        # Load a truetype font
        font = ImageFont.truetype("arial.ttf", 18)  # Larger font size
        small_font = ImageFont.truetype("arial.ttf", 16)  # Slightly smaller font for text

        y_position = 00
        row_height = 40  # Increased row height for larger text
        column_widths = [200, 200, 150, 150, 150]
        column_width = img_width  # Full width for overhead

        def draw_cell(x, y, width, height, text, color):
            draw.rectangle([x, y, x + width, y + height], fill=color, outline=line_color)
            bbox = draw.textbbox((x + 5, y + 5), text, font=font)
            draw.text((x + 5, y + 5), text, font=font, fill=font_color)
            return bbox


        # Overhead information
        win_array = win_game(match)
        winner_text = f"Winner: {win_array[0]} team with {win_array[1]} : {win_array[2]}"
        duration_text = f"Duration: {win_array[3]} min | {win_array[4]}"

        # print(overhead_text)
        overhead_text = f"{winner_text:<{35}}{duration_text}"
        # color ovverhead in winner color
        if win_array[0] == "blue":
            winner_color = ally_color
        elif win_array[0] == "red":
            winner_color = enemy_color
        else:
            winner_color = over_head_color

        draw_cell(0, y_position, column_width, row_height, overhead_text, winner_color)
        y_position += row_height

        headers = ["Name", "Kills", "Total Shots", "Headshots", "HS%"]
        for i, header in enumerate(headers):
            draw_cell(i * column_widths[i], y_position, column_widths[i], row_height, header, header_color)
        y_position += row_height

        player_team = None
        for player in match.players.all_players:
            if player.name.lower() == player_name.lower():
                player_team = player.team
                break

        if player_team is None:
            raise ValueError("Player not found in the match.")

        player_data = []
        for player in match.players.all_players:
            headshots = player.stats.headshots
            bodyshots = player.stats.bodyshots
            legshots = player.stats.legshots
            kills = player.stats.kills
            
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

        player_data.sort(key=lambda x: x['kills'], reverse=True)

        for data in player_data:
            hs_color = (0, 255, 0) if data['hs_percentage'] > 25 else (255, 255, 0) if data['hs_percentage'] >= 15 else (255, 0, 0)
            row = [
                data['name'],
                str(data['kills']),
                str(data['total_shots']),
                str(data['headshots']),
                f"{data['hs_percentage']:.2f}%"
            ]

            team_color = ally_color if data['team'] == player_team else enemy_color
            
            for i, text in enumerate(row):
                color = hs_color if i == 4 else team_color
                draw_cell(i * column_widths[i], y_position, column_widths[i], row_height, text, color)
            y_position += row_height

        image.save(output_path)
    except Exception as e:
        print(f"An error occurred in image_generation: {e}", file=sys.stderr)


def win_game(match):
    # Determine and draw match outcome
    red_team = match.teams.red
    blue_team = match.teams.blue
    if red_team.has_won:
        winner = red_team
        w_color = "red"
    elif blue_team.has_won:
        winner = blue_team
        w_color = "blue"
    else:
        winner = None
        w_color = "grey"
    metadata = game_length(match)
    g_length = metadata[0]
    
    game_when = metadata[1]
    print(g_length,game_when)

    print(f"{w_color} won with: {winner.rounds_won} to {winner.rounds_lost} ")
    return [w_color,winner.rounds_won, winner.rounds_lost, g_length, game_when]
    
def print_match(match):
    with open(f"./python-scripts/match.txt", "w", encoding="utf-8") as file:
        log = match
        file.write(str(log))

def game_length(match):
    g_length = match.metadata.game_length
    # Assume match duration is provided in seconds
    minutes, seconds = divmod(g_length, 60)
    g_length = f"{minutes}:{round(seconds,2)}"
    game_when = match.metadata.game_start_patched
    metadata = [g_length,game_when]
    # print(f"gl: {gl}")
    return metadata


def main():
    if len(sys.argv) != 5:
        print("Usage: python fetchMatchHistoryImage.py <player_name> <tag> <region> <num_matches>")
        sys.exit(1)
    player_name = sys.argv[1]
    player_name_no_space = player_name.replace(" ","")
    tag = sys.argv[2]
    region = sys.argv[3]
    num_matches = int(sys.argv[4])
    print(f"{player_name} {tag} {num_matches}")
    output_dir = "./python-scripts/match_reports"

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        match_history = valo_api.get_match_history_by_name_v3(region, player_name_no_space, tag, size=num_matches)
        # print(match_history)
        if not match_history:
            raise ValueError("No match history found.")

        # Filter for only competitive matches
        competitive_matches = [
            match for match in match_history if match.metadata.mode == "Competitive"
        ]

        if not competitive_matches:
            print("No competitive matches found.")
            return

        for i, match in enumerate(competitive_matches):
            # match_id = match.metadata.matchid
            # match_details = valo_api.get_match_details_v2(match_id)
            # print(match_details)
            print_match(match)
            output_path = os.path.join(output_dir, f"match_report_{i+1}.png")
            generate_match_report_image(match, player_name, output_path)
    except Exception as e:
        print(f"error in main: {e}", file=sys.stderr)
        

if __name__ == "__main__":
    main()
