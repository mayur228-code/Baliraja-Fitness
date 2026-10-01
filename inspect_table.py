import pymupdf

doc = pymupdf.open('E:/Baliraja_Fitness/BAR.pdf')
page = doc[0]

with open('table_details.txt', 'w', encoding='utf-8') as f:
    f.write("=== BLOCKS IN PDF ===\n")
    for b in page.get_text('blocks'):
        f.write(f"Block [{b[0]:.2f}, {b[1]:.2f}, {b[2]:.2f}, {b[3]:.2f}]: {b[4].strip()}\n")

    f.write("\n=== VERTICAL LINES ===\n")
    for d in page.get_drawings():
        r = d.get('rect')
        if r:
            rw = r[2] - r[0]
            rh = r[3] - r[1]
            if rw < 3 and rh > 20:
                f.write(f"V-Line: x1={r[0]:.2f}, x2={r[2]:.2f}, y1={r[1]:.2f}, y2={r[3]:.2f}, h={rh:.2f}\n")

print("Saved table_details.txt")
