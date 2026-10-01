import pymupdf

def test_precise_render():
    doc = pymupdf.open('E:/Baliraja_Fitness/BAR.pdf')
    page = doc[0]
    
    # Test data
    name = "राहुल विठ्ठल पाटील"
    mobile = "9876543210"
    village = "केज (बीड)"
    age = "32"
    gender = "Male"
    height = "172"
    date = "29/09/2026"
    
    weight = "78.5 kg"
    ideal_weight = "68.0 kg"
    extra_weight = "10.5 kg"
    less_weight = "-"
    
    body_fat = "22.4%"
    visceral_fat = "12%"
    resting_metabolism = "1650 kcal"
    bmi = "26.5"
    body_age = "38 वर्षे"
    
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
    
    # Header - Above underlines
    # Name underline: y=81.5 -> Text baseline at y=79.0
    page.insert_text((82, 79.0), name, fontsize=11, color=(0, 0.1, 0.5))
    # Mobile underline: y=92.2 -> Text baseline at y=89.5
    page.insert_text((395, 89.5), mobile, fontsize=11, color=(0, 0.1, 0.5))
    # Village underline: y=105.3 -> Text baseline at y=102.5
    page.insert_text((80, 102.5), village, fontsize=10.5, color=(0, 0.1, 0.5))
    # Age underline: y=115.8 -> Text baseline at y=113.0
    page.insert_text((275, 113.0), f"{age} ({gender})", fontsize=9.5, color=(0, 0.1, 0.5))
    # Height underline: y=114.9 -> Text baseline at y=112.5
    page.insert_text((358, 112.5), f"{height} cm", fontsize=10, color=(0, 0.1, 0.5))
    # Date underline: y=114.5 -> Text baseline at y=112.5
    page.insert_text((455, 112.5), date, fontsize=10, color=(0, 0.1, 0.5))
    
    # Weight Row:
    page.insert_text((90, 155), weight, fontsize=11.5, color=(0, 0.1, 0.5))
    page.insert_text((260, 155), ideal_weight, fontsize=11.5, color=(0, 0.1, 0.5))
    page.insert_text((375, 155), extra_weight, fontsize=11.5, color=(0.8, 0, 0))
    page.insert_text((485, 155), less_weight, fontsize=11.5, color=(0, 0.5, 0))
    
    # Body Fat % -> High Box at center=(274.01, 238.12)
    page.insert_text((258, 242.0), body_fat, fontsize=10.5, color=(0.7, 0.3, 0))
    
    # Visceral Fat % -> High Box at center=(274.01, 313.32)
    page.insert_text((263, 317.0), visceral_fat, fontsize=10.5, color=(0.7, 0.3, 0))
    
    # Resting Metabolism:
    page.insert_text((255, 368.0), resting_metabolism, fontsize=11, color=(0, 0.1, 0.5))
    
    # BMI -> High Box at center=(274.20, 420.70)
    page.insert_text((262, 424.5), bmi, fontsize=10.5, color=(0.7, 0.3, 0))
    
    # Body Age:
    page.insert_text((320, 468.0), body_age, fontsize=10.5, color=(0, 0.1, 0.5))
    
    # Subcutaneous Fat:
    page.insert_text((75, 576.5), sub_whole, fontsize=10.5, color=(0, 0.1, 0.5))
    page.insert_text((173, 568.0), sub_arms, fontsize=10.5, color=(0, 0.1, 0.5))
    page.insert_text((262, 567.8), sub_trunk, fontsize=10.5, color=(0, 0.1, 0.5))
    page.insert_text((348, 567.5), sub_legs, fontsize=10.5, color=(0, 0.1, 0.5))
    
    # Skeletal Muscle:
    page.insert_text((73, 648.0), skel_whole, fontsize=10.5, color=(0, 0.1, 0.5))
    page.insert_text((173, 642.5), skel_arms, fontsize=10.5, color=(0, 0.1, 0.5))
    page.insert_text((262, 642.0), skel_trunk, fontsize=10.5, color=(0, 0.1, 0.5))
    page.insert_text((348, 642.5), skel_legs, fontsize=10.5, color=(0, 0.1, 0.5))
    
    # Measurements (between lines):
    # Arms: y=(603.05+616.55)/2 = 609.8 -> Baseline ~ 613
    page.insert_text((445, 613.5), meas_arms, fontsize=10, color=(0, 0.1, 0.5))
    # Waist: y=(616.55+630.06)/2 = 623.3 -> Baseline ~ 627
    page.insert_text((445, 627.0), meas_waist, fontsize=10, color=(0, 0.1, 0.5))
    # Thigh: y=(630.06+643.82)/2 = 636.9 -> Baseline ~ 640.5
    page.insert_text((445, 640.5), meas_thigh, fontsize=10, color=(0, 0.1, 0.5))
    
    pix = page.get_pixmap(dpi=200)
    pix.save('E:/Baliraja_Fitness/test_precise.png')
    print("Saved test_precise.png")

if __name__ == '__main__':
    test_precise_render()
