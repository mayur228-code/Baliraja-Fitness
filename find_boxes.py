import pymupdf

doc = pymupdf.open('E:/Baliraja_Fitness/BAR.pdf')
page = doc[0]

# Let's inspect drawing rects in detail and identify all 17 input boxes/slots
print("=== All Small Rectangles (candidate boxes) ===")
for d in page.get_drawings():
    r = d.get('rect')
    if r:
        w = r[2] - r[0]
        h = r[3] - r[1]
        if 40 <= w <= 50 and 15 <= h <= 20:
            print(f"Box at x={r[0]:.1f}, y={r[1]:.1f}, w={w:.1f}, h={h:.1f}, center=({(r[0]+r[2])/2:.1f}, {(r[1]+r[3])/2:.1f})")
