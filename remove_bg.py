from PIL import Image
import sys

def remove_checkerboard(input_path, output_path, tolerance=10):
    """
    Removes checkerboard background based on top-left corner colors.
    Uses a floodfill approach starting from corners.
    """
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        width, height = img.size
        
        # Identify background colors from corners
        # Checkerboard usually alternates, so checking (0,0) and (10,0) might give both colors
        tl_color = img.getpixel((0, 0))
        
        # We will use Image.floodfill (available in recent PIL) or a fast traversal.
        # Actually simplest reliable way for simple backgrounds is to iterate.
        # But floodfill is better to avoid removing internal white parts of the logo.
        # Pillow doesn't have a direct floodfill transparency tool easily exposed like paint bucket without ImageDraw.
        
        # Let's try a simple approach first: 
        # Scan from edges. If pixel is "background-like" (white or gray), make transparent.
        # Search for "#FFFFFF" and "#CCCCCC" or whatever the JPG artifacts made them.
        
        # Dynamic color sampling:
        bg_colors = set()
        # Sample corners
        corners = [(0,0), (width-1, 0), (0, height-1), (width-1, height-1)]
        for x,y in corners:
            bg_colors.add(img.getpixel((x,y)))
            
        # Sample a few pixels in from padding to catch the alternate checker color
        corners_inner = [(15,15), (width-15, 15), (15, height-15), (width-15, height-15)]
        for x,y in corners_inner:
             bg_colors.add(img.getpixel((x,y)))
             
        print(f"Detected background samples: {bg_colors}")

        newData = []
        # Naive approach: Replace anything close to these colors
        # Better approach: Flood fill from (0,0) replacing target colors with clear.
        
        # Since I can't easily do complex floodfill in a concise script without recursion depth issues in pure python,
        # I will use a robust threshold replacement if the logo doesn't have these colors on the edge.
        # The logo is Blue. Background is Grayscale.
        # Logic: If pixel saturation is low AND brightness is high -> Transparent.
        
        for item in datas:
            r, g, b, a = item
            
            # Checkerboard is usually grayscale (r~=g~=b)
            # Logo is Blue (b > r+g or similar)
            
            is_grayscale = abs(r-g) < 20 and abs(g-b) < 20 and abs(r-b) < 20
            is_bright = r > 150 # White/Light Gray
            
            if is_grayscale and is_bright:
                newData.append((255, 255, 255, 0)) # Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        
        # Crop empty space (optional, but good for logos)
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)

        img.save(output_path, "PNG")
        print(f"Successfully saved transparent logo to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Source: The original uploaded JPG
    source = r"C:/Users/Veerendranath/.gemini/antigravity/brain/8903e142-b0c7-440f-a869-566da450494e/uploaded_image_1767287937451.jpg"
    dest = "logo_transparent_final.png"
    remove_checkerboard(source, dest)
