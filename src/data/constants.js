// src/data/constants.js

export const defaultRituals = {
  fishOil: false,
  vitaminD3: false,
  mgGlycinate: false,
  boxBreathing: false,
};

export const defaultDailyData = {
  steps: 0,
  waterCups: 0,
  creatine: 0,
  protein: 0,
  fatGrams: 0,
  fiber: 0,
  rituals: defaultRituals,
};

export const scheduleTitles = {
  Monday: "Arm and Glute training",
  Tuesday: "VO2 max training (4x4 protocol)",
  Wednesday: "Core and Balance Training",
  Thursday: "Shoulder and Glute training",
  Friday: "Heavy leg and back training",
  Saturday: "Sprint intervals (30sec/2 min off)",
  Sunday: "Heavy leg and chest training",
};

export const foodLibrary = {
  "Spices & Herbs": [
    "Sumac",
    "Fennel Seeds",
    "Caraway Seeds",
    "Black Poppy Seeds",
    "Sesame Seeds",
    "Black Pepper",
    "Ginger",
    "Cardamon",
    "Mustard Seeds",
    "Cinnamon",
    "Nutmeg",
    "Cloves",
    "Cumin",
    "Oregano",
    "Basil",
    "Thyme",
    "Parsley",
    "Red Pepper Flakes",
    "Cayenne Pepper",
    "Paprika",
  ],
  Vegetables: [
    "Onion",
    "Garlic",
    "Olives",
    "Avocado",
    "Sweet Potato",
    "Okra",
    "Cauliflower",
    "Broccoli",
    "Artichokes",
    "Heart Of Palm",
    "Asparagus",
    "Mushrooms",
    "Arugula",
    "Spring Mix",
    "Radicchio",
    "Radish",
    "Cabbage",
    "Endives",
    "Brussel Sprouts",
  ],
  Fruits: [
    "Pomegranate",
    "Blueberries",
    "Raspberries",
    "Strawberries",
    "Blackberries",
    "Black Cherries",
    "Lemon",
  ],
  Fermented: [
    "Natto",
    "Miso",
    "Kimchi",
    "Sauerkraut",
    "Apple Cider Vinegar",
    "Seaweed",
  ],
  "Nuts/Seeds": [
    "Walnuts",
    "Brazil Nuts",
    "Pistachio",
    "Flax Seeds",
    "Hemp Seeds",
    "Cacao Powder",
  ],
  Beverages: ["Black Tea", "Coffee", "Green Tea", "Mint Tea"],
};

export const masterPlantList = (() => {
  const list = new Set();
  Object.values(foodLibrary).forEach((cat) =>
    cat.forEach((item) => list.add(item)),
  );
  return Array.from(list).sort();
})();
