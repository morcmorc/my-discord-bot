from PIL import Image, ImageDraw, ImageFont
import os

def draw_table(data, filename='table_image.png'):
    # Define the absolute path for saving the image
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'python-scripts'))
    filepath = os.path.join(output_dir, filename)

    # Image size and background color
    width = 800
    height = 600
    background_color = (255, 255, 255)  # White
    text_color = (0, 0, 0)  # Black
    header_color = (200, 200, 200)  # Light Gray

    # Create a new image with white background
    img = Image.new('RGB', (width, height), background_color)
    draw = ImageDraw.Draw(img)
    
    # Font settings
    font = ImageFont.load_default()
    header_font = ImageFont.load_default()

    # Table headers
    headers = ["Name", "Kills", "Total Shots", "Headshots", "HS%"]
    header_height = 30
    cell_height = 30
    y = 20

    # Draw headers
    draw.rectangle([0, y, width, y + header_height], fill=header_color)
    for i, header in enumerate(headers):
        draw.text((i * 160 + 10, y + 5), header, fill=text_color, font=header_font)

    y += header_height

    # Draw table rows
    for row in data:
        for i, item in enumerate(row):
            color = (0, 255, 0) if i == 4 and item > 25 else (255, 255, 0) if i == 4 and item >= 15 else (255, 0, 0)
            draw.text((i * 160 + 10, y + 5), str(item), fill=color, font=font)
        y += cell_height

    # Save image
    img.save(filepath)

# Example data
data = [
    ["Venia Aetatis", 23, 72, 15, 20.83],
    ["mahyonaihse", 23, 97, 11, 11.34],
    ["PetrhaN", 22, 74, 16, 21.62],
    ["Davoood", 22, 57, 12, 21.05],
    ["HALASKAR", 20, 72, 14, 19.44],
    ["Artyom", 17, 43, 15, 34.88],
    ["Creed", 16, 58, 11, 18.97],
    ["LassMichKochen", 15, 56, 10, 17.86],
    ["tahbascoh", 13, 66, 5, 7.58],
    ["Fryro", 9, 47, 9, 19.15]
]

# draw_table(data)
