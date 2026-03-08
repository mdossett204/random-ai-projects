// src/data/constants.ts

export interface Rituals {
  fishOil: boolean;
  vitaminD3: boolean;
  mgGlycinate: boolean;
  boxBreathing: boolean;
  [key: string]: boolean;
}

export interface Mobility {
  smr: boolean;
  dynamicStretch: boolean;
  stability: boolean;
  [key: string]: boolean;
}

export interface DailyData {
  steps: number;
  waterCups: number;
  weight: number;
  creatine: number;
  protein: number;
  fatGrams: number;
  fiber: number;
  rituals: Rituals;
  mobility: Mobility;
  [key: string]: number | Rituals | Mobility;
}

export const defaultRituals: Rituals = {
  fishOil: false,
  vitaminD3: false,
  mgGlycinate: false,
  boxBreathing: false,
};

export const defaultMobility: Mobility = {
  smr: false,
  dynamicStretch: false,
  stability: false,
};

export const defaultDailyData: DailyData = {
  steps: 0,
  waterCups: 0,
  weight: 0,
  creatine: 0,
  protein: 0,
  fatGrams: 0,
  fiber: 0,
  rituals: defaultRituals,
  mobility: defaultMobility,
};

export const scheduleTitles: Record<string, string> = {
  Monday: "VO2 Max Training (4x4 protocol)",
  Tuesday: "Shoulder Training",
  Wednesday: "Sprint Intervals (30 sec on, 2 min off)",
  Thursday: "Core and Balance Training",
  Friday: "Glute Training",
  Saturday: "Heavy Chest and Back Training",
  Sunday: "Heavy Leg Training",
};

export const foodLibrary: Record<string, string[]> = {
  "Spices & Herbs": [
    "Sumac",
    "Tumeric",
    "Coriander",
    "Fennel Seeds",
    "Caraway Seeds",
    "Black Poppy Seeds",
    "Sesame Seeds",
    "Black Pepper",
    "Beet root power",
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
    "Cacao Powder",
  ],
  Vegetables: [
    "Red Onion",
    "Garlic",
    "carrots",
    "celery",
    "Olives",
    "Lettuce",
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
    "Allulose",
    "Nutritional Yeast",
    "Seaweed",
  ],
  Fruits: [
    "Avocado",
    "Pomegranate",
    "Blueberries",
    "Raspberries",
    "Strawberries",
    "Blackberries",
    "Black Cherries",
    "Green Banana",
    "Lemon",
    "Lime",
  ],
  Fermented: ["Natto", "Miso", "Kimchi", "Sauerkraut", "Vinegar", "Kombucha"],
  "Nuts/Seeds": [
    "Walnuts",
    "Brazil Nuts",
    "Pistachio",
    "Flax Seeds",
    "Hemp Seeds",
  ],
  "Animal Proteins": [
    "Wild Caught Salmon",
    "White Fish",
    "Canned Tuna",
    "Wild Caught Sardine",
    "Wild Caught Shrimp",
    "Wild Caught Scallops",
    "Wild Caught Mussels",
    "Wild Caught Oyster",
    "Wild Caught Squids",
    "Pasture Raised Eggs",
    "Chicken Breasts",
    "Pasture Raised Chicken",
    "100% Grass Fed Beef",
    "Pasture Raised Lamb",
    "Pasture Raised Goat",
    "Kefir",
    "Yogurt",
  ],
  "Healthy Fats": [
    "Extra Virgin Olive Oil",
    "Pasture Raised Butter/Ghee",
    "Grass Fed Beef Tallow",
    "Nuts/Seeds",
  ],
  Beverages: ["Black Tea", "Coffee", "Green Tea", "Mint Tea", "Chamomile Tea"],
};

export const masterPlantList: string[] = (() => {
  const list = new Set<string>();
  Object.values(foodLibrary).forEach((cat) =>
    cat.forEach((item) => {
      const normalized = item
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
      list.add(normalized);
    }),
  );
  return Array.from(list).sort();
})();
