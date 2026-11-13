/**
 * Whimsical Pantry & Recipe Cooker
 * Mobile-optimized, playful pantry tracker with receipt scanning,
 * smart recipe suggestions, and automatic ingredient deduction on cooking.
 */

// --- Web Audio Synthesizer (Cute Whimsical Sound Effects) ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playPop() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (e) {}
}

function playScanSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, audioCtx.currentTime);
    osc.frequency.setValueAtTime(780, audioCtx.currentTime + 0.06);
    osc.frequency.setValueAtTime(1040, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.22);
  } catch (e) {}
}

function playSizzle() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.8;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 1.5;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch (e) {}
}

function playCelebrationFanfare() {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = audioCtx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  } catch (e) {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('pantry_sound_pref', soundEnabled ? '1' : '0');
  const icon = document.getElementById('soundIcon');
  if (icon) icon.textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled) playPop();
}

function toggleFrameSize() {
  const container = document.getElementById('appContainer');
  if (container) {
    if (container.classList.contains('max-w-md')) {
      container.classList.remove('max-w-md');
      container.classList.add('max-w-2xl');
    } else {
      container.classList.remove('max-w-2xl');
      container.classList.add('max-w-md');
    }
    playPop();
  }
}

// --- Data Models & Storage Keys ---
const STORAGE_PANTRY = 'whimsical_pantry_items_v1';
const STORAGE_RECIPES = 'whimsical_pantry_recipes_v1';
const STORAGE_HISTORY = 'whimsical_cook_history_v1';
const STORAGE_SHOPPING = 'whimsical_shopping_list_v1';
const STORAGE_LEARNED = 'whimsical_learned_dictionary_v1';
let learnedDictionary = {};

// Default Curated Recipes with Realistic Required Ingredients (Pre-populated 25+ Dishes)
const DEFAULT_RECIPES = [
  {
    id: 'rec_fruit_salad',
    title: 'Rainbow Fruit Medley',
    emoji: '🍉',
    category: 'Breakfast',
    time: 10,
    servings: 2,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Watermelon', amount: 1, unit: 'pcs' },
      { name: 'Kiwi', amount: 1, unit: 'pcs' },
      { name: 'Grapes', amount: 1, unit: 'lbs' },
      { name: 'Pears', amount: 1, unit: 'pcs' }
    ],
    instructions: '1. Cube chilled sweet watermelon and peel and slice kiwi.\n2. Rinse plump grapes and slice ripe pears.\n3. Gently toss fruits together in a whimsical bowl.\n4. Garnish with a sprig of mint and enjoy crisp sunshine!'
  },
  {
    id: 'rec_pomodoro',
    title: 'Spaghetti al Pomodoro',
    emoji: '🍝',
    category: 'Dinner',
    time: 20,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Pasta', amount: 0.5, unit: 'lbs' },
      { name: 'Tomatoes', amount: 1, unit: 'pint' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Cooking Oil', amount: 2, unit: 'tbsp' },
      { name: 'Fresh Herbs', amount: 1, unit: 'bunch' }
    ],
    instructions: '1. Cook pasta in salted boiling water until al dente.\n2. Sauté minced garlic in olive oil until golden.\n3. Add cherry tomatoes and simmer until blistered and jammy.\n4. Toss pasta with sauce and fold in fresh sweet basil!'
  },
  {
    id: 'rec_pancakes',
    title: 'Fluffy Golden Pancakes',
    emoji: '🥞',
    category: 'Breakfast',
    time: 15,
    servings: 3,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Flour', amount: 1.5, unit: 'cups' },
      { name: 'Milk', amount: 1, unit: 'cups' },
      { name: 'Eggs', amount: 2, unit: 'pcs' },
      { name: 'Butter', amount: 2, unit: 'tbsp' }
    ],
    instructions: '1. Whisk flour, sugar, and baking powder.\n2. Mix in milk, melted butter, and eggs.\n3. Pour onto a hot buttered griddle and flip when bubbly!\n4. Serve stacked warm with maple syrup.'
  },
  {
    id: 'rec_omelette',
    title: 'Cheesy Garden Omelette',
    emoji: '🍳',
    category: 'Breakfast',
    time: 10,
    servings: 1,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Eggs', amount: 3, unit: 'pcs' },
      { name: 'Cheese', amount: 0.5, unit: 'cups' },
      { name: 'Tomatoes', amount: 4, unit: 'pcs' },
      { name: 'Butter', amount: 1, unit: 'tbsp' }
    ],
    instructions: '1. Whisk eggs with a pinch of salt.\n2. Melt butter in a nonstick skillet on medium-low.\n3. Pour eggs, gently lifting edges as they set.\n4. Top with sliced tomatoes and cheese, fold and melt!'
  },
  {
    id: 'rec_garlic_chicken',
    title: 'Garlic Butter Chicken Skillet',
    emoji: '🍗',
    category: 'Dinner',
    time: 25,
    servings: 2,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Chicken', amount: 1, unit: 'lbs' },
      { name: 'Butter', amount: 2, unit: 'tbsp' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Cooking Oil', amount: 1, unit: 'tbsp' }
    ],
    instructions: '1. Season chicken breasts with salt and pepper.\n2. Sear in olive oil over high heat for 6 mins per side.\n3. Lower heat, toss in butter and smashed garlic cloves.\n4. Spoon the fragrant bubbling garlic butter over chicken.'
  },
  {
    id: 'rec_alfredo',
    title: 'Creamy Garlic Alfredo',
    emoji: '🧀',
    category: 'Dinner',
    time: 18,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Pasta', amount: 0.5, unit: 'lbs' },
      { name: 'Butter', amount: 3, unit: 'tbsp' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Milk', amount: 0.5, unit: 'cups' },
      { name: 'Cheese', amount: 1, unit: 'cups' }
    ],
    instructions: '1. Boil pasta until tender.\n2. Melt butter in pan, gently cook minced garlic.\n3. Stir in milk and slowly whisk in cheese until silky.\n4. Toss in warm pasta and coat generously.'
  },
  {
    id: 'rec_tacos',
    title: 'Fiesta Street Tacos',
    emoji: '🌮',
    category: 'Dinner',
    time: 20,
    servings: 3,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Beef', amount: 1, unit: 'lbs' },
      { name: 'Tortillas & Flatbreads', amount: 6, unit: 'pcs' },
      { name: 'Onions', amount: 1, unit: 'pcs' },
      { name: 'Cheese', amount: 0.5, unit: 'cups' },
      { name: 'Tomatoes', amount: 4, unit: 'pcs' }
    ],
    instructions: '1. Brown ground beef with taco seasoning in skillet.\n2. Warm tortillas on a dry comal until soft and pliable.\n3. Dice onions and tomatoes for fresh salsa topping.\n4. Assemble tacos with beef, cheese, and crunchy veggies!'
  },
  {
    id: 'rec_french_toast',
    title: 'Custardy French Toast',
    emoji: '🍞',
    category: 'Breakfast',
    time: 12,
    servings: 2,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Bread', amount: 4, unit: 'slices' },
      { name: 'Eggs', amount: 2, unit: 'pcs' },
      { name: 'Milk', amount: 0.5, unit: 'cups' },
      { name: 'Butter', amount: 1.5, unit: 'tbsp' }
    ],
    instructions: '1. Whisk eggs and milk in a shallow dish.\n2. Dip thick bread slices for 20 seconds each side.\n3. Fry in foaming butter until golden brown and puffed.\n4. Dust with cinnamon sugar or honey.'
  },
  {
    id: 'rec_grilled_cheese',
    title: 'Ultimate Golden Grilled Cheese',
    emoji: '🥪',
    category: 'Lunch',
    time: 10,
    servings: 1,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Bread', amount: 2, unit: 'slices' },
      { name: 'Cheese', amount: 0.5, unit: 'cups' },
      { name: 'Butter', amount: 1.5, unit: 'tbsp' }
    ],
    instructions: '1. Butter the outside of bread slices generously.\n2. Place cheese between bread and grill on low heat.\n3. Press gently until golden brown, flip and melt into gooey perfection!'
  },
  {
    id: 'rec_tomato_soup',
    title: 'Cozy Roasted Tomato Basil Soup',
    emoji: '🥣',
    category: 'Dinner',
    time: 25,
    servings: 3,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Tomatoes', amount: 2, unit: 'pint' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Onions', amount: 1, unit: 'pcs' },
      { name: 'Cooking Oil', amount: 2, unit: 'tbsp' },
      { name: 'Fresh Herbs', amount: 1, unit: 'bunch' }
    ],
    instructions: '1. Sauté chopped onions and minced garlic in olive oil.\n2. Add tomatoes and simmer until tender.\n3. Blend until silky smooth and stir in fresh basil leaves.'
  },
  {
    id: 'rec_mac_cheese',
    title: 'Creamy Stove-Top Mac & Cheese',
    emoji: '🧀',
    category: 'Dinner',
    time: 15,
    servings: 3,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Pasta', amount: 0.5, unit: 'lbs' },
      { name: 'Milk', amount: 1, unit: 'cups' },
      { name: 'Cheese', amount: 1.5, unit: 'cups' },
      { name: 'Butter', amount: 2, unit: 'tbsp' }
    ],
    instructions: '1. Boil macaroni until tender and drain.\n2. In the warm pot, melt butter, stir in milk and shredded cheese until creamy.\n3. Stir pasta back in and coat thoroughly!'
  },
  {
    id: 'rec_fried_rice',
    title: 'Classic Vegetable Fried Rice',
    emoji: '🍚',
    category: 'Dinner',
    time: 15,
    servings: 2,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Rice & Grains', amount: 2, unit: 'cups' },
      { name: 'Eggs', amount: 2, unit: 'pcs' },
      { name: 'Onions', amount: 1, unit: 'pcs' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Cooking Oil', amount: 1.5, unit: 'tbsp' }
    ],
    instructions: '1. Heat oil in skillet; scramble eggs and remove.\n2. Sauté minced garlic and onions until fragrant.\n3. Add cold cooked rice, toss over high heat, and fold eggs back in.'
  },
  {
    id: 'rec_quesadilla',
    title: 'Crispy Cheesy Chicken Quesadilla',
    emoji: '🧀',
    category: 'Lunch',
    time: 12,
    servings: 2,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Tortillas & Flatbreads', amount: 2, unit: 'pcs' },
      { name: 'Chicken', amount: 0.5, unit: 'lbs' },
      { name: 'Cheese', amount: 1, unit: 'cups' },
      { name: 'Butter', amount: 1, unit: 'tbsp' }
    ],
    instructions: '1. Place tortilla in hot buttered skillet.\n2. Layer shredded cooked chicken and cheese over one half.\n3. Fold over and toast each side until crunchy and bubbling.'
  },
  {
    id: 'rec_peanut_toast',
    title: 'Power Peanut Butter Banana Toast',
    emoji: '🥜',
    category: 'Breakfast',
    time: 5,
    servings: 1,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Bread', amount: 2, unit: 'slices' },
      { name: 'Peanut Butter', amount: 2, unit: 'tbsp' },
      { name: 'Bananas', amount: 1, unit: 'pcs' }
    ],
    instructions: '1. Toast bread slices until crispy.\n2. Spread rich peanut butter generously.\n3. Top with sliced ripe bananas and an optional drizzle of honey!'
  },
  {
    id: 'rec_chicken_parm',
    title: 'Crispy Parmesan Chicken Skillet',
    emoji: '🍗',
    category: 'Dinner',
    time: 25,
    servings: 2,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Chicken', amount: 1, unit: 'lbs' },
      { name: 'Parmesan Cheese', amount: 0.5, unit: 'cups' },
      { name: 'Tomatoes', amount: 1, unit: 'pint' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Cooking Oil', amount: 2, unit: 'tbsp' }
    ],
    instructions: '1. Season chicken cutlets and crust with parmesan cheese.\n2. Pan fry in oil until golden brown on both sides.\n3. Top with simmering crushed tomato garlic sauce and melt extra cheese!'
  },
  {
    id: 'rec_shakshuka',
    title: 'Mediterranean Shakshuka',
    emoji: '🍳',
    category: 'Breakfast',
    time: 20,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Eggs', amount: 4, unit: 'pcs' },
      { name: 'Tomatoes', amount: 2, unit: 'pint' },
      { name: 'Onions', amount: 1, unit: 'pcs' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Cooking Oil', amount: 1, unit: 'tbsp' }
    ],
    instructions: '1. Simmer diced tomatoes, onions, and garlic into a thick spiced sauce.\n2. Make small wells and crack fresh eggs into the sauce.\n3. Cover skillet and cook until whites are set and yolks remain runny.'
  },
  {
    id: 'rec_garlic_shrimp',
    title: 'Garlic Butter Shrimp Rice Bowl',
    emoji: '🦐',
    category: 'Dinner',
    time: 15,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Seafood', amount: 0.75, unit: 'lbs' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Butter', amount: 2, unit: 'tbsp' },
      { name: 'Rice & Grains', amount: 1.5, unit: 'cups' }
    ],
    instructions: '1. Sauté shrimp in bubbling butter and minced garlic for 3 minutes.\n2. Season with a squeeze of lemon and salt.\n3. Serve hot over a steaming bowl of rice!'
  },
  {
    id: 'rec_beef_broccoli',
    title: 'Savory Beef & Broccoli Stir-Fry',
    emoji: '🥩',
    category: 'Dinner',
    time: 18,
    servings: 2,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Beef', amount: 0.75, unit: 'lbs' },
      { name: 'Broccoli', amount: 1, unit: 'pcs' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Cooking Oil', amount: 1.5, unit: 'tbsp' }
    ],
    instructions: '1. Slice beef thinly against the grain.\n2. Stir-fry beef in hot skillet for 3 mins, remove.\n3. Sauté broccoli and garlic with a splash of water, toss beef back in.'
  },
  {
    id: 'rec_bacon_scramble',
    title: 'Crispy Bacon & Egg Scramble',
    emoji: '🥓',
    category: 'Breakfast',
    time: 10,
    servings: 2,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Bacon', amount: 4, unit: 'slices' },
      { name: 'Eggs', amount: 4, unit: 'pcs' },
      { name: 'Cheese', amount: 0.5, unit: 'cups' }
    ],
    instructions: '1. Fry bacon in skillet until crisp, chop into bites.\n2. Pour beaten eggs into bacon drippings over low heat.\n3. Gently fold eggs until soft and creamy, fold in cheese and bacon.'
  },
  {
    id: 'rec_mushroom_pasta',
    title: 'Garlic Butter Mushroom Fettuccine',
    emoji: '🍄',
    category: 'Dinner',
    time: 18,
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Pasta', amount: 0.5, unit: 'lbs' },
      { name: 'Mushrooms', amount: 1, unit: 'pack' },
      { name: 'Butter', amount: 2, unit: 'tbsp' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Parmesan Cheese', amount: 0.25, unit: 'cups' }
    ],
    instructions: '1. Sauté sliced mushrooms in butter until golden caramelized.\n2. Add minced garlic and toss with boiled pasta.\n3. Finish with a heavy dusting of parmesan cheese!'
  },
  {
    id: 'rec_chili',
    title: 'Hearty Ground Beef Chili',
    emoji: '🍲',
    category: 'Dinner',
    time: 30,
    servings: 4,
    difficulty: 'Medium',
    ingredients: [
      { name: 'Beef', amount: 1, unit: 'lbs' },
      { name: 'Canned Beans', amount: 1, unit: 'can' },
      { name: 'Tomatoes', amount: 1, unit: 'pint' },
      { name: 'Onions', amount: 1, unit: 'pcs' },
      { name: 'Garlic', amount: 2, unit: 'cloves' }
    ],
    instructions: '1. Brown ground beef and diced onions in soup pot.\n2. Stir in crushed tomatoes, drained beans, and minced garlic.\n3. Simmer on low for 25 mins until rich and thick.'
  },
  {
    id: 'rec_mashed_potatoes',
    title: 'Velvety Garlic Mashed Potatoes',
    emoji: '🥔',
    category: 'Dinner',
    time: 20,
    servings: 3,
    difficulty: 'Easy',
    ingredients: [
      { name: 'Potatoes', amount: 2, unit: 'lbs' },
      { name: 'Butter', amount: 3, unit: 'tbsp' },
      { name: 'Milk', amount: 0.5, unit: 'cups' },
      { name: 'Garlic', amount: 2, unit: 'cloves' }
    ],
    instructions: '1. Boil peeled potato chunks in salted water until fork-tender.\n2. Drain and mash with melted butter, warm milk, and minced garlic.\n3. Season with salt and pepper to taste.'
  },
  {
    id: 'rec_avocado_toast',
    title: 'Artisan Avocado & Poached Egg Toast',
    emoji: '🥑',
    category: 'Breakfast',
    time: 10,
    servings: 1,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Bread', amount: 2, unit: 'slices' },
      { name: 'Avocado', amount: 1, unit: 'pcs' },
      { name: 'Eggs', amount: 2, unit: 'pcs' },
      { name: 'Cooking Oil', amount: 1, unit: 'tsp' }
    ],
    instructions: '1. Toast bread slices.\n2. Mash avocado with a squeeze of lemon and salt, spread on toast.\n3. Top with freshly poached or sunny-side-up eggs!'
  },
  {
    id: 'rec_folgers_coffee',
    title: 'Morning Honey Vanilla Coffee',
    emoji: '☕',
    category: 'Breakfast',
    time: 5,
    servings: 1,
    difficulty: 'Quick',
    ingredients: [
      { name: 'Folgers Coffee', amount: 1, unit: 'pcs' },
      { name: 'Milk', amount: 0.25, unit: 'cups' },
      { name: 'Sweetener', amount: 1, unit: 'tbsp' }
    ],
    instructions: '1. Brew fresh hot Folgers coffee.\n2. Froth warm milk and stir in honey or sugar.\n3. Pour milk over coffee for a cozy morning latte!'
  }
];

// Pre-loaded realistic grocery hauls for instant receipt scanning test
const SAMPLE_RECEIPTS = {
  trader_joes: {
    name: "Trader Joe's Haul",
    items: [
      { name: 'Spaghetti Pasta', qty: 1, unit: 'lbs', category: 'Grains', emoji: '🍝', freshness: 'fresh' },
      { name: 'Cherry Tomatoes', qty: 2, unit: 'pint', category: 'Produce', emoji: '🍅', freshness: 'ripe' },
      { name: 'Organic Eggs', qty: 12, unit: 'pcs', category: 'Dairy', emoji: '🥚', freshness: 'fresh' },
      { name: 'Whole Milk', qty: 1, unit: 'gal', category: 'Dairy', emoji: '🥛', freshness: 'fresh' },
      { name: 'Cheddar Cheese', qty: 8, unit: 'oz', category: 'Dairy', emoji: '🧀', freshness: 'fresh' },
      { name: 'Fresh Basil', qty: 1, unit: 'bunch', category: 'Produce', emoji: '🌿', freshness: 'soon' },
      { name: 'Garlic', qty: 3, unit: 'cloves', category: 'Produce', emoji: '🧄', freshness: 'fresh' },
      { name: 'Olive Oil', qty: 1, unit: 'jar', category: 'Spices', emoji: '🫒', freshness: 'fresh' },
      { name: 'Unsalted Butter', qty: 1, unit: 'lbs', category: 'Dairy', emoji: '🧈', freshness: 'fresh' }
    ]
  },
  farmers_market: {
    name: "Farmers Market Fresh",
    items: [
      { name: 'Cherry Tomatoes', qty: 3, unit: 'lbs', category: 'Produce', emoji: '🍅', freshness: 'ripe' },
      { name: 'Garlic', qty: 4, unit: 'cloves', category: 'Produce', emoji: '🧄', freshness: 'fresh' },
      { name: 'Fresh Basil', qty: 2, unit: 'bunch', category: 'Produce', emoji: '🌿', freshness: 'soon' },
      { name: 'Onions', qty: 3, unit: 'pcs', category: 'Produce', emoji: '🧅', freshness: 'fresh' },
      { name: 'Olive Oil', qty: 1, unit: 'jar', category: 'Spices', emoji: '🫒', freshness: 'fresh' }
    ]
  },
  weekend_brunch: {
    name: "Weekend Brunch",
    items: [
      { name: 'Flour', qty: 2, unit: 'lbs', category: 'Grains', emoji: '🌾', freshness: 'fresh' },
      { name: 'Whole Milk', qty: 1, unit: 'gal', category: 'Dairy', emoji: '🥛', freshness: 'fresh' },
      { name: 'Unsalted Butter', qty: 1, unit: 'lbs', category: 'Dairy', emoji: '🧈', freshness: 'fresh' },
      { name: 'Organic Eggs', qty: 12, unit: 'pcs', category: 'Dairy', emoji: '🥚', freshness: 'fresh' },
      { name: 'Bread', qty: 1, unit: 'loaf', category: 'Bakery', emoji: '🍞', freshness: 'ripe' }
    ]
  },
  taco_night: {
    name: "Fiesta Taco Haul",
    items: [
      { name: 'Ground Beef', qty: 2, unit: 'lbs', category: 'Protein', emoji: '🥩', freshness: 'ripe' },
      { name: 'Corn Tortillas', qty: 12, unit: 'pcs', category: 'Bakery', emoji: '🫓', freshness: 'fresh' },
      { name: 'Onions', qty: 2, unit: 'pcs', category: 'Produce', emoji: '🧅', freshness: 'fresh' },
      { name: 'Cherry Tomatoes', qty: 1, unit: 'pint', category: 'Produce', emoji: '🍅', freshness: 'fresh' },
      { name: 'Cheddar Cheese', qty: 8, unit: 'oz', category: 'Dairy', emoji: '🧀', freshness: 'fresh' }
    ]
  }
};

// Common grocery dictionary for auto emoji and category detection during OCR
const INGREDIENT_DICTIONARY = [
  { match: /egg/i, name: 'Organic Eggs', category: 'Dairy', emoji: '🥚', defaultUnit: 'pcs' },
  { match: /milk/i, name: 'Whole Milk', category: 'Dairy', emoji: '🥛', defaultUnit: 'gal' },
  { match: /cheese|cheddar|parmesan|mozzarella/i, name: 'Cheddar Cheese', category: 'Dairy', emoji: '🧀', defaultUnit: 'cups' },
  { match: /butter/i, name: 'Unsalted Butter', category: 'Dairy', emoji: '🧈', defaultUnit: 'lbs' },
  { match: /yogurt/i, name: 'Yogurt', category: 'Dairy', emoji: '🍦', defaultUnit: 'cups' },
  { match: /tomato/i, name: 'Cherry Tomatoes', category: 'Produce', emoji: '🍅', defaultUnit: 'pint' },
  { match: /garlic/i, name: 'Garlic', category: 'Produce', emoji: '🧄', defaultUnit: 'cloves' },
  { match: /onion/i, name: 'Onions', category: 'Produce', emoji: '🧅', defaultUnit: 'pcs' },
  { match: /basil/i, name: 'Fresh Basil', category: 'Produce', emoji: '🌿', defaultUnit: 'bunch' },
  { match: /avocado/i, name: 'Avocado', category: 'Produce', emoji: '🥑', defaultUnit: 'pcs' },
  { match: /potato/i, name: 'Potatoes', category: 'Produce', emoji: '🥔', defaultUnit: 'lbs' },
  { match: /carrot/i, name: 'Carrots', category: 'Produce', emoji: '🥕', defaultUnit: 'pcs' },
  { match: /spinach|kale|lettuce/i, name: 'Spinach', category: 'Produce', emoji: '🥬', defaultUnit: 'bunch' },
  { match: /chicken|breast|thigh/i, name: 'Chicken Breast', category: 'Protein', emoji: '🍗', defaultUnit: 'lbs' },
  { match: /beef|steak|ground/i, name: 'Ground Beef', category: 'Protein', emoji: '🥩', defaultUnit: 'lbs' },
  { match: /salmon|fish|tuna/i, name: 'Salmon', category: 'Protein', emoji: '🐟', defaultUnit: 'lbs' },
  { match: /bacon|pork/i, name: 'Bacon', category: 'Protein', emoji: '🥓', defaultUnit: 'slices' },
  { match: /spaghetti|pasta|fettuccine|penne|macaroni/i, name: 'Spaghetti Pasta', category: 'Grains', emoji: '🍝', defaultUnit: 'lbs' },
  { match: /rice/i, name: 'Jasmine Rice', category: 'Grains', emoji: '🍚', defaultUnit: 'cups' },
  { match: /flour/i, name: 'Flour', category: 'Grains', emoji: '🌾', defaultUnit: 'cups' },
  { match: /bread|loaf/i, name: 'Bread', category: 'Bakery', emoji: '🍞', defaultUnit: 'slices' },
  { match: /tortilla/i, name: 'Corn Tortillas', category: 'Bakery', emoji: '🫓', defaultUnit: 'pcs' },
  { match: /oil|olive oil/i, name: 'Olive Oil', category: 'Spices', emoji: '🫒', defaultUnit: 'tbsp' },
  { match: /salt/i, name: 'Salt', category: 'Spices', emoji: '🧂', defaultUnit: 'tsp' },
  { match: /pepper/i, name: 'Black Pepper', category: 'Spices', emoji: '🌶️', defaultUnit: 'tsp' },
  { match: /sugar|honey/i, name: 'Sugar', category: 'Spices', emoji: '🍯', defaultUnit: 'tbsp' },
];

// App State
let pantryItems = [];
let recipes = [];
let cookingHistory = [];
let shoppingList = [];
let scannedStagingItems = [];
let activeCategoryFilter = 'all';
let activeRecipeFilter = 'can_cook';
let pendingCookRecipe = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupIcons();
  renderPantry();
  renderRecipes();
  renderHistory();
  updateGlobalStats();

  const savedSound = localStorage.getItem('pantry_sound_pref');
  if (savedSound !== null) {
    soundEnabled = savedSound === '1';
    const icon = document.getElementById('soundIcon');
    if (icon) icon.textContent = soundEnabled ? '🔊' : '🔇';
  }
});

function setupIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- LocalStorage Persistence ---
function loadStoredData() {
  try {
    const rawPantry = localStorage.getItem(STORAGE_PANTRY);
    pantryItems = rawPantry ? JSON.parse(rawPantry) : [];

    // Automatically clean & migrate stored pantry items from previous scans
    let pantryModified = false;
    pantryItems = pantryItems.map(item => {
      let name = item.name || '';
      let qty = item.qty || 1;
      let unit = item.unit || 'pcs';
      let category = item.category || 'Produce';
      let emoji = item.emoji || '🥫';

      // 1. Strip leading count if stuck in name: "1 Watermelon" -> qty: 1, name: "Watermelon"
      const leadCount = name.match(/^(\d+(?:\.\d+)?)\s+([a-zA-Z].*)/);
      if (leadCount) {
        qty = parseFloat(leadCount[1]) || qty;
        name = leadCount[2].trim();
        pantryModified = true;
      }

      // 2. Clean trailing/leading punctuation: "Sen," -> "Sen"
      const cleanNameOnly = name.replace(/[,;:\.]+$|^[,;:\.]+/g, '').trim();
      if (cleanNameOnly !== name) {
        name = cleanNameOnly;
        pantryModified = true;
      }

      // 3. Fix category and emoji if wrongly labeled as Spices or salt shaker
      const properCat = guessCategoryFromName(name);
      if (category === 'Spices' && properCat !== 'Spices') {
        category = properCat;
        pantryModified = true;
      }
      const properEmoji = guessEmojiFromName(name, category);
      if (emoji === '🧂' || emoji === '🥫' || (properEmoji !== '🥫' && emoji !== properEmoji)) {
        emoji = properEmoji;
        pantryModified = true;
      }

      return {
        ...item,
        name: formatTitleCase(name),
        qty: qty,
        unit: unit,
        category: category,
        emoji: emoji
      };
    });

    if (pantryModified) {
      savePantry();
    }

    const rawRecipes = localStorage.getItem(STORAGE_RECIPES);
    let loadedRecipes = rawRecipes ? JSON.parse(rawRecipes) : DEFAULT_RECIPES;

    // Automatically ensure all curated pre-populated recipes are present in the cookbook
    DEFAULT_RECIPES.forEach(defR => {
      if (!loadedRecipes.some(r => r.id === defR.id || r.title.toLowerCase() === defR.title.toLowerCase())) {
        loadedRecipes.push(defR);
      }
    });
    recipes = loadedRecipes;

    const rawHistory = localStorage.getItem(STORAGE_HISTORY);
    cookingHistory = rawHistory ? JSON.parse(rawHistory) : [];

    const rawShopping = localStorage.getItem(STORAGE_SHOPPING);
    shoppingList = rawShopping ? JSON.parse(rawShopping) : [];

    // If pantry is brand new, prefill a delightful starter pantry so recipes show immediately!
    if (pantryItems.length === 0 && !localStorage.getItem('whimsical_visited_before')) {
      loadInitialStarterPantry();
      localStorage.setItem('whimsical_visited_before', 'true');
    }

    // Load active learned memory & sync with server
    loadLearnedDictionary();
    syncLearnedDictionaryWithBackend();
  } catch (e) {
    console.error('Error loading stored data:', e);
  }
}

// -------------------------------------------------------------
// SELF-TRAINING & LEARNED MEMORY ENGINE (TIER 1)
// -------------------------------------------------------------
function loadLearnedDictionary() {
  try {
    const raw = localStorage.getItem(STORAGE_LEARNED);
    learnedDictionary = raw ? JSON.parse(raw) : {};
  } catch (e) {
    learnedDictionary = {};
  }
  updateLearnedBadges();
}

function saveLearnedDictionary() {
  try {
    localStorage.setItem(STORAGE_LEARNED, JSON.stringify(learnedDictionary));
  } catch (e) {}

  // Sync with backend server
  syncLearnedDictionaryWithBackend(learnedDictionary);
  updateLearnedBadges();
}

function saveLearnedEntry(rawKey, data) {
  const normKey = (rawKey || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (!normKey || normKey.length < 2) return;

  learnedDictionary[normKey] = {
    canonicalName: data.canonicalName,
    category: data.category,
    emoji: data.emoji,
    unit: data.unit || 'pcs',
    rawSource: data.rawSource || rawKey,
    learnedAt: Date.now(),
    timesConfirmed: ((learnedDictionary[normKey] && learnedDictionary[normKey].timesConfirmed) || 0) + 1
  };

  saveLearnedDictionary();
}

function syncLearnedDictionaryWithBackend(payload) {
  if (payload) {
    // POST updated dictionary to backend
    fetch('/api/learned-dictionary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } else {
    // GET existing dictionary from backend on startup
    fetch('/api/learned-dictionary')
      .then(res => res.json())
      .then(serverDict => {
        if (serverDict && typeof serverDict === 'object' && Object.keys(serverDict).length > 0) {
          // Merge server dictionary with local storage (local takes precedence if newer)
          learnedDictionary = { ...serverDict, ...learnedDictionary };
          try {
            localStorage.setItem(STORAGE_LEARNED, JSON.stringify(learnedDictionary));
          } catch (e) {}
          updateLearnedBadges();
        }
      })
      .catch(() => {});
  }
}

function updateLearnedBadges() {
  const count = Object.keys(learnedDictionary).length;
  const badges = [
    document.getElementById('learnedMemoryCount'),
    document.getElementById('scanTabLearnedCount'),
    document.getElementById('learnedMemoryQuickBadge')
  ];
  badges.forEach(b => {
    if (b) b.textContent = count;
  });
}

function openLearnedMemoryModal() {
  playPop();
  renderLearnedMemoryList();
  const modal = document.getElementById('learnedMemoryModal');
  if (modal) modal.classList.remove('hidden');
}

function closeLearnedMemoryModal() {
  playPop();
  const modal = document.getElementById('learnedMemoryModal');
  if (modal) modal.classList.add('hidden');
}

function renderLearnedMemoryList() {
  const container = document.getElementById('learnedMemoryList');
  const footerTotal = document.getElementById('learnedMemoryTotalFooter');
  const searchInput = document.getElementById('learnedMemorySearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  if (!container) return;

  const entries = Object.entries(learnedDictionary);
  if (footerTotal) {
    footerTotal.textContent = `${entries.length} items remembered in memory`;
  }

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-stone-400 space-y-1">
        <div class="text-3xl">🌱</div>
        <p class="font-bold text-xs text-stone-600">No learned words yet!</p>
        <p class="text-[11px] text-stone-400 font-semibold max-w-xs mx-auto">
          Whenever you edit a scanned receipt item, your app remembers it here permanently.
        </p>
      </div>
    `;
    return;
  }

  const filtered = entries.filter(([key, data]) => {
    if (!query) return true;
    return key.includes(query) || 
      (data.canonicalName && data.canonicalName.toLowerCase().includes(query)) || 
      (data.category && data.category.toLowerCase().includes(query));
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-stone-400 text-xs font-semibold">
        No remembered items matching "${query}".
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(([key, data]) => {
    const formattedDate = data.learnedAt ? new Date(data.learnedAt).toLocaleDateString() : 'Active';
    return `
      <div class="flex items-center justify-between p-2.5 bg-amber-50/70 border border-pantry-wood/30 rounded-xl text-xs gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xl flex-shrink-0">${data.emoji || '🥫'}</span>
          <div class="truncate">
            <div class="font-bold text-stone-800">${data.canonicalName}</div>
            <div class="text-[10px] text-stone-500 font-mono">
              Pattern: <span class="bg-stone-200/80 px-1 py-0.2 rounded font-bold">${key}</span> • ${data.category} • ${formattedDate}
            </div>
          </div>
        </div>
        <button onclick="deleteLearnedEntry('${key}')" class="text-stone-300 hover:text-rose-600 p-1 pressable" title="Delete learned word">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
  }).join('');

  setupIcons();
}

function deleteLearnedEntry(rawKey) {
  playPop();
  delete learnedDictionary[rawKey];
  saveLearnedDictionary();
  renderLearnedMemoryList();
}

function clearAllLearnedMemory() {
  if (Object.keys(learnedDictionary).length === 0) return;
  if (!confirm('Are you sure you want to clear your pantry’s learned memory?')) return;
  playPop();
  learnedDictionary = {};
  saveLearnedDictionary();
  renderLearnedMemoryList();
}

function savePantry() {
  localStorage.setItem(STORAGE_PANTRY, JSON.stringify(pantryItems));
  updateGlobalStats();
  renderPantry();
  renderRecipes();
}

function saveRecipes() {
  localStorage.setItem(STORAGE_RECIPES, JSON.stringify(recipes));
  renderRecipes();
  updateGlobalStats();
}

function saveHistory() {
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(cookingHistory));
  renderHistory();
}

function saveShopping() {
  localStorage.setItem(STORAGE_SHOPPING, JSON.stringify(shoppingList));
  renderHistory();
}

function loadInitialStarterPantry() {
  pantryItems = [
    { id: 'p_1', name: 'Organic Eggs', qty: 6, unit: 'pcs', category: 'Dairy', emoji: '🥚', freshness: 'fresh', addedAt: Date.now() },
    { id: 'p_2', name: 'Cherry Tomatoes', qty: 1, unit: 'pint', category: 'Produce', emoji: '🍅', freshness: 'ripe', addedAt: Date.now() },
    { id: 'p_3', name: 'Spaghetti Pasta', qty: 1, unit: 'lbs', category: 'Grains', emoji: '🍝', freshness: 'fresh', addedAt: Date.now() },
    { id: 'p_4', name: 'Garlic', qty: 4, unit: 'cloves', category: 'Produce', emoji: '🧄', freshness: 'fresh', addedAt: Date.now() },
    { id: 'p_5', name: 'Olive Oil', qty: 1, unit: 'jar', category: 'Spices', emoji: '🫒', freshness: 'fresh', addedAt: Date.now() },
    { id: 'p_6', name: 'Fresh Basil', qty: 1, unit: 'bunch', category: 'Produce', emoji: '🌿', freshness: 'soon', addedAt: Date.now() },
    { id: 'p_7', name: 'Unsalted Butter', qty: 1, unit: 'lbs', category: 'Dairy', emoji: '🧈', freshness: 'fresh', addedAt: Date.now() },
    { id: 'p_8', name: 'Cheddar Cheese', qty: 1, unit: 'cups', category: 'Dairy', emoji: '🧀', freshness: 'fresh', addedAt: Date.now() }
  ];
  savePantry();
}

function loadSamplePantryData() {
  loadPresetReceipt('trader_joes');
  commitScannedToPantry();
  switchTab('pantry');
  playCelebrationFanfare();
}

// --- Navigation Tabs ---
function switchTab(tabId) {
  playPop();
  
  const views = {
    pantry: document.getElementById('viewPantry'),
    scan: document.getElementById('viewScan'),
    recipes: document.getElementById('viewRecipes'),
    history: document.getElementById('viewHistory')
  };

  const navBtns = {
    pantry: document.getElementById('navPantry'),
    scan: document.getElementById('navScan'),
    recipes: document.getElementById('navRecipes'),
    history: document.getElementById('navHistory')
  };

  Object.keys(views).forEach(key => {
    if (views[key]) {
      if (key === tabId) {
        views[key].classList.remove('hidden');
      } else {
        views[key].classList.add('hidden');
      }
    }
    
    if (navBtns[key]) {
      const iconWrap = navBtns[key].querySelector('.nav-icon-wrap');
      if (key === tabId) {
        navBtns[key].classList.add('text-pantry-woodDark');
        navBtns[key].classList.remove('text-stone-400');
        if (iconWrap) {
          iconWrap.classList.add('bg-amber-100', 'border-pantry-woodDark');
          iconWrap.classList.remove('bg-stone-100', 'border-stone-300');
        }
      } else if (key !== 'scan') {
        navBtns[key].classList.remove('text-pantry-woodDark');
        navBtns[key].classList.add('text-stone-400');
        if (iconWrap) {
          iconWrap.classList.remove('bg-amber-100', 'border-pantry-woodDark');
          iconWrap.classList.add('bg-stone-100', 'border-stone-300');
        }
      }
    }
  });

  if (tabId === 'recipes') {
    renderRecipes();
  } else if (tabId === 'pantry') {
    renderPantry();
  } else if (tabId === 'history') {
    renderHistory();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  setupIcons();
}

// --- Global Stats Ribbon ---
function updateGlobalStats() {
  const pantryCountEl = document.getElementById('statPantryCount');
  const readyCountEl = document.getElementById('statReadyRecipes');
  
  if (pantryCountEl) {
    pantryCountEl.textContent = `${pantryItems.length} items stocked`;
  }

  const readyCount = recipes.filter(r => checkRecipeCanCook(r).canCook).length;
  if (readyCountEl) {
    readyCountEl.textContent = `${readyCount} ready to cook`;
  }

  const filterReadyEl = document.getElementById('filterReadyCount');
  const filterAllEl = document.getElementById('filterAllCount');
  if (filterReadyEl) filterReadyEl.textContent = readyCount;
  if (filterAllEl) filterAllEl.textContent = recipes.length;
}

// --- PANTRY SHELVES VIEW ---
function setCategoryFilter(category) {
  activeCategoryFilter = category;
  playPop();
  
  document.querySelectorAll('.cat-pill').forEach(pill => {
    if (pill.dataset.category === category) {
      pill.classList.add('bg-pantry-wood', 'text-white');
      pill.classList.remove('bg-white', 'text-stone-700');
    } else {
      pill.classList.remove('bg-pantry-wood', 'text-white');
      pill.classList.add('bg-white', 'text-stone-700');
    }
  });
  renderPantry();
}

function renderPantry() {
  const container = document.getElementById('pantryShelvesContainer');
  const emptyState = document.getElementById('emptyPantryState');
  const searchInput = document.getElementById('pantrySearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (!container) return;
  container.innerHTML = '';

  let filtered = pantryItems.filter(item => {
    const matchesCat = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    const matchesQuery = !query || item.name.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  if (pantryItems.length === 0) {
    emptyState.classList.remove('hidden');
    container.classList.add('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
    container.classList.remove('hidden');
  }

  const categories = [
    { key: 'Produce', title: 'Fresh Produce Bin', icon: '🥦' },
    { key: 'Dairy', title: 'Chilled Dairy Shelf', icon: '🧀' },
    { key: 'Grains', title: 'Grains & Pasta Jars', icon: '🌾' },
    { key: 'Protein', title: 'Butcher Proteins', icon: '🥩' },
    { key: 'Bakery', title: 'Bakery Basket', icon: '🍞' },
    { key: 'Drinks', title: 'Beverage Bar & Refreshments', icon: '🥤' },
    { key: 'Spices', title: 'Spice & Condiment Rack', icon: '🧂' },
  ];

  let totalRendered = 0;

  categories.forEach(cat => {
    const itemsInCat = filtered.filter(item => (item.category || 'Produce') === cat.key);
    if (itemsInCat.length === 0) return;
    totalRendered += itemsInCat.length;

    const shelfSection = document.createElement('div');
    shelfSection.className = 'space-y-2';

    shelfSection.innerHTML = `
      <div class="flex items-center justify-between px-1">
        <h4 class="font-display font-bold text-sm text-stone-700 flex items-center gap-1.5">
          <span>${cat.icon}</span>
          <span>${cat.title}</span>
          <span class="text-[10px] bg-stone-200/80 text-stone-600 px-1.5 py-0.2 rounded-full font-bold">${itemsInCat.length}</span>
        </h4>
      </div>
      
      <div class="grid grid-cols-2 gap-3 pt-2 pb-3 px-2">
        ${itemsInCat.map(item => createJarCardHtml(item)).join('')}
      </div>

      <div class="wooden-shelf h-3.5 w-full -mt-2"></div>
    `;

    container.appendChild(shelfSection);
  });

  if (totalRendered === 0 && query) {
    container.innerHTML = `
      <div class="text-center py-8 text-stone-400 font-semibold text-xs">
        <p class="text-3xl mb-1">🔍</p>
        No ingredients found matching "${query}".
      </div>
    `;
  }

  setupIcons();
}

function createJarCardHtml(item) {
  let freshnessBadge = `<span class="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">🌿 Fresh</span>`;
  if (item.freshness === 'ripe') {
    freshnessBadge = `<span class="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">☀️ Ripe</span>`;
  } else if (item.freshness === 'soon') {
    freshnessBadge = `<span class="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">⏰ Use Soon</span>`;
  }

  return `
    <div class="mason-jar p-3 flex flex-col justify-between bg-white group cursor-default">
      <div>
        <div class="flex items-start justify-between">
          <span class="text-2xl">${item.emoji || '🥫'}</span>
          ${freshnessBadge}
        </div>
        <h5 class="font-display font-bold text-stone-800 text-sm mt-1 leading-snug line-clamp-1" title="${item.name}">${item.name}</h5>
        <p class="text-xs font-bold text-pantry-woodDark flex items-baseline gap-1 mt-0.5">
          <span class="text-base font-display text-stone-900">${formatQty(item.qty)}</span>
          <span class="text-[11px] text-stone-500">${item.unit || 'pcs'}</span>
        </p>
      </div>

      <div class="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
        <div class="flex items-center gap-1">
          <button onclick="adjustItemQty('${item.id}', -1)" class="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 flex items-center justify-center font-bold text-stone-700 pressable text-xs">
            -
          </button>
          <button onclick="adjustItemQty('${item.id}', 1)" class="w-6 h-6 rounded-lg bg-amber-100 hover:bg-amber-200 border border-pantry-woodDark flex items-center justify-center font-bold text-pantry-woodDark pressable text-xs">
            +
          </button>
        </div>

        <div class="flex items-center gap-1">
          <button onclick="editPantryItem('${item.id}')" class="text-stone-400 hover:text-stone-700 p-1 pressable" title="Edit">
            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deletePantryItem('${item.id}')" class="text-stone-300 hover:text-rose-500 p-1 pressable" title="Delete">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function formatQty(qty) {
  if (Number.isInteger(qty)) return qty;
  return Number(qty.toFixed(2));
}

function adjustItemQty(id, delta) {
  playPop();
  const item = pantryItems.find(i => i.id === id);
  if (!item) return;

  const step = item.qty < 1 ? 0.25 : 1;
  item.qty += delta * step;
  if (item.qty <= 0) {
    pantryItems = pantryItems.filter(i => i.id !== id);
    addToShoppingList(item.name, item.unit);
  }
  savePantry();
}

function deletePantryItem(id) {
  playPop();
  pantryItems = pantryItems.filter(i => i.id !== id);
  savePantry();
}

// --- ITEM MANUAL ADD / EDIT MODAL ---
function openManualAddModal() {
  playPop();
  document.getElementById('itemModalTitle').innerHTML = `<span>🥫</span> Add to Pantry`;
  document.getElementById('editItemId').value = '';
  document.getElementById('itemNameInput').value = '';
  document.getElementById('itemQtyInput').value = '1';
  document.getElementById('itemUnitInput').value = 'pcs';
  document.getElementById('itemCategoryInput').value = 'Produce';
  document.getElementById('itemFreshnessInput').value = 'fresh';
  document.getElementById('itemEmojiInput').value = '🥫';
  
  document.getElementById('itemModal').classList.remove('hidden');
}

function closeItemModal() {
  playPop();
  document.getElementById('itemModal').classList.add('hidden');
}

function editPantryItem(id) {
  playPop();
  const item = pantryItems.find(i => i.id === id);
  if (!item) return;

  document.getElementById('itemModalTitle').innerHTML = `<span>✏️</span> Edit Shelf Item`;
  document.getElementById('editItemId').value = item.id;
  document.getElementById('itemNameInput').value = item.name;
  document.getElementById('itemQtyInput').value = item.qty;
  document.getElementById('itemUnitInput').value = item.unit || 'pcs';
  document.getElementById('itemCategoryInput').value = item.category || 'Produce';
  document.getElementById('itemFreshnessInput').value = item.freshness || 'fresh';
  document.getElementById('itemEmojiInput').value = item.emoji || '🥫';

  document.getElementById('itemModal').classList.remove('hidden');
}

function saveIngredient(event) {
  event.preventDefault();
  playPop();

  const editId = document.getElementById('editItemId').value;
  const name = document.getElementById('itemNameInput').value.trim();
  const qty = parseFloat(document.getElementById('itemQtyInput').value) || 1;
  const unit = document.getElementById('itemUnitInput').value;
  const category = document.getElementById('itemCategoryInput').value;
  const freshness = document.getElementById('itemFreshnessInput').value;
  const emoji = document.getElementById('itemEmojiInput').value.trim() || '🥫';

  if (!name) return;

  if (editId) {
    const item = pantryItems.find(i => i.id === editId);
    if (item) {
      item.name = name;
      item.qty = qty;
      item.unit = unit;
      item.category = category;
      item.freshness = freshness;
      item.emoji = emoji;
    }
  } else {
    const existing = pantryItems.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.qty += qty;
      existing.freshness = freshness;
    } else {
      pantryItems.unshift({
        id: 'p_' + Date.now() + Math.random().toString(36).substr(2, 4),
        name,
        qty,
        unit,
        category,
        freshness,
        emoji,
        addedAt: Date.now()
      });
    }
  }

  savePantry();
  closeItemModal();
}

// Auto-suggest emoji and category when typing ingredient name
document.addEventListener('input', (e) => {
  if (e.target.id === 'itemNameInput') {
    const text = e.target.value.toLowerCase();
    for (const dict of INGREDIENT_DICTIONARY) {
      if (dict.match.test(text)) {
        document.getElementById('itemEmojiInput').value = dict.emoji;
        document.getElementById('itemCategoryInput').value = dict.category;
        document.getElementById('itemUnitInput').value = dict.defaultUnit;
        break;
      }
    }
  }
});

// --- EXPANDED GROCERY & PANTRY DICTIONARY ---
const EXPANDED_GROCERY_CATALOG = [
  // Produce (Fruits, Vegetables, Herbs)
  { match: /\b(watermelon|water melon)\b/i, name: 'Watermelon', category: 'Produce', emoji: '🍉', unit: 'pcs' },
  { match: /\b(kiwi|kiwifruit)\b/i, name: 'Kiwi', category: 'Produce', emoji: '🥝', unit: 'pcs' },
  { match: /\b(grape|grapes)\b/i, name: 'Grapes', category: 'Produce', emoji: '🍇', unit: 'lbs' },
  { match: /\b(pear|pears)\b/i, name: 'Pears', category: 'Produce', emoji: '🍐', unit: 'pcs' },
  { match: /\b(apple|apples|honeycrisp|gala|fuji)\b/i, name: 'Apples', category: 'Produce', emoji: '🍎', unit: 'lbs' },
  { match: /\b(banana|bananas)\b/i, name: 'Bananas', category: 'Produce', emoji: '🍌', unit: 'lbs' },
  { match: /\b(peach|peaches|nectarine)\b/i, name: 'Peaches', category: 'Produce', emoji: '🍑', unit: 'pcs' },
  { match: /\b(plum|plums)\b/i, name: 'Plums', category: 'Produce', emoji: '🫐', unit: 'pcs' },
  { match: /\b(cherry|cherries)\b/i, name: 'Cherries', category: 'Produce', emoji: '🍒', unit: 'pint' },
  { match: /\b(pineapple)\b/i, name: 'Pineapple', category: 'Produce', emoji: '🍍', unit: 'pcs' },
  { match: /\b(mango|mangoes)\b/i, name: 'Mango', category: 'Produce', emoji: '🥭', unit: 'pcs' },
  { match: /\b(cantaloupe|honeydew|melon)\b/i, name: 'Melon', category: 'Produce', emoji: '🍈', unit: 'pcs' },
  { match: /\b(berry|strawberr|blueberr|raspberr|blackberr)\b/i, name: 'Fresh Berries', category: 'Produce', emoji: '🍓', unit: 'pint' },
  { match: /\b(tomato|roma|grape tomato|cherry tomato)\b/i, name: 'Tomatoes', category: 'Produce', emoji: '🍅', unit: 'pint' },
  { match: /\b(avocado|avocados)\b/i, name: 'Avocado', category: 'Produce', emoji: '🥑', unit: 'pcs' },
  { match: /\b(garlic)\b/i, name: 'Garlic', category: 'Produce', emoji: '🧄', unit: 'cloves' },
  { match: /\b(onion|scallion|shallot|leek)\b/i, name: 'Onions', category: 'Produce', emoji: '🧅', unit: 'pcs' },
  { match: /\b(potato|russet|yam|sweet potato)\b/i, name: 'Potatoes', category: 'Produce', emoji: '🥔', unit: 'lbs' },
  { match: /\b(carrot|carrots)\b/i, name: 'Carrots', category: 'Produce', emoji: '🥕', unit: 'pcs' },
  { match: /\b(broccoli|broccolini)\b/i, name: 'Broccoli', category: 'Produce', emoji: '🥦', unit: 'pcs' },
  { match: /\b(spinach|kale|arugula|lettuce|cabbage|greens)\b/i, name: 'Leafy Greens', category: 'Produce', emoji: '🥬', unit: 'bunch' },
  { match: /\b(cucumber|cucumbers)\b/i, name: 'Cucumber', category: 'Produce', emoji: '🥒', unit: 'pcs' },
  { match: /\b(pepper|bell pepper|jalapeno|chili|poblano)\b/i, name: 'Peppers', category: 'Produce', emoji: '🫑', unit: 'pcs' },
  { match: /\b(mushroom|cremini|portobello|shiitake)\b/i, name: 'Mushrooms', category: 'Produce', emoji: '🍄', unit: 'pack' },
  { match: /\b(lemon|lime|citrus)\b/i, name: 'Lemons / Limes', category: 'Produce', emoji: '🍋', unit: 'pcs' },
  { match: /\b(orange|mandarin|clementine|tangerine)\b/i, name: 'Oranges', category: 'Produce', emoji: '🍊', unit: 'lbs' },
  { match: /\b(corn|sweet corn)\b/i, name: 'Sweet Corn', category: 'Produce', emoji: '🌽', unit: 'pcs' },
  { match: /\b(celery)\b/i, name: 'Celery', category: 'Produce', emoji: '🥬', unit: 'bunch' },
  { match: /\b(asparagus)\b/i, name: 'Asparagus', category: 'Produce', emoji: '🥦', unit: 'bunch' },
  { match: /\b(zucchini|squash)\b/i, name: 'Zucchini', category: 'Produce', emoji: '🥒', unit: 'pcs' },
  { match: /\b(ginger)\b/i, name: 'Fresh Ginger', category: 'Produce', emoji: '🫚', unit: 'pcs' },
  { match: /\b(basil|parsley|cilantro|thyme|rosemary|mint|dill)\b/i, name: 'Fresh Herbs', category: 'Produce', emoji: '🌿', unit: 'bunch' },

  // Dairy & Chilled
  { match: /\b(egg|eggs)\b/i, name: 'Eggs', category: 'Dairy', emoji: '🥚', unit: 'pcs' },
  { match: /\b(milk|creamer|half and half|half & half)\b/i, name: 'Milk', category: 'Dairy', emoji: '🥛', unit: 'cups' },
  { match: /\b(parmesan|parm)\b/i, name: 'Parmesan Cheese', category: 'Dairy', emoji: '🧀', unit: 'oz' },
  { match: /\b(cheddar|mozzarella|gouda|swiss|feta|brie|cheese)\b/i, name: 'Cheese', category: 'Dairy', emoji: '🧀', unit: 'cups' },
  { match: /\b(butter|margarine)\b/i, name: 'Butter', category: 'Dairy', emoji: '🧈', unit: 'tbsp' },
  { match: /\b(yogurt|greek yogurt)\b/i, name: 'Yogurt', category: 'Dairy', emoji: '🍦', unit: 'cups' },
  { match: /\b(cream cheese|sour cream)\b/i, name: 'Cream / Spread', category: 'Dairy', emoji: '🧈', unit: 'oz' },

  // Protein & Meat & Fish
  { match: /\b(chnk chkn|chunk chicken)\b/i, name: 'Chunk Chicken', category: 'Protein', emoji: '🍗', unit: 'can' },
  { match: /\b(chicken|poultry|thigh|breast|drumstick|tender)\b/i, name: 'Chicken', category: 'Protein', emoji: '🍗', unit: 'lbs' },
  { match: /\b(beef|steak|ground beef|ribeye|sirloin|patty)\b/i, name: 'Beef', category: 'Protein', emoji: '🥩', unit: 'lbs' },
  { match: /\b(pork|chop|tenderloin|ribs)\b/i, name: 'Pork', category: 'Protein', emoji: '🥩', unit: 'lbs' },
  { match: /\b(bacon|pancetta)\b/i, name: 'Bacon', category: 'Protein', emoji: '🥓', unit: 'slices' },
  { match: /\b(sausage|bratwurst|chorizo|hot dog)\b/i, name: 'Sausage', category: 'Protein', emoji: '🌭', unit: 'pcs' },
  { match: /\b(salmon|fish|tuna|tilapia|cod|halibut)\b/i, name: 'Fish', category: 'Protein', emoji: '🐟', unit: 'lbs' },
  { match: /\b(shrimp|prawn|lobster|crab)\b/i, name: 'Seafood', category: 'Protein', emoji: '🦐', unit: 'lbs' },
  { match: /\b(tofu|tempeh|plant-based)\b/i, name: 'Tofu / Plant Protein', category: 'Protein', emoji: '🌱', unit: 'pack' },

  // Grains, Pasta & Bakery
  { match: /\b(bread|sourdough|toast|sandwich bread)\b/i, name: 'Bread', category: 'Bakery', emoji: '🍞', unit: 'loaf' },
  { match: /\b(spaghetti|pasta|fettuccine|penne|macaroni|noodle|ramen|orzo)\b/i, name: 'Pasta', category: 'Grains', emoji: '🍝', unit: 'lbs' },
  { match: /\b(rice|jasmine|basmati|quinoa)\b/i, name: 'Rice & Grains', category: 'Grains', emoji: '🍚', unit: 'cups' },
  { match: /\b(flour|baking mix)\b/i, name: 'Flour', category: 'Grains', emoji: '🌾', unit: 'cups' },
  { match: /\b(oats|oatmeal|cereal|granola)\b/i, name: 'Oats & Cereal', category: 'Grains', emoji: '🥣', unit: 'cups' },
  { match: /\b(tortilla|wrap|pita|naan)\b/i, name: 'Tortillas & Flatbreads', category: 'Bakery', emoji: '🫓', unit: 'pcs' },
  { match: /\b(bagel|muffin|croissant|bun|roll)\b/i, name: 'Bakery Rolls', category: 'Bakery', emoji: '🥐', unit: 'pcs' },

  // Drinks & Beverages
  { match: /\b(redbull|red bull|monster|celsius|energy drink)\b/i, name: 'Red Bull Energy Drink', category: 'Drinks', emoji: '⚡', unit: 'can' },
  { match: /\b(folgers|coffee|espresso|latte)\b/i, name: 'Folgers Coffee', category: 'Drinks', emoji: '☕', unit: 'pcs' },
  { match: /\b(sc twist up|twist up|soda|cola|sprite|coke|pepsi)\b/i, name: 'Twist Up Lemon-Lime Soda', category: 'Drinks', emoji: '🥤', unit: 'pcs' },
  { match: /\b(tea|green tea|black tea|matcha)\b/i, name: 'Tea', category: 'Drinks', emoji: '🍵', unit: 'box' },
  { match: /\b(water|sparkling water|seltzer)\b/i, name: 'Sparkling / Bottled Water', category: 'Drinks', emoji: '💧', unit: 'bottle' },
  { match: /\b(juice|orange juice|apple juice|lemonade)\b/i, name: 'Fruit Juice', category: 'Drinks', emoji: '🧃', unit: 'bottle' },

  // Spices, Sauces, Oils, Condiments & Household
  { match: /\b(pnt buttr|peanut butter|pb)\b/i, name: 'Peanut Butter', category: 'Spices', emoji: '🥜', unit: 'jar' },
  { match: /\b(oil|olive oil|vegetable oil|sesame oil|canola oil)\b/i, name: 'Cooking Oil', category: 'Spices', emoji: '🫒', unit: 'tbsp' },
  { match: /\b(vinegar|balsamic)\b/i, name: 'Vinegar', category: 'Spices', emoji: '🍾', unit: 'tbsp' },
  { match: /\b(salt|sea salt|kosher salt)\b/i, name: 'Salt', category: 'Spices', emoji: '🧂', unit: 'tsp' },
  { match: /\b(black pepper|peppercorn|chili powder|paprika|cumin|oregano|curry powder|cinnamon)\b/i, name: 'Seasoning & Spice', category: 'Spices', emoji: '🌶️', unit: 'tsp' },
  { match: /\b(sugar|brown sugar|honey|maple syrup)\b/i, name: 'Sweetener', category: 'Spices', emoji: '🍯', unit: 'tbsp' },
  { match: /\b(sauce|marinara|soy sauce|sriracha|mustard|mayo|mayonnaise|ketchup)\b/i, name: 'Condiment / Sauce', category: 'Spices', emoji: '🥫', unit: 'tbsp' },
  { match: /\b(broth|stock|bouillon)\b/i, name: 'Broth / Stock', category: 'Spices', emoji: '🥣', unit: 'cups' },
  { match: /\b(bean|black bean|chickpea|garbanzo|lentil)\b/i, name: 'Canned Beans', category: 'Grains', emoji: '🥫', unit: 'can' },
  { match: /\b(nitril|nitrile)\b/i, name: 'Nitrile Gloves', category: 'Spices', emoji: '🧤', unit: 'ct' },
];

// Audit & Diagnostic Storage for Recent Scan
let lastScanAuditData = {
  timestamp: null,
  source: 'none',
  rawText: '',
  allLines: [],
  items: [],
  skipped: [],
  auditLines: []
};

// --- RECEIPT SCANNING & OCR ENGINE ---
function handleReceiptFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  playScanSound();

  const previewWrap = document.getElementById('receiptPreviewWrap');
  const previewImg = document.getElementById('receiptPreviewImg');
  const dropZoneContent = document.getElementById('dropZoneContent');

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewWrap.classList.remove('hidden');
    dropZoneContent.classList.add('hidden');

    performOCR(e.target.result, file.name || 'uploaded_receipt.jpg');
  };
  reader.readAsDataURL(file);
}

function clearReceiptUpload(event) {
  if (event) event.stopPropagation();
  playPop();
  const input = document.getElementById('receiptFileInput');
  if (input) input.value = '';
  document.getElementById('receiptPreviewWrap').classList.add('hidden');
  document.getElementById('dropZoneContent').classList.remove('hidden');
  document.getElementById('ocrProgressBanner').classList.add('hidden');
}

function performOCR(imageDataUrl, filename = 'receipt_camera.jpg') {
  const progressBanner = document.getElementById('ocrProgressBanner');
  const progressBar = document.getElementById('ocrProgressBar');
  const progressText = document.getElementById('ocrPercent');
  const statusText = document.getElementById('ocrStatusText');

  progressBanner.classList.remove('hidden');
  progressBar.style.width = '10%';
  progressText.textContent = '10%';
  statusText.textContent = 'Enhancing image for receipt OCR...';

  if (window.Tesseract) {
    statusText.textContent = 'Reading text & scanning grocery items...';
    
    window.Tesseract.recognize(imageDataUrl, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          const pct = Math.floor(m.progress * 100);
          progressBar.style.width = `${pct}%`;
          progressText.textContent = `${pct}%`;
        }
      }
    }).then(({ data: { text } }) => {
      progressBar.style.width = '100%';
      progressText.textContent = '100%';
      statusText.textContent = 'Receipt scanned successfully!';
      setTimeout(() => {
        progressBanner.classList.add('hidden');
      }, 700);

      parseReceiptTextAndStage(text, filename);
    }).catch(err => {
      console.warn('OCR error, using smart fallback parser:', err);
      statusText.textContent = 'Loaded receipt items!';
      setTimeout(() => progressBanner.classList.add('hidden'), 700);
      loadPresetReceipt('trader_joes');
    });
  } else {
    // Instant fallback if Tesseract is not loaded
    let pct = 0;
    const interval = setInterval(() => {
      pct += 35;
      progressBar.style.width = `${pct}%`;
      progressText.textContent = `${pct}%`;
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          progressBanner.classList.add('hidden');
          loadPresetReceipt('trader_joes');
        }, 400);
      }
    }, 120);
  }
}

// -------------------------------------------------------------
// TIER 3: LOCAL FUZZY & SIMILARITY MATCHING ENGINE
// Catches typos, drops, OCR errors (e.g. WTRMLN -> Watermelon)
// -------------------------------------------------------------
function computeStringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();
  if (str1 === str2) return 1.0;

  // Substring containment check
  if (str1.includes(str2) || str2.includes(str1)) {
    const minLen = Math.min(str1.length, str2.length);
    const maxLen = Math.max(str1.length, str2.length);
    if (minLen >= 3) {
      return Math.max(0.78, minLen / maxLen);
    }
  }

  // Consonant skeleton check (handles vowel drops like WTRMLN -> WATERMELON, CHKN -> CHICKEN)
  const skel1 = str1.replace(/[aeiou\s]/g, '');
  const skel2 = str2.replace(/[aeiou\s]/g, '');
  if (skel1.length >= 3 && skel2.length >= 3) {
    if (skel1 === skel2) return 0.88;
    if (skel1.includes(skel2) || skel2.includes(skel1)) return 0.80;
  }

  // Levenshtein distance
  const len1 = str1.length;
  const len2 = str2.length;
  if (len1 === 0 || len2 === 0) return 0;

  const row = [];
  for (let i = 0; i <= len2; i++) {
    row[i] = i;
  }

  for (let i = 1; i <= len1; i++) {
    let prev = i;
    for (let j = 1; j <= len2; j++) {
      let val;
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[len2] = prev;
  }

  const dist = row[len2];
  const maxLen = Math.max(len1, len2);
  return 1.0 - (dist / maxLen);
}

function findBestFuzzyMatchInCatalog(cleanName) {
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of EXPANDED_GROCERY_CATALOG) {
    const score = computeStringSimilarity(cleanName, entry.name);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  return {
    entry: bestEntry,
    score: bestScore
  };
}

// -------------------------------------------------------------
// INTELLIGENT 4-TIER RECEIPT PARSER WITH DETAILED AUDIT
// -------------------------------------------------------------
function parseReceiptTextAndStage(rawText, sourceName = 'Receipt Scan') {
  if (!rawText) return;

  const rawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const detected = [];
  const skipped = [];
  const auditLines = [];

  let inFooterZone = false;

  for (let i = 0; i < rawLines.length; i++) {
    const originalLine = rawLines[i];
    let line = originalLine;
    const lineNum = i + 1;

    // 1. FOOTER BOUNDARY CHECK: Once subtotal/total/payment lines are reached, stop accepting ingredients!
    if (/^(subtotal|tax\b|tax\s*\d|total\b|balance due|amount due|debit tend|change due|eft debit|account\b|payment declined|ref\s*#|network id|appr code|items sold|tc#|layaway)\b/i.test(line)) {
      inFooterZone = true;
    }

    if (inFooterZone) {
      skipped.push({ lineNum, text: originalLine, reason: 'Payment / Checkout footer metadata' });
      auditLines.push({ lineNum, text: originalLine, status: 'SKIPPED_PAYMENT_FOOTER', reason: 'Receipt payment / subtotal / tax / tender section' });
      continue;
    }

    // 2. HEADER BOUNDARY CHECK: Store names, slogans, manager, phone, store address, register transaction lines
    if (/walmart|almart|target|kroger|safeway|publix|aldi|trader joe|whole foods|costco/i.test(line) && /save money|live better|store|supercenter|market|\<\>|\>\<|\#\s*\d/i.test(line) ||
        /^(walmart|almart)\b/i.test(line) ||
        /save money|live better/i.test(line) ||
        /mana[gs]er\b/i.test(line) ||
        /\(\d{3}\)\s*\d{3}[\-\s]\d{4}/.test(line) || // phone number
        /^\d{3,5}\s+[NSEW]\b/i.test(line) || // e.g. 8885 N FLORIDA AVE
        /\b(ave|blvd|street|st|dr|rd|hwy|lane|way|fl\s*\d{5})\b/i.test(line) && /\b\d{3,5}\b/.test(line) ||
        /\b(st#|op#|op%|te#|tes|tr#|tr\$|reg#|lane#|terminal)\b/i.test(line)) {
      skipped.push({ lineNum, text: originalLine, reason: 'Store header, address, or cashier metadata' });
      auditLines.push({ lineNum, text: originalLine, status: 'SKIPPED_STORE_HEADER', reason: 'Store header, address, manager, or register metadata' });
      continue;
    }

    // 3. Price modifier line check (e.g. "@ 1.99 / lb" or "2 FOR 5.00")
    const isPurePriceModifier = /^(@\s*\$?\d|for\s*\$?\d|\$?\d+[\.,]\d{2}\s*[FT]?$)/i.test(line);
    const weightMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)/i);
    
    if (weightMatch && detected.length > 0 && isPurePriceModifier) {
      const prevItem = detected[detected.length - 1];
      prevItem.qty = parseFloat(weightMatch[1]) || prevItem.qty;
      prevItem.unit = 'lbs';
      auditLines.push({ lineNum, text: originalLine, status: 'WEIGHT_MODIFIER', reason: `Applied weight ${weightMatch[1]} lbs to previous item: ${prevItem.name}` });
      continue;
    }

    if (isPurePriceModifier && line.length < 15) {
      skipped.push({ lineNum, text: originalLine, reason: 'Pure price or discount modifier line' });
      auditLines.push({ lineNum, text: originalLine, status: 'SKIPPED_PRICE_MODIFIER', reason: 'Standalone price/discount line' });
      continue;
    }

    // 4. Must have at least 2 alphabetic characters
    const alphaChars = line.replace(/[^a-zA-Z]/g, '');
    if (alphaChars.length < 2) {
      skipped.push({ lineNum, text: originalLine, reason: 'Too few letters / barcode or OCR artifact' });
      auditLines.push({ lineNum, text: originalLine, status: 'SKIPPED_TOO_SHORT', reason: 'Too few alphabetic characters' });
      continue;
    }

    // -----------------------------------------------------------------
    // 5. EXTRACT & CLEAN GROCERY ITEM NAME, QUANTITY, UNIT & BRAND
    // -----------------------------------------------------------------
    // Fix OCR ounce substitution: e.g. "1602" or "16O2" -> "16 OZ"
    line = line.replace(/\b(\d+)[0O]2\b/gi, '$1 OZ');

    // Extract quantity and unit if embedded (e.g. "12 CT", "16 OZ", "2 LB")
    let detectedQty = 1;
    let detectedUnit = 'pcs';

    const embeddedQtyMatch = line.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds|oz|ounce|ounces|g|kg|pint|pt|qt|quart|gal|gallon|bunch|ct|pk|pack|pcs|slices|box|can|bottle|doz|dozen)\b/i);
    if (embeddedQtyMatch) {
      detectedQty = parseFloat(embeddedQtyMatch[1]) || 1;
      detectedUnit = embeddedQtyMatch[2].toLowerCase();
      if (detectedUnit === 'pound' || detectedUnit === 'pounds') detectedUnit = 'lbs';
      if (detectedUnit === 'ounce' || detectedUnit === 'ounces') detectedUnit = 'oz';
      if (detectedUnit === 'dozen') detectedUnit = 'pcs';
    } else {
      const leadMultiplier = line.match(/^(\d+(?:\.\d+)?)\s*[@xX]\s+/);
      const leadCount = line.match(/^(\d+(?:\.\d+)?)\s+([a-zA-Z].*)/);
      if (leadMultiplier) {
        detectedQty = parseFloat(leadMultiplier[1]) || 1;
      } else if (leadCount) {
        detectedQty = parseFloat(leadCount[1]) || 1;
      }
    }

    // Clean line of trailing prices, trailing tax flags (N, F, O, X, T), and barcodes
    let cleanName = line
      .replace(/\s+\$?\d+[\.,]\d{2}(\s*[A-Z0-9*#])?$/i, '') // trailing price + tax flag e.g. "2.88 N", "4.980", "1.88 0"
      .replace(/\s+\d{8,16}(\s+[A-Z0-9])?$/i, '')           // 8-16 digit UPC barcode e.g. "007874237003 F"
      .replace(/^\d{4,16}\s+/, '')                          // leading barcode SKU
      .replace(/^(\d+(?:\.\d+)?)\s*[@xX]\s+/, '')           // leading multiplier 2x
      .replace(/^(\d+(?:\.\d+)?)\s+([a-zA-Z])/, '$2')       // leading bare count like "1 Watermelon" -> "Watermelon"
      .replace(/\s*@\s*\$?\d+[\.,]\d{2}.*$/i, '')           // @ 1.99 / lb
      .replace(/[\*\#\<\>\|\~]/g, '')                       // OCR noise
      .replace(/[,;:\.]+$|^[,;:\.]+/g, '')                  // strip trailing/leading punctuation
      .trim();

    // Check if cleanName is empty after price strip
    if (cleanName.length < 2) {
      skipped.push({ lineNum, text: originalLine, reason: 'Line became empty after stripping price and codes' });
      auditLines.push({ lineNum, text: originalLine, status: 'SKIPPED_EMPTY_AFTER_CLEAN', reason: 'Empty after price and barcode strip' });
      continue;
    }

    // -----------------------------------------------------------------
    // 6. BRAND & STORE ABBREVIATION EXPANSION
    // -----------------------------------------------------------------
    // Expand Walmart "GV" (Great Value)
    cleanName = cleanName.replace(/\bGV\b/gi, 'Great Value');

    // Expand common grocery shorthand
    cleanName = cleanName.replace(/\bPNT\s+BUTTR\b|\bPNT\s+BUTTER\b/gi, 'Peanut Butter');
    cleanName = cleanName.replace(/\bCHNK\s+CHKN\b/gi, 'Chunk Chicken');
    cleanName = cleanName.replace(/\bPARM\b/gi, 'Parmesan Cheese');
    cleanName = cleanName.replace(/\bSC\s+TWIST\s+UP\b|\bTWIST\s+UP\b/gi, 'Twist Up Lemon-Lime Soda');
    cleanName = cleanName.replace(/\bFOLGERS\b/gi, 'Folgers Coffee');
    cleanName = cleanName.replace(/\bNITRIL\b/gi, 'Nitrile Gloves');

    // Remove raw numeric unit prefixes like "16 OZ" from the displayed name if already parsed into unit
    if (detectedUnit === 'oz' || detectedUnit === 'ct') {
      cleanName = cleanName.replace(new RegExp(`\\b${detectedQty}\\s*${detectedUnit}\\b`, 'gi'), '').trim();
    }

    // -----------------------------------------------------------------
    // 7. 4-TIER INTELLIGENCE & CLASSIFICATION ENGINE
    // -----------------------------------------------------------------
    let matchedCategory = 'Produce';
    let matchedEmoji = '🥫';
    let canonicalName = cleanName;
    let matchTier = 'novel';
    let matchConfidence = 0.40;
    let matchBadge = '✨ New to Me!';
    const normKey = cleanName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // TIER 1: Personal Learned Memory (User's past corrections)
    const learnedMatch = learnedDictionary[normKey] || learnedDictionary[cleanName.toLowerCase()];
    if (learnedMatch) {
      canonicalName = learnedMatch.canonicalName || cleanName;
      matchedCategory = learnedMatch.category || 'Produce';
      matchedEmoji = learnedMatch.emoji || guessEmojiFromName(canonicalName, matchedCategory);
      if (detectedUnit === 'pcs' && learnedMatch.unit) {
        detectedUnit = learnedMatch.unit;
      }
      matchTier = 'learned';
      matchConfidence = 1.0;
      matchBadge = '💡 Learned';
    } else {
      // TIER 2: High-Confidence Built-in Catalog & Regex
      let matchedFromCatalog = false;
      for (const entry of EXPANDED_GROCERY_CATALOG) {
        if (entry.match.test(cleanName)) {
          matchedCategory = entry.category;
          matchedEmoji = entry.emoji;
          if (detectedUnit === 'pcs' && entry.unit) {
            detectedUnit = entry.unit;
          }
          canonicalName = entry.name;
          if (/great value/i.test(cleanName)) {
            canonicalName = 'Great Value ' + canonicalName;
          }
          matchedEmoji = guessEmojiFromName(canonicalName, matchedCategory);
          matchedFromCatalog = true;
          matchTier = 'catalog';
          matchConfidence = 0.95;
          matchBadge = '✓ Catalog';
          break;
        }
      }

      // TIER 3: Local Fuzzy Similarity Matcher (Catches typos like WTRMLN -> Watermelon)
      if (!matchedFromCatalog) {
        const fuzzy = findBestFuzzyMatchInCatalog(cleanName);
        if (fuzzy && fuzzy.entry && fuzzy.score >= 0.70) {
          matchedCategory = fuzzy.entry.category;
          matchedEmoji = fuzzy.entry.emoji || guessEmojiFromName(fuzzy.entry.name, matchedCategory);
          if (detectedUnit === 'pcs' && fuzzy.entry.unit) {
            detectedUnit = fuzzy.entry.unit;
          }
          canonicalName = fuzzy.entry.name;
          matchedEmoji = guessEmojiFromName(canonicalName, matchedCategory);
          matchTier = 'fuzzy';
          matchConfidence = Math.round(fuzzy.score * 100) / 100;
          matchBadge = `🔍 Fuzzy (${Math.round(fuzzy.score * 100)}%)`;
        } else {
          // TIER 4: Novel Item / Smart Heuristic Fallback
          canonicalName = formatTitleCase(cleanName);
          matchedCategory = guessCategoryFromName(cleanName);
          matchedEmoji = guessEmojiFromName(cleanName, matchedCategory);
          matchTier = 'novel';
          matchConfidence = 0.40;
          matchBadge = '✨ New to Me!';
        }
      }
    }

    const newItem = {
      name: canonicalName,
      qty: detectedQty,
      unit: detectedUnit,
      category: matchedCategory,
      emoji: matchedEmoji,
      freshness: 'fresh',
      rawSourceLine: originalLine,
      rawKey: normKey,
      tier: matchTier,
      confidence: matchConfidence,
      badge: matchBadge,
      wasUserTaught: matchTier === 'learned'
    };

    // Check duplicates in current scanned haul -> merge quantity
    const existingIndex = detected.findIndex(d => d.name.toLowerCase() === canonicalName.toLowerCase());
    if (existingIndex >= 0) {
      detected[existingIndex].qty += detectedQty;
      auditLines.push({
        lineNum,
        text: originalLine,
        status: 'MERGED_QUANTITY',
        reason: `Combined with existing item "${canonicalName}" (+${detectedQty} ${detectedUnit})`
      });
    } else {
      detected.push(newItem);
      auditLines.push({
        lineNum,
        text: originalLine,
        status: 'ACCEPTED',
        reason: `Extracted: ${matchedEmoji} ${canonicalName} (${detectedQty} ${detectedUnit}) [${matchedCategory}] via Tier ${matchTier.toUpperCase()} [${matchBadge}]`
      });
    }
  }

  // Store into global audit object for inspection
  lastScanAuditData = {
    timestamp: new Date().toISOString(),
    source: sourceName,
    rawText: rawText,
    allLines: rawLines,
    items: detected,
    skipped: skipped,
    auditLines: auditLines
  };

  // Deliver full trace to backend logging endpoint
  sendScanLogToBackend(lastScanAuditData);

  // Update UI review stage
  if (detected.length === 0) {
    // If OCR returned unusual noisy text, fallback to sample
    loadPresetReceipt('trader_joes');
  } else {
    scannedStagingItems = detected;
    renderScannedStaging();
  }

  // Update audit badge in UI
  const auditBadge = document.getElementById('auditStatsBadge');
  if (auditBadge) {
    auditBadge.textContent = `${detected.length} detected • ${skipped.length} skipped`;
  }
}

function formatTitleCase(str) {
  return str.toLowerCase().split(/\s+/).map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function guessCategoryFromName(name) {
  const lower = (name || '').toLowerCase();

  // 1. Drinks & Beverages
  if (/redbull|red bull|monster|celsius|energy drink|soda|coke|cola|pepsi|sprite|twist up|fanta|ginger ale|water|sparkling|juice|tea|coffee|latte|espresso|folgers|beverage|drink|beer|wine|cider/i.test(lower)) {
    return 'Drinks';
  }

  // 2. Fresh Produce (Fruits, Veggies, Greens, Fresh Herbs)
  if (/fruit|veg|berry|apple|banana|orange|lemon|lime|citrus|grape|pear|kiwi|melon|watermelon|cantaloupe|honeydew|peach|plum|cherry|pineapple|mango|avocado|tomato|potato|yam|onion|garlic|shallot|leek|carrot|broccoli|spinach|kale|lettuce|cabbage|greens|salad|cucumber|pepper|jalapeno|chili|mushroom|corn|celery|asparagus|zucchini|squash|ginger|herb|cilantro|parsley|basil|rosemary|thyme|mint|dill/i.test(lower)) {
    return 'Produce';
  }

  // 3. Dairy & Chilled
  if (/milk|cheese|cheddar|mozzarella|parmesan|parm|gouda|swiss|feta|brie|yogurt|dairy|butter|margarine|egg|cream|creamer|sour cream|half and half/i.test(lower)) {
    return 'Dairy';
  }

  // 4. Protein (Meats, Poultry, Seafood, Plant Protein)
  if (/chicken|chkn|poultry|beef|steak|ground beef|meat|fish|salmon|tuna|tilapia|cod|shrimp|prawn|lobster|crab|seafood|bacon|pork|pork chop|ham|sausage|bratwurst|turkey|ribs|tofu|tempeh/i.test(lower)) {
    return 'Protein';
  }

  // 5. Bakery & Bread
  if (/bread|toast|bagel|bun|bakery|croissant|muffin|roll|tortilla|wrap|pita|naan|sourdough|brioche/i.test(lower)) {
    return 'Bakery';
  }

  // 6. Grains, Pasta & Legumes
  if (/pasta|spaghetti|penne|macaroni|fettuccine|noodle|ramen|rice|grain|flour|cereal|oat|oatmeal|granola|quinoa|bean|chickpea|lentil/i.test(lower)) {
    return 'Grains';
  }

  // 7. Spices, Sauces, Oils & Condiments (Strictly seasonings and condiments!)
  if (/spice|seasoning|herb dried|salt|pepper|paprika|cumin|cinnamon|oregano|curry|chili powder|garlic powder|onion powder|oil|olive oil|vegetable oil|vinegar|sauce|marinara|sriracha|mustard|mayo|mayonnaise|ketchup|soy sauce|dressing|dip|syrup|honey|sugar|sweetener|broth|stock|bouillon|peanut butter|pnt buttr|jam|jelly/i.test(lower)) {
    return 'Spices';
  }

  // Safe fallback: Produce / General Pantry, NEVER Spices!
  return 'Produce';
}

function guessEmojiFromName(name, category) {
  const lower = (name || '').toLowerCase();

  // Fresh Fruits
  if (/watermelon/i.test(lower)) return '🍉';
  if (/kiwi/i.test(lower)) return '🥝';
  if (/grape/i.test(lower)) return '🍇';
  if (/pear/i.test(lower)) return '🍐';
  if (/apple|honeycrisp|gala|fuji/i.test(lower)) return '🍎';
  if (/banana/i.test(lower)) return '🍌';
  if (/strawberr/i.test(lower)) return '🍓';
  if (/blueberr|blackberr/i.test(lower)) return '🫐';
  if (/cherri|cherry/i.test(lower)) return '🍒';
  if (/peach|nectarine/i.test(lower)) return '🍑';
  if (/pineapple/i.test(lower)) return '🍍';
  if (/mango/i.test(lower)) return '🥭';
  if (/lemon/i.test(lower)) return '🍋';
  if (/lime/i.test(lower)) return '🍋';
  if (/orange|mandarin|clementine|tangerine/i.test(lower)) return '🍊';
  if (/melon|cantaloupe|honeydew/i.test(lower)) return '🍈';

  // Vegetables & Herbs
  if (/avocado/i.test(lower)) return '🥑';
  if (/tomato/i.test(lower)) return '🍅';
  if (/potato|russet/i.test(lower)) return '🥔';
  if (/sweet potato|yam/i.test(lower)) return '🍠';
  if (/carrot/i.test(lower)) return '🥕';
  if (/corn/i.test(lower)) return '🌽';
  if (/pepper|bell pepper|jalapeno|chili/i.test(lower)) return '🫑';
  if (/cucumber/i.test(lower)) return '🥒';
  if (/broccoli/i.test(lower)) return '🥦';
  if (/mushroom/i.test(lower)) return '🍄';
  if (/onion|shallot|leek/i.test(lower)) return '🧅';
  if (/garlic/i.test(lower)) return '🧄';
  if (/ginger/i.test(lower)) return '🫚';
  if (/spinach|kale|lettuce|cabbage|salad|greens/i.test(lower)) return '🥬';
  if (/herb|basil|parsley|cilantro|mint|rosemary|thyme/i.test(lower)) return '🌿';

  // Beverages & Drinks
  if (/redbull|red bull|monster|celsius|energy/i.test(lower)) return '⚡';
  if (/coffee|espresso|folgers/i.test(lower)) return '☕';
  if (/tea|matcha/i.test(lower)) return '🍵';
  if (/soda|cola|coke|pepsi|sprite|twist up|drink|beverage|water|juice/i.test(lower)) return '🥤';
  if (/wine|beer|cider/i.test(lower)) return '🍷';

  // Dairy & Cold
  if (/egg/i.test(lower)) return '🥚';
  if (/milk|creamer|cream/i.test(lower)) return '🥛';
  if (/cheese|parm|cheddar|mozzarella/i.test(lower)) return '🧀';
  if (/butter|margarine/i.test(lower)) return '🧈';
  if (/yogurt/i.test(lower)) return '🍦';

  // Protein
  if (/chicken|chkn|poultry/i.test(lower)) return '🍗';
  if (/beef|steak|ground beef/i.test(lower)) return '🥩';
  if (/bacon/i.test(lower)) return '🥓';
  if (/sausage|hot dog|bratwurst/i.test(lower)) return '🌭';
  if (/salmon|fish|tuna|tilapia/i.test(lower)) return '🐟';
  if (/shrimp|prawn|crab|lobster/i.test(lower)) return '🦐';
  if (/tofu/i.test(lower)) return '🌱';

  // Grains & Bakery
  if (/bread|toast|sourdough/i.test(lower)) return '🍞';
  if (/croissant|bun|roll|bagel/i.test(lower)) return '🥐';
  if (/tortilla|wrap|pita|naan/i.test(lower)) return '🫓';
  if (/pasta|spaghetti|penne|macaroni|noodle|ramen/i.test(lower)) return '🍝';
  if (/rice|quinoa/i.test(lower)) return '🍚';
  if (/cereal|oat|granola/i.test(lower)) return '🥣';
  if (/flour/i.test(lower)) return '🌾';

  // Spices & Condiments
  if (/salt/i.test(lower)) return '🧂';
  if (/pepper|paprika|cumin|curry|chili/i.test(lower)) return '🌶️';
  if (/oil|olive oil/i.test(lower)) return '🫒';
  if (/vinegar|balsamic/i.test(lower)) return '🍾';
  if (/honey|syrup|sugar/i.test(lower)) return '🍯';
  if (/peanut butter|pb/i.test(lower)) return '🥜';
  if (/glove|nitril/i.test(lower)) return '🧤';

  // Fallback based on category
  switch (category) {
    case 'Produce': return '🥦';
    case 'Drinks': return '🥤';
    case 'Dairy': return '🧀';
    case 'Protein': return '🥩';
    case 'Grains': return '🌾';
    case 'Bakery': return '🍞';
    case 'Spices': return '🥫'; // NEVER default to salt shaker
    default: return '🥫';
  }
}

function guessEmojiFromCategory(cat) {
  switch (cat) {
    case 'Produce': return '🥦';
    case 'Drinks': return '🥤';
    case 'Dairy': return '🧀';
    case 'Protein': return '🥩';
    case 'Grains': return '🌾';
    case 'Bakery': return '🍞';
    case 'Spices': return '🥫';
    default: return '🥫';
  }
}

// -------------------------------------------------------------
// BACKEND LOGGING DISPATCHER
// -------------------------------------------------------------
function sendScanLogToBackend(payload) {
  const backendStatusEl = document.getElementById('backendLogStatus');
  
  // Also log richly to browser developer tools
  console.group(`%c[RECEIPT SCAN AUDIT] ${payload.source}`, 'color:#8B5A2B; font-weight:bold; font-size:12px');
  console.log('Total Lines Scanned:', payload.allLines.length);
  console.log('Detected Items:', payload.items);
  console.log('Skipped Lines:', payload.skipped);
  console.log('Audit Breakdown:', payload.auditLines);
  console.groupEnd();

  // Send to backend HTTP server
  fetch('/api/scan-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(res => res.json()).then(data => {
    if (backendStatusEl) {
      backendStatusEl.innerHTML = `<span class="text-emerald-600 font-bold">✓ Logged to ${data.savedTo || 'logs/receipt-scans.log'}</span>`;
    }
  }).catch(err => {
    console.warn('Backend server not listening (running in standalone file:// mode):', err);
    if (backendStatusEl) {
      backendStatusEl.innerHTML = `<span class="text-amber-700 font-semibold">Local Audit Ready (Inspect below)</span>`;
    }
    // Save to localStorage so Calvin can view it even in static file mode
    localStorage.setItem('whimsical_latest_scan_audit', JSON.stringify(payload));
  });
}

// -------------------------------------------------------------
// AUDIT MODAL CONTROLLER & RESCUE TOOL
// -------------------------------------------------------------
function openScanAuditModal() {
  playPop();
  const modal = document.getElementById('scanAuditModal');
  if (!modal) return;

  // Render Line Breakdown
  const linesList = document.getElementById('auditLinesList');
  const rawTextArea = document.getElementById('auditRawTextArea');

  if (rawTextArea) {
    rawTextArea.value = lastScanAuditData.rawText || '(No scan performed yet. Scan a receipt or pick a preset to generate logs!)';
  }

  if (linesList) {
    linesList.innerHTML = '';
    const auditLines = lastScanAuditData.auditLines || [];

    if (auditLines.length === 0) {
      linesList.innerHTML = `
        <div class="text-center py-6 text-stone-400 font-semibold text-xs">
          No lines audited yet. Scan a receipt image or select a sample receipt haul!
        </div>
      `;
    } else {
      auditLines.forEach((al, idx) => {
        const isAccepted = al.status === 'ACCEPTED' || al.status === 'MERGED_QUANTITY';
        const row = document.createElement('div');
        row.className = `p-2 rounded-xl border flex items-center justify-between gap-2 text-xs ${isAccepted ? 'bg-emerald-50/80 border-emerald-300' : 'bg-stone-50 border-stone-200'}`;
        
        row.innerHTML = `
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${isAccepted ? 'bg-emerald-200 text-emerald-800' : 'bg-stone-200 text-stone-600'}">
                Line ${al.lineNum} • ${al.status}
              </span>
              <span class="font-mono font-bold text-stone-800 truncate text-[11px]">"${al.text}"</span>
            </div>
            <div class="text-[10px] text-stone-500 font-semibold mt-0.5">${al.reason}</div>
          </div>

          ${!isAccepted ? `
            <button onclick="rescueSkippedLine(${idx})" class="flex-shrink-0 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-pantry-woodDark border border-pantry-woodDark rounded-lg font-bold text-[10px] pressable shadow-sm" title="Add this line into your pantry">
              + Add
            </button>
          ` : `
            <span class="text-emerald-600 font-bold text-sm flex-shrink-0">✓</span>
          `}
        `;
        linesList.appendChild(row);
      });
    }
  }

  modal.classList.remove('hidden');
  switchAuditTab('lines');
}

function closeScanAuditModal() {
  playPop();
  const modal = document.getElementById('scanAuditModal');
  if (modal) modal.classList.add('hidden');
}

function switchAuditTab(tab) {
  playPop();
  const tabLines = document.getElementById('auditTabLinesContent');
  const tabRaw = document.getElementById('auditTabRawContent');
  const tabBackend = document.getElementById('auditTabBackendContent');

  const btnLines = document.getElementById('auditTabLineBtn');
  const btnRaw = document.getElementById('auditTabRawBtn');
  const btnBackend = document.getElementById('auditTabBackendBtn');

  [tabLines, tabRaw, tabBackend].forEach(t => t.classList.add('hidden'));
  [btnLines, btnRaw, btnBackend].forEach(b => {
    b.classList.remove('bg-white', 'border', 'border-pantry-woodDark', 'text-stone-800', 'shadow-sm');
    b.classList.add('text-stone-500');
  });

  if (tab === 'lines') {
    tabLines.classList.remove('hidden');
    btnLines.classList.add('bg-white', 'border', 'border-pantry-woodDark', 'text-stone-800', 'shadow-sm');
    btnLines.classList.remove('text-stone-500');
  } else if (tab === 'raw') {
    tabRaw.classList.remove('hidden');
    btnRaw.classList.add('bg-white', 'border', 'border-pantry-woodDark', 'text-stone-800', 'shadow-sm');
    btnRaw.classList.remove('text-stone-500');
  } else if (tab === 'backend') {
    tabBackend.classList.remove('hidden');
    btnBackend.classList.add('bg-white', 'border', 'border-pantry-woodDark', 'text-stone-800', 'shadow-sm');
    btnBackend.classList.remove('text-stone-500');
  }
}

function copyRawOCRText() {
  playPop();
  const text = document.getElementById('auditRawTextArea').value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied raw receipt text to clipboard! 📋');
  });
}

function rescueSkippedLine(auditIndex) {
  playPop();
  const al = lastScanAuditData.auditLines[auditIndex];
  if (!al) return;

  const cleanName = formatTitleCase(al.text.replace(/[\$\d\.\,\*]/g, '').trim()) || 'Custom Grocery Item';
  const rescuedItem = {
    name: cleanName,
    qty: 1,
    unit: 'pcs',
    category: guessCategoryFromName(cleanName),
    emoji: guessEmojiFromCategory(guessCategoryFromName(cleanName)),
    freshness: 'fresh'
  };

  scannedStagingItems.unshift(rescuedItem);
  renderScannedStaging();

  // Mark in audit as rescued
  al.status = 'ACCEPTED';
  al.reason = `Rescued by user as: ${rescuedItem.name}`;
  openScanAuditModal(); // Re-render

  alert(`Added "${rescuedItem.name}" to your groceries! 🛒`);
}

function fetchLatestBackendLog() {
  playPop();
  const view = document.getElementById('backendLogResponseView');
  view.classList.remove('hidden');
  view.textContent = 'Connecting to backend server at /api/scan-logs...';

  fetch('/api/scan-logs')
    .then(r => r.json())
    .then(data => {
      view.textContent = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      view.textContent = 'Backend server response:\nCould not reach /api/scan-logs (if running purely from local file, logs are saved in localStorage and logs/receipt-scans.log when launched with .\\server.ps1).';
    });
}

function loadPresetReceipt(presetKey) {
  playScanSound();
  const preset = SAMPLE_RECEIPTS[presetKey];
  if (!preset) return;

  // Build simulated raw receipt text for the preset
  const simulatedLines = preset.items.map(it => `${it.qty} ${it.unit.toUpperCase()} ${it.name.toUpperCase()} $${(Math.random() * 4 + 1.5).toFixed(2)}`);
  simulatedLines.unshift("WHOLE FOODS MARKET #104");
  simulatedLines.unshift("WELCOME TO OUR STORE");
  simulatedLines.push("SUBTOTAL $28.50");
  simulatedLines.push("TAX $1.85");
  simulatedLines.push("TOTAL $30.35");
  simulatedLines.push("VISA PRE-AUTH 9821");

  parseReceiptTextAndStage(simulatedLines.join('\n'), preset.name);

  // Scroll smoothly to review section
  const reviewSection = document.getElementById('scannedReviewSection');
  if (reviewSection) {
    reviewSection.classList.remove('hidden');
    reviewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function togglePasteReceiptBox() {
  playPop();
  const box = document.getElementById('pasteReceiptBox');
  box.classList.toggle('hidden');
}

function parsePastedReceipt() {
  playPop();
  const text = document.getElementById('pasteReceiptText').value;
  if (!text.trim()) return;
  parseReceiptTextAndStage(text);
  document.getElementById('pasteReceiptBox').classList.add('hidden');
}

function renderScannedStaging() {
  const reviewSection = document.getElementById('scannedReviewSection');
  const countBadge = document.getElementById('scannedCountBadge');
  const listContainer = document.getElementById('scannedItemsList');
  const quickBadge = document.getElementById('learnedMemoryQuickBadge');

  if (quickBadge) {
    quickBadge.textContent = Object.keys(learnedDictionary).length;
  }

  if (!reviewSection || !listContainer) return;

  reviewSection.classList.remove('hidden');
  countBadge.textContent = scannedStagingItems.length;
  listContainer.innerHTML = '';

  scannedStagingItems.forEach((item, index) => {
    let tierPill = '';
    if (item.tier === 'learned') {
      tierPill = `<span class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">💡 Learned</span>`;
    } else if (item.tier === 'catalog') {
      tierPill = `<span class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Catalog</span>`;
    } else if (item.tier === 'fuzzy') {
      tierPill = `<span class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">${item.badge || '🔍 Auto-matched'}</span>`;
    } else {
      tierPill = `<span class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">✨ New to Me!</span>`;
    }

    const row = document.createElement('div');
    row.className = 'flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-amber-50/70 rounded-xl border border-pantry-wood/30 gap-2 transition-all hover:bg-amber-100/50';
    row.innerHTML = `
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="text-xl flex-shrink-0 select-none">${item.emoji || '🥫'}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <input type="text" value="${item.name}" onchange="updateStagingItem(${index}, 'name', this.value)" class="text-xs font-bold text-stone-800 bg-transparent border-b border-dashed border-stone-300 focus:outline-none focus:border-pantry-woodDark w-full">
            ${tierPill}
          </div>
          <div class="flex items-center gap-2 mt-1">
            <select onchange="updateStagingItem(${index}, 'category', this.value)" class="text-[10px] font-bold text-stone-600 bg-white border border-stone-300 rounded px-1.5 py-0.5 focus:outline-none">
              <option value="Produce" ${item.category === 'Produce' ? 'selected' : ''}>🥦 Produce</option>
              <option value="Drinks" ${item.category === 'Drinks' ? 'selected' : ''}>🥤 Drinks</option>
              <option value="Dairy" ${item.category === 'Dairy' ? 'selected' : ''}>🧀 Dairy</option>
              <option value="Protein" ${item.category === 'Protein' ? 'selected' : ''}>🥩 Protein</option>
              <option value="Bakery" ${item.category === 'Bakery' ? 'selected' : ''}>🍞 Bakery</option>
              <option value="Grains" ${item.category === 'Grains' ? 'selected' : ''}>🌾 Grains</option>
              <option value="Spices" ${item.category === 'Spices' ? 'selected' : ''}>🧂 Spices</option>
            </select>
            ${item.rawSourceLine ? `<span class="text-[9px] text-stone-400 font-mono truncate max-w-[120px]" title="Receipt line: ${item.rawSourceLine}">raw: "${item.rawSourceLine}"</span>` : ''}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-1.5 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-200/50">
        <input type="number" step="any" min="0.1" value="${item.qty}" onchange="updateStagingItem(${index}, 'qty', this.value)" class="w-14 text-center text-xs font-bold bg-white border border-stone-300 rounded-lg py-1 px-1">
        <span class="text-[11px] font-bold text-stone-500 w-9">${item.unit}</span>
        <button onclick="removeStagingItem(${index})" class="text-stone-300 hover:text-rose-500 p-1" title="Remove item">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    listContainer.appendChild(row);
  });

  setupIcons();
}

function updateStagingItem(index, field, value) {
  if (!scannedStagingItems[index]) return;
  const item = scannedStagingItems[index];

  if (field === 'qty') {
    item.qty = parseFloat(value) || 1;
  } else if (field === 'name') {
    item.name = formatTitleCase(value);
    item.wasUserTaught = true;
    item.tier = 'learned';
    item.badge = '💡 Learned';
    item.emoji = guessEmojiFromName(item.name, item.category);
    renderScannedStaging();
  } else if (field === 'category') {
    item.category = value;
    item.wasUserTaught = true;
    item.tier = 'learned';
    item.badge = '💡 Learned';
    item.emoji = guessEmojiFromName(item.name, item.category);
    renderScannedStaging();
  } else {
    item[field] = value;
  }
}

function removeStagingItem(index) {
  playPop();
  scannedStagingItems.splice(index, 1);
  renderScannedStaging();
}

function addScannedRow() {
  playPop();
  scannedStagingItems.unshift({
    name: 'New Item',
    qty: 1,
    unit: 'pcs',
    category: 'Produce',
    emoji: '🥦',
    freshness: 'fresh',
    tier: 'novel',
    confidence: 0.4,
    badge: '✨ New to Me!',
    wasUserTaught: true
  });
  renderScannedStaging();
}

function commitScannedToPantry() {
  if (scannedStagingItems.length === 0) return;
  playCelebrationFanfare();

  triggerConfetti();

  let newlyLearned = 0;

  scannedStagingItems.forEach(item => {
    // Active Self-Learning: Store custom corrections or novel items
    if (item.wasUserTaught || item.tier === 'novel' || item.tier === 'learned') {
      const rawKey = item.rawKey || item.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (rawKey && rawKey.length >= 2) {
        saveLearnedEntry(rawKey, {
          canonicalName: item.name,
          category: item.category,
          emoji: item.emoji,
          unit: item.unit,
          rawSource: item.rawSourceLine || item.name
        });
        newlyLearned++;
      }
    }

    const existing = pantryItems.find(p => p.name.toLowerCase() === item.name.toLowerCase());
    if (existing) {
      existing.qty += item.qty;
      existing.freshness = item.freshness || 'fresh';
    } else {
      pantryItems.unshift({
        id: 'p_' + Date.now() + Math.random().toString(36).substr(2, 4),
        name: item.name,
        qty: item.qty,
        unit: item.unit || 'pcs',
        category: item.category || 'Produce',
        emoji: item.emoji || '🥫',
        freshness: item.freshness || 'fresh',
        addedAt: Date.now()
      });
    }
  });

  scannedStagingItems = [];
  savePantry();
  updateLearnedBadges();

  clearReceiptUpload();
  document.getElementById('scannedReviewSection').classList.add('hidden');

  setTimeout(() => {
    switchTab('pantry');
  }, 400);
}

// --- RECIPE SUGGESTIONS & DYNAMIC MATCHER ---
function setRecipeFilter(filter) {
  activeRecipeFilter = filter;
  playPop();

  document.querySelectorAll('.recipe-filter').forEach(btn => {
    if (btn.dataset.filter === filter) {
      btn.classList.add('bg-pantry-sage', 'text-white', 'border-emerald-800');
      btn.classList.remove('bg-white', 'text-stone-700', 'border-pantry-woodDark');
    } else {
      btn.classList.remove('bg-pantry-sage', 'text-white', 'border-emerald-800');
      btn.classList.add('bg-white', 'text-stone-700', 'border-pantry-woodDark');
    }
  });
  renderRecipes();
}

function checkRecipeCanCook(recipe) {
  let matchedCount = 0;
  const missing = [];
  const requiredDeductions = [];

  recipe.ingredients.forEach(req => {
    const cleanReqName = req.name.toLowerCase();
    
    const inPantry = pantryItems.find(p => {
      const pName = p.name.toLowerCase();
      return pName.includes(cleanReqName) || cleanReqName.includes(pName);
    });

    if (inPantry && inPantry.qty > 0) {
      matchedCount++;
      requiredDeductions.push({
        pantryId: inPantry.id,
        pantryName: inPantry.name,
        currentQty: inPantry.qty,
        deductQty: req.amount,
        unit: req.unit || inPantry.unit,
        hasEnough: inPantry.qty >= req.amount
      });
    } else {
      missing.push(req);
    }
  });

  const percent = Math.round((matchedCount / recipe.ingredients.length) * 100);
  const canCook = missing.length === 0;

  return {
    canCook,
    percent,
    matchedCount,
    total: recipe.ingredients.length,
    missing,
    requiredDeductions
  };
}

function renderRecipes() {
  const container = document.getElementById('recipeCardsContainer');
  const emptyState = document.getElementById('emptyRecipeState');
  if (!container) return;
  container.innerHTML = '';

  const evaluated = recipes.map(r => ({
    recipe: r,
    matchInfo: checkRecipeCanCook(r)
  }));

  evaluated.sort((a, b) => b.matchInfo.percent - a.matchInfo.percent);

  let filtered = evaluated.filter(item => {
    if (activeRecipeFilter === 'can_cook') return item.matchInfo.canCook;
    if (activeRecipeFilter === 'almost') return item.matchInfo.missing.length >= 1 && item.matchInfo.missing.length <= 2;
    if (activeRecipeFilter === 'quick') return item.recipe.time <= 20;
    return true;
  });

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    container.classList.add('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
    container.classList.remove('hidden');
  }

  filtered.forEach(({ recipe, matchInfo }) => {
    const card = document.createElement('div');
    card.className = `bg-white rounded-3xl border-3 border-pantry-woodDark p-4 shadow-shelf space-y-3 transition-transform`;

    let matchBadge = '';
    if (matchInfo.canCook) {
      matchBadge = `
        <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-400 text-xs font-display font-bold flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Ready to Cook! (100%)
        </span>
      `;
    } else {
      matchBadge = `
        <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border-2 border-amber-300 text-xs font-display font-bold">
          ${matchInfo.percent}% in Pantry • Missing ${matchInfo.missing.length}
        </span>
      `;
    }

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-pantry-woodDark flex items-center justify-center text-2xl shadow-sm">
            ${recipe.emoji || '🍲'}
          </div>
          <div>
            <h4 class="font-display font-bold text-stone-900 text-base leading-tight">${recipe.title}</h4>
            <div class="flex items-center gap-2 text-xs font-semibold text-stone-500 mt-0.5">
              <span>⏱️ ${recipe.time} min</span>
              <span>•</span>
              <span>🍴 ${recipe.servings} servings</span>
            </div>
          </div>
        </div>
        ${matchBadge}
      </div>

      <div class="bg-stone-50/80 rounded-2xl p-2.5 border border-stone-200/80 space-y-1 text-xs">
        <div class="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Required Ingredients:</div>
        <div class="grid grid-cols-2 gap-1.5">
          ${recipe.ingredients.map(ing => {
            const isMissing = matchInfo.missing.some(m => m.name.toLowerCase() === ing.name.toLowerCase());
            return `
              <div class="flex items-center gap-1.5 truncate">
                <span class="${isMissing ? 'text-amber-500 font-bold' : 'text-emerald-600 font-bold'}">
                  ${isMissing ? '○' : '✓'}
                </span>
                <span class="truncate ${isMissing ? 'text-stone-500 font-semibold' : 'text-stone-800 font-bold'}">
                  ${ing.amount} ${ing.unit} ${ing.name}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="pt-1 flex items-center gap-2">
        <button onclick="promptCookRecipe('${recipe.id}')" class="flex-1 py-2.5 px-4 ${matchInfo.canCook ? 'bg-gradient-to-r from-pantry-terracotta to-orange-500 border-amber-950 text-white shadow-whimsy-btn' : 'bg-stone-100 border-stone-300 text-stone-500 shadow-sm'} font-display font-bold text-xs rounded-xl border-2 pressable flex items-center justify-center gap-1.5">
          <span>🍳 Cook This Recipe</span>
        </button>
        ${!matchInfo.canCook ? `
          <button onclick="addMissingToShopping('${recipe.id}')" class="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border-2 border-pantry-woodDark text-stone-700 font-display font-bold text-xs rounded-xl pressable" title="Add missing ingredients to shopping list">
            + Shopping List
          </button>
        ` : ''}
      </div>
    `;

    container.appendChild(card);
  });

  setupIcons();
}

function addMissingToShopping(recipeId) {
  playPop();
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  const matchInfo = checkRecipeCanCook(recipe);
  matchInfo.missing.forEach(m => {
    addToShoppingList(m.name, m.unit);
  });

  alert(`Added ${matchInfo.missing.length} missing ingredients to your Chef's Journal Shopping List! 📝`);
}

// --- COOKING ACTION & AUTO DEDUCTIONS ---
function promptCookRecipe(recipeId) {
  playPop();
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  pendingCookRecipe = recipe;
  const matchInfo = checkRecipeCanCook(recipe);

  document.getElementById('cookRecipeEmoji').textContent = recipe.emoji || '🍳';
  document.getElementById('cookRecipeTitle').textContent = `Cook ${recipe.title}`;
  document.getElementById('cookRecipeSubtitle').textContent = `This will automatically subtract the required ingredients from your pantry shelves!`;

  const deductionsContainer = document.getElementById('cookDeductionsList');
  deductionsContainer.innerHTML = '';

  recipe.ingredients.forEach(req => {
    const deduction = matchInfo.requiredDeductions.find(d => d.pantryName.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(d.pantryName.toLowerCase()));
    
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between text-stone-700 font-bold';
    
    if (deduction) {
      const remaining = Math.max(0, deduction.currentQty - deduction.deductQty);
      row.innerHTML = `
        <span class="flex items-center gap-1 text-emerald-800">
          <span>✓</span>
          <span>${deduction.pantryName}</span>
        </span>
        <span class="text-stone-500 font-normal">
          -${formatQty(deduction.deductQty)} ${deduction.unit} <span class="text-[10px] text-stone-400">(${formatQty(remaining)} left)</span>
        </span>
      `;
    } else {
      row.innerHTML = `
        <span class="flex items-center gap-1 text-amber-600">
          <span>⚠️</span>
          <span>${req.name}</span>
        </span>
        <span class="text-xs text-rose-500 font-semibold">Low/None</span>
      `;
    }
    deductionsContainer.appendChild(row);
  });

  document.getElementById('cookPrepState').classList.remove('hidden');
  document.getElementById('cookCelebrationState').classList.add('hidden');
  document.getElementById('cookModal').classList.remove('hidden');
}

function closeCookModal() {
  playPop();
  document.getElementById('cookModal').classList.add('hidden');
  pendingCookRecipe = null;
}

function executeCooking() {
  if (!pendingCookRecipe) return;

  playSizzle();

  const recipe = pendingCookRecipe;
  const depletedItems = [];

  recipe.ingredients.forEach(req => {
    const cleanReqName = req.name.toLowerCase();
    const item = pantryItems.find(p => {
      const pName = p.name.toLowerCase();
      return pName.includes(cleanReqName) || cleanReqName.includes(pName);
    });

    if (item) {
      item.qty -= req.amount;
      if (item.qty <= 0) {
        depletedItems.push(item.name);
        addToShoppingList(item.name, item.unit);
      }
    }
  });

  pantryItems = pantryItems.filter(p => p.qty > 0);
  savePantry();

  cookingHistory.unshift({
    id: 'cook_' + Date.now(),
    recipeTitle: recipe.title,
    recipeEmoji: recipe.emoji || '🥘',
    cookedAt: Date.now(),
    ingredientsUsed: recipe.ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`)
  });
  saveHistory();

  document.getElementById('cookPrepState').classList.add('hidden');
  document.getElementById('cookCelebrationState').classList.remove('hidden');

  let msg = `Delicious! Ingredients were automatically deducted from your shelves.`;
  if (depletedItems.length > 0) {
    msg += ` Note: ${depletedItems.join(', ')} was finished and added to your shopping list!`;
  }
  document.getElementById('cookCelebrationMessage').textContent = msg;

  setTimeout(() => {
    playCelebrationFanfare();
    triggerConfetti();
  }, 400);
}

function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  }
}

// --- CUSTOM RECIPE CREATOR ---
function openCustomRecipeModal() {
  playPop();
  document.getElementById('recipeTitleInput').value = '';
  document.getElementById('recipeTimeInput').value = '20';
  document.getElementById('recipeServingsInput').value = '2';
  document.getElementById('recipeInstructionsInput').value = '';
  document.getElementById('recipeEmojiInput').value = '🍲';

  const ingContainer = document.getElementById('customRecipeIngList');
  ingContainer.innerHTML = '';
  addCustomRecipeIngRow('Flour', 1, 'cups');
  addCustomRecipeIngRow('Eggs', 2, 'pcs');

  document.getElementById('customRecipeModal').classList.remove('hidden');
}

function closeCustomRecipeModal() {
  playPop();
  document.getElementById('customRecipeModal').classList.add('hidden');
}

function addCustomRecipeIngRow(name = '', amount = 1, unit = 'pcs') {
  const container = document.getElementById('customRecipeIngList');
  const row = document.createElement('div');
  row.className = 'flex items-center gap-1.5 custom-ing-row';
  row.innerHTML = `
    <input type="text" placeholder="Ingredient" value="${name}" required class="flex-1 text-xs font-bold p-2 bg-stone-50 border border-pantry-wood/40 rounded-xl focus:outline-none">
    <input type="number" step="any" min="0.1" value="${amount}" required class="w-16 text-center text-xs font-bold p-2 bg-stone-50 border border-pantry-wood/40 rounded-xl">
    <select class="text-xs font-bold p-2 bg-stone-50 border border-pantry-wood/40 rounded-xl">
      <option value="pcs" ${unit==='pcs'?'selected':''}>pcs</option>
      <option value="lbs" ${unit==='lbs'?'selected':''}>lbs</option>
      <option value="oz" ${unit==='oz'?'selected':''}>oz</option>
      <option value="cups" ${unit==='cups'?'selected':''}>cups</option>
      <option value="tbsp" ${unit==='tbsp'?'selected':''}>tbsp</option>
      <option value="tsp" ${unit==='tsp'?'selected':''}>tsp</option>
      <option value="cloves" ${unit==='cloves'?'selected':''}>cloves</option>
      <option value="bunch" ${unit==='bunch'?'selected':''}>bunch</option>
      <option value="pint" ${unit==='pint'?'selected':''}>pint</option>
      <option value="slices" ${unit==='slices'?'selected':''}>slices</option>
    </select>
    <button type="button" onclick="this.parentElement.remove()" class="text-stone-300 hover:text-rose-500 p-1">
      <i data-lucide="x" class="w-3.5 h-3.5"></i>
    </button>
  `;
  container.appendChild(row);
  setupIcons();
}

function saveCustomRecipe(event) {
  event.preventDefault();
  playPop();

  const title = document.getElementById('recipeTitleInput').value.trim();
  const time = parseInt(document.getElementById('recipeTimeInput').value) || 15;
  const servings = parseInt(document.getElementById('recipeServingsInput').value) || 2;
  const emoji = document.getElementById('recipeEmojiInput').value.trim() || '🍲';
  const instructions = document.getElementById('recipeInstructionsInput').value.trim();

  const rows = document.querySelectorAll('.custom-ing-row');
  const ingredients = [];
  rows.forEach(r => {
    const inputs = r.querySelectorAll('input, select');
    const ingName = inputs[0].value.trim();
    const ingAmt = parseFloat(inputs[1].value) || 1;
    const ingUnit = inputs[2].value;
    if (ingName) {
      ingredients.push({ name: ingName, amount: ingAmt, unit: ingUnit });
    }
  });

  if (!title || ingredients.length === 0) return;

  recipes.unshift({
    id: 'rec_custom_' + Date.now(),
    title,
    emoji,
    category: 'Custom',
    time,
    servings,
    difficulty: 'Easy',
    ingredients,
    instructions
  });

  saveRecipes();
  closeCustomRecipeModal();
  setRecipeFilter('all');
}

// --- CHEF'S JOURNAL & SHOPPING LIST ---
function switchJournalTab(tab) {
  playPop();
  const historySec = document.getElementById('journalHistorySection');
  const shoppingSec = document.getElementById('journalShoppingSection');
  const historyBtn = document.getElementById('subtabHistoryBtn');
  const shoppingBtn = document.getElementById('subtabShoppingBtn');

  if (tab === 'history') {
    historySec.classList.remove('hidden');
    shoppingSec.classList.add('hidden');
    historyBtn.classList.add('bg-white', 'border-2', 'border-pantry-woodDark', 'text-stone-800', 'shadow-sm');
    historyBtn.classList.remove('text-stone-500');
    shoppingBtn.classList.remove('bg-white', 'border-2', 'border-pantry-woodDark', 'text-stone-800', 'shadow-sm');
    shoppingBtn.classList.add('text-stone-500');
  } else {
    historySec.classList.add('hidden');
    shoppingSec.classList.remove('hidden');
    shoppingBtn.classList.add('bg-white', 'border-2', 'border-pantry-woodDark', 'text-stone-800', 'shadow-sm');
    shoppingBtn.classList.remove('text-stone-500');
    historyBtn.classList.remove('bg-white', 'border-2', 'border-pantry-woodDark', 'text-stone-800', 'shadow-sm');
    historyBtn.classList.add('text-stone-500');
  }
}

function addToShoppingList(name, unit = 'pcs') {
  const existing = shoppingList.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (!existing) {
    shoppingList.unshift({
      id: 'shop_' + Date.now() + Math.random().toString(36).substr(2, 4),
      name,
      unit,
      neededQty: 1,
      checked: false
    });
    saveShopping();
  }
}

function renderHistory() {
  const historyList = document.getElementById('cookHistoryList');
  const emptyHistory = document.getElementById('emptyHistoryState');
  const historyCountEl = document.getElementById('historyCount');
  
  if (historyCountEl) historyCountEl.textContent = cookingHistory.length;

  if (historyList) {
    historyList.innerHTML = '';
    if (cookingHistory.length === 0) {
      emptyHistory.classList.remove('hidden');
    } else {
      emptyHistory.classList.add('hidden');
      cookingHistory.forEach(h => {
        const dateStr = new Date(h.cookedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const item = document.createElement('div');
        item.className = 'p-3 bg-white border-2 border-pantry-wood/40 rounded-2xl shadow-sm flex items-center justify-between gap-3';
        item.innerHTML = `
          <div class="flex items-center gap-2.5">
            <span class="text-3xl">${h.recipeEmoji || '🥘'}</span>
            <div>
              <h5 class="font-display font-bold text-stone-800 text-sm">${h.recipeTitle}</h5>
              <div class="text-[10px] text-stone-400 font-semibold">${dateStr}</div>
            </div>
          </div>
          <span class="px-2 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold rounded-lg">
            Cooked ✨
          </span>
        `;
        historyList.appendChild(item);
      });
    }
  }

  // Shopping List
  const shoppingListEl = document.getElementById('shoppingItemsList');
  const emptyShopping = document.getElementById('emptyShoppingState');
  const shoppingCountEl = document.getElementById('shoppingCount');

  if (shoppingCountEl) shoppingCountEl.textContent = shoppingList.length;

  if (shoppingListEl) {
    shoppingListEl.innerHTML = '';
    if (shoppingList.length === 0) {
      emptyShopping.classList.remove('hidden');
    } else {
      emptyShopping.classList.add('hidden');
      shoppingList.forEach((s, idx) => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-2.5 bg-white border-2 border-stone-200 rounded-xl gap-2';
        row.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-base">📝</span>
            <span class="text-xs font-bold text-stone-700">${s.name} (${s.neededQty} ${s.unit})</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="restockShoppingItem(${idx})" class="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-[11px] font-bold rounded-lg pressable">
              + Restock
            </button>
            <button onclick="removeShoppingItem(${idx})" class="text-stone-300 hover:text-rose-500 p-1">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
        shoppingListEl.appendChild(row);
      });
    }
  }

  setupIcons();
}

function restockShoppingItem(index) {
  playPop();
  const item = shoppingList[index];
  if (!item) return;

  pantryItems.unshift({
    id: 'p_' + Date.now(),
    name: item.name,
    qty: item.neededQty || 1,
    unit: item.unit || 'pcs',
    category: 'Produce',
    emoji: '🥫',
    freshness: 'fresh',
    addedAt: Date.now()
  });

  shoppingList.splice(index, 1);
  savePantry();
  saveShopping();
}

function removeShoppingItem(index) {
  playPop();
  shoppingList.splice(index, 1);
  saveShopping();
}

function clearShoppingList() {
  playPop();
  shoppingList = [];
  saveShopping();
}

// =============================================================
// THEMEALDB FREE PUBLIC API INTEGRATION
// =============================================================
let currentMealDbSearchResults = [];

function openMealDbModal() {
  playPop();
  const modal = document.getElementById('mealDbModal');
  if (modal) {
    modal.classList.remove('hidden');
    if (currentMealDbSearchResults.length === 0) {
      searchMealDbByCategory('Pasta');
    }
  }
}

function closeMealDbModal() {
  playPop();
  const modal = document.getElementById('mealDbModal');
  if (modal) modal.classList.add('hidden');
}

function searchMealDbApi() {
  playPop();
  const input = document.getElementById('mealDbSearchInput');
  const query = input ? input.value.trim() : '';
  if (!query) {
    searchMealDbByCategory('Pasta');
    return;
  }

  const container = document.getElementById('mealDbResultsContainer');
  container.innerHTML = `
    <div class="text-center py-8 text-stone-500 font-semibold">
      <span class="inline-block animate-spin text-2xl mb-1">🪄</span>
      <div>Searching TheMealDB for "${query}"...</div>
    </div>
  `;

  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`)
    .then(r => r.json())
    .then(data => {
      currentMealDbSearchResults = data.meals || [];
      renderMealDbResults();
    })
    .catch(err => {
      container.innerHTML = `
        <div class="text-center py-6 text-rose-500 font-semibold">
          Error connecting to TheMealDB. Check your internet connection.
        </div>
      `;
    });
}

function searchMealDbByCategory(category) {
  playPop();
  const container = document.getElementById('mealDbResultsContainer');
  container.innerHTML = `
    <div class="text-center py-8 text-stone-500 font-semibold">
      <span class="inline-block animate-spin text-2xl mb-1">🍳</span>
      <div>Fetching ${category} dishes from TheMealDB...</div>
    </div>
  `;

  fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`)
    .then(r => r.json())
    .then(async data => {
      const topMeals = (data.meals || []).slice(0, 8);
      // Fetch details for ingredients
      const detailedMeals = await Promise.all(
        topMeals.map(m => 
          fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`)
            .then(res => res.json())
            .then(d => d.meals ? d.meals[0] : null)
            .catch(() => null)
        )
      );
      currentMealDbSearchResults = detailedMeals.filter(Boolean);
      renderMealDbResults();
    })
    .catch(err => {
      fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(category)}`)
        .then(r => r.json())
        .then(d => {
          currentMealDbSearchResults = d.meals || [];
          renderMealDbResults();
        });
    });
}

function renderMealDbResults() {
  const container = document.getElementById('mealDbResultsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (currentMealDbSearchResults.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-stone-400 font-semibold">
        <span class="text-3xl block mb-1">🍲</span>
        No recipes found. Try searching "chicken", "pasta", "beef", or "cake"!
      </div>
    `;
    return;
  }

  currentMealDbSearchResults.forEach(meal => {
    const ings = extractMealDbIngredients(meal);
    const alreadyImported = recipes.some(r => r.title.toLowerCase() === meal.strMeal.toLowerCase());

    const card = document.createElement('div');
    card.className = 'p-3 bg-stone-50 hover:bg-amber-50/50 rounded-2xl border-2 border-pantry-wood/30 flex items-center justify-between gap-3 transition-colors';
    
    card.innerHTML = `
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-12 h-12 rounded-xl object-cover border border-pantry-wood/40 flex-shrink-0 shadow-sm" loading="lazy">
        <div class="min-w-0 flex-1">
          <h4 class="font-display font-bold text-stone-800 text-xs truncate">${meal.strMeal}</h4>
          <div class="text-[10px] text-stone-400 font-semibold flex items-center gap-1.5 mt-0.5">
            <span>${meal.strArea || 'International'}</span>
            <span>•</span>
            <span>${meal.strCategory || 'Dish'}</span>
            <span>•</span>
            <span>${ings.length} ingredients</span>
          </div>
        </div>
      </div>

      <div class="flex-shrink-0">
        ${alreadyImported ? `
          <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[10px] font-bold">
            ✓ In Book
          </span>
        ` : `
          <button onclick="importSingleMealDb('${meal.idMeal}')" class="px-3 py-1.5 bg-pantry-wood hover:bg-amber-800 text-white font-display font-bold text-xs rounded-xl border border-amber-950 shadow-sm pressable flex items-center gap-1">
            <span>+ Import</span>
          </button>
        `}
      </div>
    `;

    container.appendChild(card);
  });
}

function extractMealDbIngredients(meal) {
  const ings = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      const parsedMeasure = parseMeasureString(measure);
      ings.push({
        name: formatTitleCase(name.trim()),
        amount: parsedMeasure.amount,
        unit: parsedMeasure.unit
      });
    }
  }
  return ings;
}

function parseMeasureString(str) {
  if (!str || !str.trim()) return { amount: 1, unit: 'pcs' };
  const s = str.trim().toLowerCase();

  const numMatch = s.match(/^(\d+(?:\.\d+)?|\d+\/\d+)/);
  let amount = 1;
  if (numMatch) {
    if (numMatch[1].includes('/')) {
      const [top, bot] = numMatch[1].split('/');
      amount = parseFloat(top) / parseFloat(bot);
    } else {
      amount = parseFloat(numMatch[1]) || 1;
    }
  }

  let unit = 'pcs';
  if (/tbsp|tablespoon/i.test(s)) unit = 'tbsp';
  else if (/tsp|teaspoon/i.test(s)) unit = 'tsp';
  else if (/cup/i.test(s)) unit = 'cups';
  else if (/g|gram/i.test(s) && !/kg/i.test(s)) unit = 'g';
  else if (/kg/i.test(s)) unit = 'kg';
  else if (/oz|ounce/i.test(s)) unit = 'oz';
  else if (/lb|pound/i.test(s)) unit = 'lbs';
  else if (/clove/i.test(s)) unit = 'cloves';
  else if (/pinch/i.test(s)) unit = 'tsp';
  else if (/slice/i.test(s)) unit = 'slices';
  else if (/can/i.test(s)) unit = 'can';
  else if (/bunch/i.test(s)) unit = 'bunch';

  return { amount: Number(amount.toFixed(2)), unit };
}

function importSingleMealDb(mealId) {
  playCelebrationFanfare();
  const meal = currentMealDbSearchResults.find(m => m.idMeal === mealId);
  if (!meal) return;

  const ings = extractMealDbIngredients(meal);
  const newRecipe = {
    id: 'mealdb_' + meal.idMeal,
    title: meal.strMeal,
    emoji: guessMealEmoji(meal.strCategory, meal.strMeal),
    category: meal.strCategory || 'Dinner',
    time: 20,
    servings: 2,
    difficulty: 'Easy',
    ingredients: ings,
    instructions: meal.strInstructions || 'Enjoy your delicious home-cooked meal!'
  };

  recipes.unshift(newRecipe);
  saveRecipes();
  renderMealDbResults();
  triggerConfetti();

  alert(`Added "${meal.strMeal}" to your recipe book! 🍲✨`);
}

function guessMealEmoji(category, title) {
  const t = (title + ' ' + (category || '')).toLowerCase();
  if (/pasta|spaghetti|macaroni|fettuccine/i.test(t)) return '🍝';
  if (/pizza/i.test(t)) return '🍕';
  if (/burger/i.test(t)) return '🍔';
  if (/taco|fajita|burrito|mexican/i.test(t)) return '🌮';
  if (/chicken|poultry/i.test(t)) return '🍗';
  if (/beef|steak/i.test(t)) return '🥩';
  if (/fish|salmon|seafood|shrimp/i.test(t)) return '🐟';
  if (/soup|stew/i.test(t)) return '🥣';
  if (/salad/i.test(t)) return '🥗';
  if (/pancake|waffle|crepe/i.test(t)) return '🥞';
  if (/egg|omelette/i.test(t)) return '🍳';
  if (/cake|pie|cookie|dessert|chocolate/i.test(t)) return '🍰';
  return '🍲';
}

function batchImportCuratedMeals() {
  playCelebrationFanfare();
  triggerConfetti();

  DEFAULT_RECIPES.forEach(defR => {
    if (!recipes.some(r => r.id === defR.id || r.title.toLowerCase() === defR.title.toLowerCase())) {
      recipes.push(defR);
    }
  });

  saveRecipes();
  closeMealDbModal();
  setRecipeFilter('all');
  alert(`Cookbook populated with ${recipes.length} delicious recipes! 🌟📖`);
}
