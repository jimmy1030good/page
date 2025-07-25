# download_kibo_images.py (v4 - 커스텀 CSV 구조 대응)
# -----------------------------------------------------------
# [수정] 독특한 CSV 파일 구조를 해석하여 모든 키보 이름을 추출하는 로직으로 변경
# -----------------------------------------------------------
import re
import time
import base64
from pathlib import Path
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ── 1. 설정 ───────────────────────────────────────
CSV_PATH   = "키보 상세.csv"
SAVE_DIR   = Path(r"C:\Users\jimmy90\Downloads\azure_info_viewer\kibo_image")
SAVE_DIR.mkdir(parents=True, exist_ok=True)
SAFE_DELAY = 1

# ── 2. 키보 이름 로드 & 정제 (커스텀 로직) ─────────
print(f"'{CSV_PATH}' 파일에서 키보 목록을 읽어옵니다...")
try:
    # 헤더가 없는 것으로 간주하고 파일 전체를 읽어옵니다.
    df = pd.read_csv(CSV_PATH, encoding='utf-8', header=None)
    
    all_keywords = []
    # 파일의 모든 행을 순회합니다.
    for index, row in df.iterrows():
        # 첫 번째 열이 '키보 이름'인 행을 찾습니다.
        if row[0] == '키보 이름':
            # 해당 행의 두 번째 열부터 끝까지의 데이터를 키워드 리스트에 추가합니다.
            kibo_names = row[1:].dropna().astype(str).tolist()
            all_keywords.extend(kibo_names)

    # 수집된 모든 키워드에 대해 정리 작업을 수행합니다.
    cleaned_keywords = pd.Series(all_keywords).map(
        lambda x: re.sub(r'\*+$', '', x).strip()
    ).unique()
    
    # 비어있는 키워드는 최종 목록에서 제거합니다.
    keywords = [kw for kw in cleaned_keywords if kw]

except FileNotFoundError:
    print(f"[오류] '{CSV_PATH}' 파일을 찾을 수 없습니다.")
    exit()

print(f"총 {len(keywords)}개의 유효한 키워드를 찾았습니다: {keywords}")

# ── 3. Selenium WebDriver 설정 ─────────────────────
if not keywords:
    print("처리할 키워드가 없어 프로그램을 종료합니다.")
    exit()

options = webdriver.ChromeOptions()
options.add_experimental_option('excludeSwitches', ['enable-logging'])
driver = webdriver.Chrome(options=options)
print("WebDriver가 시작되었습니다.")

# ── 4. 이미지 수집 루프 ───────────────────────────
# (이하 코드는 이전과 동일)
for kw in keywords:
    if any(SAVE_DIR.glob(f"{re.escape(kw)}.*")):
        print(f"[SKIP] '{kw}' 이미지가 이미 존재합니다.")
        continue

    print(f"[CRAWL] '{kw}' 이미지 검색 중...")
    try:
        driver.get(f"https://www.bing.com/images/search?q={kw}&first=1")
        first_thumbnail = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a.iusc"))
        )
        first_thumbnail.click()
        actual_image = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "img.mimg"))
        )
        image_url = actual_image.get_attribute('src')
        if not image_url or image_url.startswith('data:'):
             print(f"[FAIL] '{kw}' 이미지 URL을 가져올 수 없습니다.")
             continue
        script = """
            let callback = arguments[arguments.length - 1];
            let url = arguments[0];
            fetch(url).then(response => response.blob()).then(blob => {
                let reader = new FileReader();
                reader.onload = () => callback({base64: reader.result.split(',')[1], type: blob.type});
                reader.readAsDataURL(blob);
            }).catch(() => callback({base64: null}));
        """
        result = driver.execute_async_script(script, image_url)
        if result and result['base64']:
            image_data = base64.b64decode(result['base64'])
            ext = '.' + result['type'].split('/')[1] if 'image' in result['type'] else '.jpg'
            file_path = SAVE_DIR / f"{kw}{ext}"
            with open(file_path, 'wb') as f:
                f.write(image_data)
            print(f"[SUCCESS] '{kw}' -> '{file_path.name}' 저장 완료")
        else:
            print(f"[FAIL] '{kw}' 이미지 다운로드에 실패했습니다.")
    except Exception as e:
        print(f"[ERROR] '{kw}' 처리 중 오류 발생: {type(e).__name__}")
    
    time.sleep(SAFE_DELAY)

# ── 5. 종료 ────────────────────────────────────────
driver.quit()
print("\n✅  WebDriver를 종료하고 모든 작업을 완료했습니다.")