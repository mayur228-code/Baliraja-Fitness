import os
from PIL import Image, ImageDraw, ImageFilter

# 1. Load the pristine transparent emblem
master_emblem = Image.open('scratch_emblem_perfect.png').convert('RGBA')

# Update master src/products/app_icon.png (high-res 1024x1024 master icon with clean white squircle background)
master_size = 1024
master_icon = Image.new('RGBA', (master_size, master_size), (255, 255, 255, 0))

# Draw smooth rounded squircle for master icon
mask_master = Image.new('L', (master_size, master_size), 0)
draw_m = ImageDraw.Draw(mask_master)
# 22% corner radius for standard modern app icon
draw_m.rounded_rectangle((0, 0, master_size, master_size), radius=int(master_size * 0.22), fill=255)

bg_master = Image.new('RGBA', (master_size, master_size), (255, 255, 255, 255))
master_icon.paste(bg_master, (0, 0), mask_master)

# Place emblem in center (76% of canvas size)
emb_master_size = int(master_size * 0.76)
emb_master = master_emblem.resize((emb_master_size, emb_master_size), Image.Resampling.LANCZOS)
emb_pos = ((master_size - emb_master_size) // 2, (master_size - emb_master_size) // 2)
master_icon.paste(emb_master, emb_pos, emb_master)
master_icon.save('src/products/app_icon.png', 'PNG', optimize=True)
master_icon.save('public/icon.png', 'PNG', optimize=True)
print("Updated src/products/app_icon.png and public/icon.png")

# 2. Android Density Specifications
densities = {
    'mipmap-mdpi': {'launcher': 48, 'foreground': 108},
    'mipmap-hdpi': {'launcher': 72, 'foreground': 162},
    'mipmap-xhdpi': {'launcher': 96, 'foreground': 216},
    'mipmap-xxhdpi': {'launcher': 144, 'foreground': 324},
    'mipmap-xxxhdpi': {'launcher': 192, 'foreground': 432},
}

base_res = 'android/app/src/main/res'

for folder, sizes in densities.items():
    folder_path = os.path.join(base_res, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    l_size = sizes['launcher']
    fg_size = sizes['foreground']
    
    # A. Standard launcher icon (Squircle on white background)
    l_img = Image.new('RGBA', (l_size, l_size), (255, 255, 255, 0))
    mask_l = Image.new('L', (l_size, l_size), 0)
    draw_l = ImageDraw.Draw(mask_l)
    draw_l.rounded_rectangle((0, 0, l_size, l_size), radius=int(l_size * 0.22), fill=255)
    bg_l = Image.new('RGBA', (l_size, l_size), (255, 255, 255, 255))
    l_img.paste(bg_l, (0, 0), mask_l)
    
    emb_l_size = int(l_size * 0.76)
    emb_l = master_emblem.resize((emb_l_size, emb_l_size), Image.Resampling.LANCZOS)
    l_img.paste(emb_l, ((l_size - emb_l_size) // 2, (l_size - emb_l_size) // 2), emb_l)
    l_path = os.path.join(folder_path, 'ic_launcher.png')
    l_img.save(l_path, 'PNG', optimize=True)
    
    # B. Round launcher icon (Circle on white background)
    r_img = Image.new('RGBA', (l_size, l_size), (255, 255, 255, 0))
    mask_r = Image.new('L', (l_size, l_size), 0)
    draw_r = ImageDraw.Draw(mask_r)
    draw_r.ellipse((0, 0, l_size - 1, l_size - 1), fill=255)
    r_img.paste(bg_l, (0, 0), mask_r)
    
    emb_r_size = int(l_size * 0.74)
    emb_r = master_emblem.resize((emb_r_size, emb_r_size), Image.Resampling.LANCZOS)
    r_img.paste(emb_r, ((l_size - emb_r_size) // 2, (l_size - emb_r_size) // 2), emb_r)
    r_path = os.path.join(folder_path, 'ic_launcher_round.png')
    r_img.save(r_path, 'PNG', optimize=True)
    
    # C. Adaptive foreground icon (Transparent canvas, emblem centered in safe zone 60% of fg_size)
    fg_img = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
    emb_fg_size = int(fg_size * 0.60) # 60% fits safely inside Android's 66dp/108dp (61.1%) safe circle
    emb_fg = master_emblem.resize((emb_fg_size, emb_fg_size), Image.Resampling.LANCZOS)
    fg_pos = ((fg_size - emb_fg_size) // 2, (fg_size - emb_fg_size) // 2)
    fg_img.paste(emb_fg, fg_pos, emb_fg)
    fg_path = os.path.join(folder_path, 'ic_launcher_foreground.png')
    fg_img.save(fg_path, 'PNG', optimize=True)
    
    print(f"Generated {folder}: ic_launcher ({l_size}x{l_size}), ic_launcher_round ({l_size}x{l_size}), ic_launcher_foreground ({fg_size}x{fg_size})")

print("All Android app icon densities generated successfully with strict safe zone compliance!")
