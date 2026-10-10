import urllib.request
import json
import os
import re
import time

API_KEY = "sk-QRN8IP1KBrWdlv6ZujCBk471ZYcwJ8jehrsoITXyVaKPPGD2"
BASE_URL = "https://cheapkeyai.shop/v1"
OUT_FILE = "src/data/tarot_cards.json"
os.makedirs("src/data", exist_ok=True)

with open("tarot_cards.json", "r", encoding="utf-8") as f:
    cards = json.load(f)

# Load existing progress if available
if os.path.exists(OUT_FILE):
    try:
        with open(OUT_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
            if len(existing) == 78:
                cards = existing
    except Exception as e:
        print("Could not load existing:", e)

def extract_json(raw_text):
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        # Try to find first { and last }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            return json.loads(text[start:end+1])
        raise

def translate_batch(batch):
    items = []
    for c in batch:
        items.append({
            "id": c["id"],
            "name": c["name"],
            "keywords_upright": c.get("keywords_upright", []),
            "keywords_reversed": c.get("keywords_reversed", []),
            "meaning_upright": c.get("meaning_upright", ""),
            "meaning_reversed": c.get("meaning_reversed", ""),
            "love": c.get("love", ""),
            "love_reversed": c.get("love_reversed", ""),
            "career": c.get("career", ""),
            "career_reversed": c.get("career_reversed", ""),
            "spiritual": c.get("spiritual", ""),
            "spiritual_reversed": c.get("spiritual_reversed", "")
        })

    prompt = f"""Dịch danh sách các lá bài Tarot sau sang tiếng Việt chuyên sâu, giàu cảm xúc, chuẩn xác ngữ nghĩa Tarot.
Yêu cầu trả về đúng định dạng JSON object: {{"cards": [...]}}, trong đó mỗi item có các trường:
- id: số ID của lá bài
- keywords_upright_vi: danh sách từ khóa xuôi tiếng Việt
- keywords_reversed_vi: danh sách từ khóa ngược tiếng Việt
- meaning_upright_vi: ý nghĩa tổng quan xuôi
- meaning_reversed_vi: ý nghĩa tổng quan ngược
- love_vi: ý nghĩa tình cảm xuôi
- love_reversed_vi: ý nghĩa tình cảm ngược
- career_vi: ý nghĩa sự nghiệp xuôi
- career_reversed_vi: ý nghĩa sự nghiệp ngược
- spiritual_vi: ý nghĩa tinh thần xuôi
- spiritual_reversed_vi: ý nghĩa tinh thần ngược

Dữ liệu đầu vào:
{json.dumps(items, ensure_ascii=False)}
"""

    req_body = json.dumps({
        "model": "gemini-3.7-flash",
        "messages": [
            {"role": "system", "content": "You are a professional Tarot translation API. Output ONLY valid JSON, no explanations."},
            {"role": "user", "content": prompt}
        ]
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions",
        data=req_body,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        }
    )

    with urllib.request.urlopen(req, timeout=90) as res:
        res_data = json.loads(res.read().decode("utf-8"))
        raw = res_data["choices"][0]["message"]["content"]
        parsed = extract_json(raw)
        return parsed.get("cards", [])

batch_size = 10
total = len(cards)

for i in range(0, total, batch_size):
    batch = cards[i:i+batch_size]
    # Check if this batch is already done
    if all("meaning_upright_vi" in c and c.get("meaning_upright_vi") for c in batch):
        print(f"Batch {i} to {i+len(batch)} already translated.")
        continue

    print(f"Translating batch {i} to {i+len(batch)}...")
    success = False
    for attempt in range(3):
        try:
            results = translate_batch(batch)
            res_map = {item["id"]: item for item in results}
            for c in batch:
                cid = c["id"]
                if cid in res_map:
                    item = res_map[cid]
                    for k in ["keywords_upright_vi", "keywords_reversed_vi", "meaning_upright_vi",
                              "meaning_reversed_vi", "love_vi", "love_reversed_vi",
                              "career_vi", "career_reversed_vi", "spiritual_vi", "spiritual_reversed_vi"]:
                        if k in item:
                            c[k] = item[k]
            with open(OUT_FILE, "w", encoding="utf-8") as f:
                json.dump(cards, f, ensure_ascii=False, indent=2)
            print(f"-> Saved batch {i} to {i+len(batch)}")
            success = True
            break
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {e}")
            time.sleep(3)

    if not success:
        print(f"Warning: Batch {i} could not be translated automatically, will use fallback.")

print("Finished! Total cards in dataset:", len(cards))
