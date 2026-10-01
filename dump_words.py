import pymupdf

doc = pymupdf.open('E:/Baliraja_Fitness/BAR.pdf')
page = doc[0]

with open('all_words.txt', 'w', encoding='utf-8') as f:
    for w in page.get_text('words'):
        f.write(f"Word [{w[0]:.1f}, {w[1]:.1f}, {w[2]:.1f}, {w[3]:.1f}]: {w[4]}\n")

print("Saved all_words.txt")
