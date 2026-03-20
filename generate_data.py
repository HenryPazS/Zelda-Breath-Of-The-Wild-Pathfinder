from PIL import Image
import json

def generate_data(image_path, output_path,grid_width=400, grid_height=300):
    print("Loading heighmap image...")
    try:
        img = Image.open(image_path).convert('L')
    except FileNotFoundError:
        print(f"Error: File '{image_path}' not found, please make sure '{image_path}' is in the correct folder.")
        return
    
    img = img.resize((grid_width, grid_height))
    pixels = img.load()

    nodes =[]
    node_counter = 0
    print (f"Generating nodes for a grid of {grid_width}x{grid_height}...")

    for y in range(grid_height):
        for x in range(grid_width):
            elevation = pixels[x, y]
            if elevation < 40:
                terrain = "Water"
                cost=10
            elif elevation < 90:
                terrain = "Grass"
                cost=1
            elif elevation < 150:
                terrain = "Forest"
                cost=2
            elif elevation < 210:
                terrain = "Desert"
                cost=3
            else:
                terrain = "Mountain"
                cost=5
            
            node = {
                "node_id": f"node_{node_counter}",
                "x": x,
                "y": y,
                "elevation_weight": cost,
                "terrain_type": terrain
            }
            nodes.append(node)
            node_counter += 1

    print("Saving data to JSON file...")
    with open(output_path, 'w') as outfile:
        json.dump(nodes, outfile, indent=2)

    print(f"Finished, {len(nodes)} saved to '{output_path}'.")

generate_data('heightmap.png', 'nodes.json')