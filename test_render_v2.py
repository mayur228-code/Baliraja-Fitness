import pymupdf

doc = pymupdf.open('BAR.pdf')
page = doc[0]

# Test Data
name = 'राहुल विठ्ठल पाटील'
mobile = '9876543210'
village = 'केज (बीड)'
age_gender = '32 (M)'
height = '172 cm'
date = '29/09/2026'

# Insert text with corrected y-positions
page.insert_text((80, 78.5), name, fontsize=12.5, color=(0, 0.1, 0.44))
page.insert_text((395, 89.0), mobile, fontsize=12.5, color=(0, 0.1, 0.44))
page.insert_text((80, 102.0), village, fontsize=12.0, color=(0, 0.1, 0.44))
page.insert_text((272, 112.5), age_gender, fontsize=11.5, color=(0, 0.1, 0.44))
page.insert_text((354, 112.0), height, fontsize=11.5, color=(0, 0.1, 0.44))
page.insert_text((452, 111.5), date, fontsize=11.5, color=(0, 0.1, 0.44))

# Weight
page.insert_text((92, 155.0), '78.5 kg', fontsize=13.0, color=(0, 0.1, 0.44))
page.insert_text((262, 155.0), '68.0 kg', fontsize=13.0, color=(0, 0.1, 0.44))
page.insert_text((376, 155.0), '10.5 kg', fontsize=13.0, color=(0.72, 0.11, 0.11))
page.insert_text((486, 155.0), '-', fontsize=13.0, color=(0, 0.1, 0.44))

# Boxes: center text inside box
def insert_centered(center_x, center_y, text, fontsize=12.0, color=(0, 0.1, 0.44)):
    tl = len(text) * fontsize * 0.55
    page.insert_text((center_x - tl/2, center_y + fontsize*0.35), text, fontsize=fontsize, color=color)

# Body Fat Risk
insert_centered(364.35, 237.95, '28.5%', 12.0, (0.72, 0.11, 0.11))
# Visceral High
insert_centered(273.9, 313.15, '12.0%', 12.0, (0.7, 0.33, 0.04))
# Resting Metabolism
page.insert_text((255, 368.0), '1650 kcal', fontsize=12.5, color=(0, 0.1, 0.44))
# BMI Risk
insert_centered(362.45, 420.45, '27.4', 12.0, (0.72, 0.11, 0.11))
# Body Age
page.insert_text((318, 466.0), '38 वर्षे', fontsize=12.0, color=(0, 0.1, 0.44))

# Subcutaneous
insert_centered(89.45, 572.45, '18.5%', 12.0, (0, 0.1, 0.44))
insert_centered(187.55, 564.05, '19.2%', 12.0, (0, 0.1, 0.44))
insert_centered(276.85, 563.7, '16.8%', 12.0, (0, 0.1, 0.44))
insert_centered(362.45, 563.5, '21.0%', 12.0, (0, 0.1, 0.44))

# Skeletal
insert_centered(87.85, 644.05, '34.5%', 12.0, (0, 0.1, 0.44))
insert_centered(187.55, 638.35, '42.0%', 12.0, (0, 0.1, 0.44))
insert_centered(276.85, 637.85, '28.5%', 12.0, (0, 0.1, 0.44))
insert_centered(362.45, 638.35, '47.0%', 12.0, (0, 0.1, 0.44))

# Measurements
page.insert_text((445, 613.0), '14.5"', fontsize=11.5, color=(0, 0.1, 0.44))
page.insert_text((445, 626.5), '36.0"', fontsize=11.5, color=(0, 0.1, 0.44))
page.insert_text((445, 640.0), '22.5"', fontsize=11.5, color=(0, 0.1, 0.44))

pix = page.get_pixmap(dpi=200)
pix.save('test_precise_v2.png')
print('Saved test_precise_v2.png')
