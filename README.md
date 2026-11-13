# 🧁 Whimsical Pantry Tracker & Smart Recipe Cooker

A playful, mobile-optimized pantry manager with receipt scanning, live backend logging, dynamic recipe suggestions, and automatic ingredient deductions when cooking.

![Whimsical Pantry](https://img.shields.io/badge/Style-Whimsical%20%26%20Playful-orange?style=flat-square)
![Mobile First](https://img.shields.io/badge/Design-Mobile--Optimized-green?style=flat-square)
![Free Recipe API](https://img.shields.io/badge/API-TheMealDB%20Free%20API-brightgreen?style=flat-square)
![Backend Logging](https://img.shields.io/badge/Logging-Live%20Backend%20Audit-purple?style=flat-square)

---

## 🚀 How to Run

### Double-Click `start.bat`
Double-click **`start.bat`**.
- It automatically finds an open localhost port (e.g. `http://localhost:3001` or `3002`), avoiding conflicts.
- It opens your web browser automatically.
- Live scanner logs stream directly to the console window in real-time.

---

## 🍲 Pre-Populated Cookbook & Free TheMealDB API Integration

The **Recipes** tab is now pre-populated with **25+ classic, beloved comfort dishes** ready to match against your pantry ingredients:
- *Spaghetti al Pomodoro*, *Creamy Garlic Alfredo*, *Crispy Parmesan Chicken Skillet*, *Fluffy Golden Pancakes*, *Cheesy Garden Omelette*, *Fiesta Street Tacos*, *Custardy French Toast*, *Golden Grilled Cheese*, *Cozy Roasted Tomato Basil Soup*, *Stove-Top Mac & Cheese*, *Classic Vegetable Fried Rice*, *Crispy Chicken Quesadilla*, *Power Peanut Butter Banana Toast*, *Mediterranean Shakshuka*, *Garlic Butter Shrimp Rice Bowl*, *Beef & Broccoli Stir-Fry*, *Bacon & Egg Scramble*, *Garlic Butter Mushroom Fettuccine*, *Hearty Ground Beef Chili*, *Garlic Mashed Potatoes*, *Artisan Avocado Toast*, *Morning Honey Vanilla Coffee*, etc.

### 🌐 Live TheMealDB API Explorer (100% Free, Zero API Keys)
- Tap the **"🌐 Explore API"** or **"Search 500+"** button in the Recipes tab.
- **Search Anything**: Type any ingredient or dish (e.g., *Chicken*, *Pasta*, *Curry*, *Tacos*, *Pancakes*, *Cake*).
- **Category Filter**: Browse dishes by *Pasta*, *Chicken*, *Beef*, *Breakfast*, *Vegetarian*, *Seafood*, *Dessert*.
- **1-Click Import**: Tap **`+ Import`** on any online recipe to convert its ingredients, measurements, and instructions directly into your whimsical cookbook!

---

## 🧾 Intelligent Receipt Scanner & Backend Diagnostics

### 1. Robust Supermarket Receipt Parser
- **Middle Barcode Stripping**: Automatically strips 12-digit UPC barcodes and tax flags (`007874237003 F`) found on receipts from Walmart, Target, Kroger, etc.
- **Store Shorthand Translation**: Automatically maps `GV` $\rightarrow$ Great Value, `PNT BUTTR` $\rightarrow$ Peanut Butter (`🥜`), `PARM` $\rightarrow$ Parmesan Cheese (`🧀`), `CHNK CHKN` $\rightarrow$ Chunk Chicken (`🍗`), `FOLGERS` $\rightarrow$ Coffee (`☕`), `SC TWIST UP` $\rightarrow$ Twist Up Soda (`🥤`).
- **Receipt Boundary Filtering**:
  - Automatically skips store names, slogans, manager names, phone numbers, addresses, and register `ST#/OP#/TE#/TR#` codes.
  - Automatically stops parsing upon reaching `SUBTOTAL` or `TOTAL`, preventing payment cards, account numbers, and promotional ads from entering your pantry.
- **Zero-Loss Fallback**: Any non-catalog food items are kept as Pantry Staples rather than dropped.

### 2. Backend Logging
- **`logs/receipt-scans.log`**: Human-readable, structured audit trail showing every line, classification (`ACCEPTED`, `SKIPPED_STORE_HEADER`, `SKIPPED_PAYMENT_FOOTER`), and reason.
- **`logs/receipt-scans.jsonl`**: Machine-readable JSON Lines log for all scans.
- **`logs/latest-scan.json`**: Full JSON diagnostic payload of the most recent scan.
- **`logs/learned-dictionary.json`**: Permanent record of custom store terms and abbreviations your app has learned from you.
- **In-App Line Audit & Rescue Tool**: Tap **"🔍 Inspect Raw Scan & Line Audit"** on the Scan tab to review each line and click **`+ Add`** next to any skipped line.

---

## 🧠 4-Tier Self-Learning Architecture

The app now incorporates an **adaptive 4-tier pipeline** that learns your local grocery store's unique codes and your personal categorization preferences:

1. **Tier 1: Personal Learned Memory (100% Match)**
   - When you edit any scanned item (e.g. changing `Sen,` $\rightarrow$ `7-Up Soda`, Category: `Drinks`, Emoji: `🥤`), the app permanently commits that pattern to your **Memory Bank**.
   - The next time you scan a receipt with that item or shorthand, it recognizes it immediately with **100% confidence** (tagged with a golden `💡 Learned` pill).
   - Syncs automatically to `localStorage` and `logs/learned-dictionary.json`.
2. **Tier 2: High-Confidence Catalog & Regex (95% Match)**
   - Instant matching against a dictionary of fruits, vegetables, dairy, butcher cuts, grains, and pantry staples.
   - Tagged with a green `✓ Catalog` pill.
3. **Tier 3: Local Fuzzy Similarity Matcher (70% - 90% Match)**
   - Uses zero-dependency Levenshtein distance and consonant skeleton analysis.
   - Automatically catches vowel drops and OCR misreads (e.g. `WTRMLN` $\rightarrow$ `Watermelon`, `CHKN` $\rightarrow$ `Chicken`, `8ANANA` $\rightarrow$ `Banana`).
   - Tagged with a blue `🔍 Fuzzy (XX%)` pill.
4. **Tier 4: Friendly "New to Me!" Active Learning**
   - Truly unseen items are assigned a safe pantry default and flagged with a pulsing `✨ New to Me!` badge.
   - An inline category dropdown right in the staging row allows you to set the shelf in 1 click before stocking.
   - Once stocked, it is automatically promoted to Tier 1!
5. **Memory Bank Viewer**:
   - Tap **"🧠 Memory Bank"** on the Scan tab to search, inspect, or manage all the custom words your pantry has learned.
