// src/data/constants.ts

export interface Rituals {
  fishOil: boolean;
  vitaminD3: boolean;
  magnesium: boolean;
  creatine: boolean;
  [key: string]: boolean;
}

export interface Mobility {
  foamRoll: boolean;
  dynamicStretch: boolean;
  staticStretch: boolean;
  training: boolean;
  breathing: boolean;
  [key: string]: boolean;
}

export interface DailyData {
  rituals: Rituals;
  mobility: Mobility;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const defaultRituals: Rituals = {
  fishOil: false,
  vitaminD3: false,
  magnesium: false,
  creatine: false,
};

export const defaultMobility: Mobility = {
  foamRoll: false,
  dynamicStretch: false,
  staticStretch: false,
  training: false,
  breathing: false,
};

export const defaultDailyData: DailyData = {
  rituals: defaultRituals,
  mobility: defaultMobility,
};

export const foodLibrary: Record<string, string[]> = {
  "Spices & Herbs": [
    "Basil",
    "Beet root power",
    "Black Pepper",
    "Black Poppy Seeds",
    "Cacao Powder",
    "Caraway Seeds",
    "Cardamon",
    "Cayenne Pepper",
    "Cinnamon",
    "Cloves",
    "Coriander",

    "Cumin",
    "Fennel Seeds",
    "Ginger",
    "Mustard Seeds",
    "Nutmeg",
    "Oregano",
    "Paprika",
    "Parsley",
    "Red Pepper Flakes",
    "Sesame Seeds",
    "Sumac",
    "Thyme",
    "Tumeric",
  ],
  Vegetables: [
    "Artichokes",
    "Arugula",
    "Asparagus",
    "Broccoli",
    "Brussel Sprouts",
    "Cabbage",
    "Carrots",
    "Cauliflower",
    "Celery",
    "Endives",
    "Garlic",
    "Heart Of Palm",
    "Lettuce",
    "Mushrooms",
    "Nutritional Yeast",
    "Okra",
    "Olives",
    "Radicchio",
    "Radish",
    "Red Onion",
    "Seaweed",
    "Spring Mix",
    "Sweet Potato",
  ],
  Fruits: [
    "Apple",
    "Avocado",
    "Black Cherries",
    "Blackberries",
    "Blueberries",
    "Coconut",
    "Cranberries",
    "Dragonfruit",
    "Figs",
    "Green Banana",
    "Lemon",
    "Lime",
    "Mangos",
    "Oranges",
    "Pears",
    "Pomegranate",
    "Raspberries",
    "Strawberries",
  ],
  Fermented: ["Kimchi", "Kombucha", "Miso", "Natto", "Sauerkraut", "Vinegar"],
  "Nuts/Seeds": [
    "Brazil Nuts",
    "Chia Seeds",
    "Flax Seeds",
    "Hemp Seeds",
    "Pistachio",
    "Walnuts",
  ],
  "Animal Proteins": [
    "100% Grass Fed Beef",
    "Canned Tuna",
    "Chicken Breasts",
    "Kefir",
    "Pasture Raised Chicken",
    "Pasture Raised Eggs",
    "Pasture Raised Goat",
    "Pasture Raised Lamb",
    "White Fish",
    "Wild Caught Mussels",
    "Wild Caught Oyster",
    "Wild Caught Salmon",
    "Wild Caught Sardine",
    "Wild Caught Scallops",
    "Wild Caught Shrimp",
    "Wild Caught Squids",
    "Yogurt",
  ],
  "Healthy Fats": [
    "Extra Virgin Olive Oil",
    "Grass Fed Beef Tallow",
    "Nuts/Seeds",
    "Pasture Raised Butter/Ghee",
  ],
  Beverages: [
    "Black Tea",
    "Chamomile Tea",
    "Coffee",
    "Green Tea",
    "Herbal Tea",
    "Lemonade",
    "Mint Tea",
  ],
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
