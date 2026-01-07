
from PIL import Image, ImageDraw

def create_gradient(width, height, start_color, end_color, end_pos_ratio):
    base = Image.new('RGBA', (width, height), end_color)
    top = Image.new('RGBA', (width, int(height * end_pos_ratio) + 1), start_color)
    draw = ImageDraw.Draw(base)
    
    # We need to draw the gradient manually or line by line
    # Simple linear interpolation
    gradient_height = int(height * end_pos_ratio)
    
    r1, g1, b1, a1 = start_color
    r2, g2, b2, a2 = end_color
    
    for y in range(gradient_height):
        ratio = y / gradient_height
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        a = int(a1 + (a2 - a1) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, a))
        
    return base

def main():
    # Configuration from icon.json
    WIDTH = 1080
    HEIGHT = 1080
    
    # Colors
    # Start: White
    c_start = (255, 255, 255, 255)
    # End: Orange (#FF9A00) -> 255, 154, 0
    c_end = (255, 154, 0, 255)
    
    # Gradient stops at 70%
    GRADIENT_STOP = 0.7
    
    print("Generating background...")
    background = create_gradient(WIDTH, HEIGHT, c_start, c_end, GRADIENT_STOP)
    
    print("Loading contents...")
    try:
        foreground = Image.open("zazaki_academy.icon/Assets/Logo-compact.png").convert("RGBA")
        
        # Resize if necessary (it should be 1080x1080 based on file check)
        if foreground.size != (WIDTH, HEIGHT):
            print(f"Resizing foreground from {foreground.size} to {(WIDTH, HEIGHT)}")
            foreground = foreground.resize((WIDTH, HEIGHT), Image.LANCZOS)
            
        # Composite
        print("Compositing...")
        # Alpha composite overlay
        combined = Image.alpha_composite(background, foreground)
        
        # Save output paths
        outputs = [
            "src/app/icon.png",
            "src/app/apple-icon.png",
            "public/icon-512x512.png",
            "public/icon-192x192.png",
            "public/apple-icon.png"
        ]
        
        for path in outputs:
            print(f"Saving to {path}...")
            # For 192, we resize
            if "192x192" in path:
                resized = combined.resize((192, 192), Image.LANCZOS)
                resized.save(path)
            else:
                combined.save(path)
                
        print("Done!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
