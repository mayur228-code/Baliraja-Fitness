import pymupdf
import json

doc = pymupdf.open('E:/Baliraja_Fitness/BAR.pdf')
page = doc[0]

output_lines = []
output_lines.append(f"Page rect: {page.rect}")

# Inspect all text words and blocks
blocks = page.get_text('blocks')
output_lines.append(f"Total blocks: {len(blocks)}")
for i, b in enumerate(blocks):
    clean_text = b[4].strip().replace('\n', ' | ')
    output_lines.append(f"B{i:02d} [{b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}] : {clean_text}")

# Inspect all vector drawings / rects
drawings = page.get_drawings()
output_lines.append(f"\nTotal drawings: {len(drawings)}")
empty_boxes = []
for i, d in enumerate(drawings):
    r = d.get('rect')
    if r:
        w = r[2] - r[0]
        h = r[3] - r[1]
        empty_boxes.append((i, r, w, h, d.get('color'), d.get('fill'), d.get('width'), d.get('type')))

output_lines.append("\nAll boxes/shapes:")
for idx, r, w, h, color, fill, stroke_w, dtype in empty_boxes:
    output_lines.append(f"D{idx:03d} type:{dtype} Rect: [{r[0]:.1f}, {r[1]:.1f}, {r[2]:.1f}, {r[3]:.1f}] Size: {w:.1f}x{h:.1f} stroke:{stroke_w} color:{color} fill:{fill}")

with open('E:/Baliraja_Fitness/pdf_analysis.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print("Wrote E:/Baliraja_Fitness/pdf_analysis.txt successfully")
