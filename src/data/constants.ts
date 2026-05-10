// src/data/constants.ts
import { normalizeItem } from "../utils/textUtils";

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
    "basil",
    "beet root powder",
    "black pepper",
    "black poppy seed",
    "cacao powder",
    "caraway seed",
    "cardamon",
    "cayenne pepper",
    "cinnamon",
    "clove",
    "coriander",
    "cumin",
    "fennel seed",
    "ginger",
    "mustard seed",
    "nutmeg",
    "oregano",
    "paprika",
    "parsley",
    "red pepper flake",
    "sesame seed",
    "sumac",
    "thyme",
    "tumeric",
  ],
  Vegetables: [
    "artichoke",
    "arugula",
    "asparagus",
    "broccoli",
    "brussel sprout",
    "cabbage",
    "carrot",
    "cauliflower",
    "celery",
    "endive",
    "garlic",
    "heart of palm",
    "lettuce",
    "mushroom",
    "nutritional yeast",
    "okra",
    "olive",
    "radicchio",
    "radish",
    "red onion",
    "seaweed",
    "spring mix",
    "sweet potato",
  ],
  Fruits: [
    "apple",
    "avocado",
    "black cherry",
    "blackberry",
    "blueberry",
    "coconut",
    "cranberry",
    "dragonfruit",
    "fig",
    "green banana",
    "lemon",
    "lime",
    "mango",
    "orange",
    "pear",
    "pomegranate",
    "raspberry",
    "strawberry",
  ],
  Fermented: ["kimchi", "kombucha", "miso", "natto", "sauerkraut", "vinegar"],
  "Nuts/Seeds": [
    "brazil nut",
    "chia seed",
    "flax seed",
    "hemp seed",
    "pistachio",
    "walnut",
  ],
  "Animal Proteins": [
    "100% grass fed beef",
    "canned tuna",
    "chicken breast",
    "kefir",
    "pasture raised chicken",
    "pasture raised egg",
    "pasture raised goat",
    "pasture raised lamb",
    "white fish",
    "wild caught mussel",
    "wild caught oyster",
    "wild caught salmon",
    "wild caught sardine",
    "wild caught scallop",
    "wild caught shrimp",
    "wild caught squid",
    "yogurt",
  ],
  "Healthy Fats": [
    "extra virgin olive oil",
    "grass fed beef tallow",
    "nut/seed",
    "pasture raised butter/ghee",
  ],
  Beverages: [
    "black tea",
    "chamomile tea",
    "coffee",
    "green tea",
    "herbal tea",
    "lemonade",
    "mint tea",
  ],
};

export const exerciseLibrary: Record<string, string[]> = {
  "Cardio Exercises": [
    "alternate arm kettle bell swing",
    "battle rope",
    "biking",
    "burpee",
    "cycling",
    "diamond jump",
    "elliptical",
    "front back jump",
    "jogging",
    "jump rope",
    "jumping lunge",
    "kettlebell swing",
    "lateral jump",
    "medicine ball slam",
    "mummy kick",
    "rowing",
    "running",
    "sprinting",
    "stair climber",
    "stair run",
    "swimming",
    "treadmill",
    "tuck jump",
  ],
  "Resistance Training": [
    "assisted pull up",
    "barbell deadlift",
    "barbell hip thrust",
    "barbell row",
    "barbell squat",
    "barbell bench press",
    "calf raise",
    "dumbbell single leg deadlift",
    "dumbbell bench press",
    "dumbbell bicep curl",
    "dumbbell bulgarian split squat",
    "dumbbell curtsy lunge",
    "dumbbell incline chest press",
    "dumbbell lateral raise",
    "dumbbell overhead pullover",
    "dumbbell reverse lunge",
    "dumbbell shoulder press",
    "dumbbell side lunge",
    "dumbbell wood chopper",
    "lat pulldown",
    "pull up",
    "seated row",
    "single arm dumbbell row",
    "tricep dip",
    "tricep extension",
    "tricep pushdown",
  ],
  "Ab Training": [
    "ab wheel",
    "bicycle",
    "cable crunch",
    "hanging leg raise",
    "lying leg raise",
    "plank toe touches",
    "plank opposite leg and arm raise",
    "russian twist",
    "seated crunch",
    "side plank",
    "sit up",
  ],
  "Balance and Core Training": [
    "bosu ball pushup",
    "bosu ball slow crunch",
    "bosu ball leg lift",
    "bosu ball russian twist",
    "crow pose",
    "dead hang",
    "single leg step up",
    "tree pose",
    "reverse plank",
    "rocketman",
    "slow pushup",
    "superman",
    "tricep alternate toe touch",
  ],
  "Mobility Training": [
    "walking leg kickup toe touch",
    "leg swing",
    "shoulder wall slide",
  ],
};

export const masterPlantList: string[] = (() => {
  const list = new Set<string>();
  Object.values(foodLibrary).forEach((cat) =>
    cat.forEach((item) => {
      list.add(normalizeItem(item));
    }),
  );
  return Array.from(list).sort();
})();
