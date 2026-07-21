import re
import os
import base64

html_path = r"C:\Users\user\Downloads\carbontrack-landing-v3_1.html"
public_dir = r"c:\Carbon_Track_Server\Carbontrack-server\frontend\public"
out_html_path = r"c:\Carbon_Track_Server\Carbontrack-server\frontend\cleaned.html"

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract and save images
img_pattern = r'src="data:image/(png|jpeg|svg\+xml);base64,([^"]+)"'
video_pattern = r'src="data:video/(mp4);base64,([^"]+)"'

def save_media(match, ext_prefix, prefix_name):
    ext = match.group(1)
    if ext == 'svg+xml': ext = 'svg'
    data = match.group(2)
    filename = f"{prefix_name}.{ext}"
    filepath = os.path.join(public_dir, filename)
    with open(filepath, 'wb') as f:
        f.write(base64.b64decode(data))
    return f'src="/{filename}"'

img_count = 0
def img_repl(m):
    global img_count
    img_count += 1
    return save_media(m, 'img', f'landing_img_{img_count}')

vid_count = 0
def vid_repl(m):
    global vid_count
    vid_count += 1
    return save_media(m, 'video', f'landing_vid_{vid_count}')

content = re.sub(img_pattern, img_repl, content)
content = re.sub(video_pattern, vid_repl, content)

with open(out_html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Extracted {img_count} images and {vid_count} videos.")
