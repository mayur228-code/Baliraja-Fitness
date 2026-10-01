import pymupdf

def test_render():
    doc = pymupdf.open('E:/Baliraja_Fitness/BAR.pdf')
    page = doc[0]
    
    # Sample Test Data
    name = "राहुल विठ्ठल पाटील"
    mobile = "9876543210"
    village = "केज (बीड)"
    age = "32"
    gender = "Male"
    height = "172 cm"
    date = "29/09/2026"
    
    weight = "78.5 kg"
    ideal_weight = "68.0 kg"
    extra_weight = "10.5 kg"
    less_weight = "-"
    
    body_fat = "22.4%"
    visceral_fat = "12%"
    resting_metabolism = "1650 kcal"
    bmi = "26.5"
    body_age = "38"
    
    sub_whole = "18.5%"
    sub_arms = "19.2%"
    sub_trunk = "16.8%"
    sub_legs = "21.0%"
    
    skel_whole = "34.5%"
    skel_arms = "42.0%"
    skel_trunk = "28.5%"
    skel_legs = "47.0%"
    
    meas_arms = "14.5\""
    meas_waist = "36.0\""
    meas_thigh = "22.5\""
    
    # Header coordinates
    # Name line: x=76.6 to 307.6, y=81.5 -> Baseline ~ y=78
    page.insert_text((85, 78), name, fontsize=12, color=(0, 0, 0.7))
    # Mobile line: x=391.0 to 508.0, y=92.2 -> Baseline ~ y=88
    page.insert_text((395, 88), mobile, fontsize=12, color=(0, 0, 0.7))
    # Village line: x=76.2 to 231.1, y=105.3 -> Baseline ~ y=102
    page.insert_text((80, 102), village, fontsize=11, color=(0, 0, 0.7))
    # Age line: x=269.0 to 322.8, y=115.8 -> Baseline ~ y=112
    page.insert_text((275, 112), f"{age} ({gender})", fontsize=10, color=(0, 0, 0.7))
    # Height line: x=351.6 to 405.5, y=114.9 -> Baseline ~ y=112
    page.insert_text((355, 112), height, fontsize=10, color=(0, 0, 0.7))
    # Date line: x=447.3 to 526.9, y=114.5 -> Baseline ~ y=112
    page.insert_text((455, 112), date, fontsize=10, color=(0, 0, 0.7))
    
    # Weight row:
    page.insert_text((90, 155), weight, fontsize=12, color=(0, 0, 0.7))
    page.insert_text((260, 155), ideal_weight, fontsize=12, color=(0, 0, 0.7))
    page.insert_text((375, 155), extra_weight, fontsize=12, color=(0.8, 0, 0))
    page.insert_text((485, 155), less_weight, fontsize=12, color=(0, 0, 0.7))
    
    # Boxes:
    # Body Fat % (Male 22.4% -> High box at center 274.0, 238.0)
    page.insert_text((257, 242), body_fat, fontsize=11, color=(0, 0, 0.7))
    
    # Visceral Fat % (Male 12% -> High box at center 274.0, 313.3)
    page.insert_text((260, 317), visceral_fat, fontsize=11, color=(0, 0, 0.7))
    
    # Resting Metabolism (around x=260, y=365)
    page.insert_text((255, 368), resting_metabolism, fontsize=11, color=(0, 0, 0.7))
    
    # BMI (Male 26.5 -> High box at center 274.2, 420.6)
    page.insert_text((260, 424), bmi, fontsize=11, color=(0, 0, 0.7))
    
    # Body Age (around x=335, y=468)
    page.insert_text((330, 468), f"{body_age} वर्षे", fontsize=11, color=(0, 0, 0.7))
    
    # Regional Subcutaneous Fat
    page.insert_text((72, 576), sub_whole, fontsize=11, color=(0, 0, 0.7))
    page.insert_text((170, 567), sub_arms, fontsize=11, color=(0, 0, 0.7))
    page.insert_text((260, 567), sub_trunk, fontsize=11, color=(0, 0, 0.7))
    page.insert_text((345, 567), sub_legs, fontsize=11, color=(0, 0, 0.7))
    
    # Regional Skeletal Muscle
    page.insert_text((70, 647), skel_whole, fontsize=11, color=(0, 0, 0.7))
    page.insert_text((170, 642), skel_arms, fontsize=11, color=(0, 0, 0.7))
    page.insert_text((260, 642), skel_trunk, fontsize=11, color=(0, 0, 0.7))
    page.insert_text((345, 642), skel_legs, fontsize=11, color=(0, 0, 0.7))
    
    # Measurements table
    page.insert_text((445, 600), meas_arms, fontsize=10, color=(0, 0, 0.7))
    page.insert_text((445, 613), meas_waist, fontsize=10, color=(0, 0, 0.7))
    page.insert_text((445, 627), meas_thigh, fontsize=10, color=(0, 0, 0.7))
    
    # Render to test_output.png
    pix = page.get_pixmap(dpi=200)
    pix.save('E:/Baliraja_Fitness/test_output.png')
    print("Rendered E:/Baliraja_Fitness/test_output.png successfully")

if __name__ == '__main__':
    test_render()
