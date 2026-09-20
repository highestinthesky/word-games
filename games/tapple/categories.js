export const CATEGORY_PACKS = Object.freeze([
  {
    id: "classroom-safe",
    name: "Classroom Safe",
    description: "Original prompts reviewed for a mixed friend group on one shared screen.",
    categories: Object.freeze([
      { id: "fruit-snack", prompt: "A fruit you could pack for a snack", difficulty: "easy", minAnswers: 12 },
      { id: "forest-animal", prompt: "An animal that can live in a forest", difficulty: "easy", minAnswers: 12 },
      { id: "backpack", prompt: "Something you could find in a backpack", difficulty: "easy", minAnswers: 14 },
      { id: "rainy-day", prompt: "Something useful on a rainy day", difficulty: "easy", minAnswers: 11 },
      { id: "kitchen", prompt: "Something you might use in a kitchen", difficulty: "easy", minAnswers: 18 },
      { id: "library", prompt: "Something you might find in a library", difficulty: "easy", minAnswers: 12 },
      { id: "art-tool", prompt: "A tool for making art", difficulty: "easy", minAnswers: 14 },
      { id: "music", prompt: "A musical instrument", difficulty: "easy", minAnswers: 15 },
      { id: "garden", prompt: "Something that can grow in a garden", difficulty: "easy", minAnswers: 16 },
      { id: "sky", prompt: "Something you might see in the sky", difficulty: "easy", minAnswers: 12 },
      { id: "round", prompt: "Something that can be round", difficulty: "easy", minAnswers: 17 },
      { id: "float", prompt: "Something that can float", difficulty: "easy", minAnswers: 14 },
      { id: "fly", prompt: "Something that can fly", difficulty: "easy", minAnswers: 12 },
      { id: "wheels", prompt: "Something that moves on wheels", difficulty: "easy", minAnswers: 14 },
      { id: "light", prompt: "Something that produces light", difficulty: "easy", minAnswers: 11 },
      { id: "sound", prompt: "Something that can make a sound", difficulty: "easy", minAnswers: 18 },
      { id: "recycle", prompt: "Something that can be recycled", difficulty: "easy", minAnswers: 13 },
      { id: "pencil-case", prompt: "Something that belongs in a pencil case", difficulty: "easy", minAnswers: 12 },
      { id: "park", prompt: "Something you can do at a park", difficulty: "easy", minAnswers: 14 },
      { id: "picnic", prompt: "Something you could bring to a picnic", difficulty: "easy", minAnswers: 14 },
      { id: "farm", prompt: "An animal that can live on a farm", difficulty: "easy", minAnswers: 12 },
      { id: "museum", prompt: "Something you might see in a museum", difficulty: "medium", minAnswers: 12 },
      { id: "trees", prompt: "Something that can grow on a tree", difficulty: "medium", minAnswers: 13 },
      { id: "battery", prompt: "Something that can use batteries", difficulty: "medium", minAnswers: 15 },
      { id: "science", prompt: "Something used for a safe science activity", difficulty: "medium", minAnswers: 12 },
      { id: "texture", prompt: "A word that can describe a texture", difficulty: "medium", minAnswers: 16 },
      { id: "measure", prompt: "Something that can be measured", difficulty: "medium", minAnswers: 18 },
      { id: "pairs", prompt: "Something that usually comes in a pair", difficulty: "medium", minAnswers: 12 },
      { id: "fold", prompt: "Something that can be folded", difficulty: "medium", minAnswers: 13 },
      { id: "blocks", prompt: "Something you can build with blocks", difficulty: "medium", minAnswers: 14 },
      { id: "board-game", prompt: "Something used to play a board game", difficulty: "medium", minAnswers: 11 },
      { id: "weather", prompt: "A word that can describe weather", difficulty: "medium", minAnswers: 15 },
      { id: "story", prompt: "Something that can happen in a story", difficulty: "medium", minAnswers: 14 },
      { id: "wood", prompt: "Something that can be made from wood", difficulty: "medium", minAnswers: 16 },
      { id: "box", prompt: "Something that can come in a box", difficulty: "medium", minAnswers: 16 },
      { id: "explore", prompt: "A place you could explore outdoors", difficulty: "medium", minAnswers: 14 }
    ])
  }
]);

export const CLASSROOM_SAFE_PACK = CATEGORY_PACKS[0];

export function getCategoryById(id) {
  return CLASSROOM_SAFE_PACK.categories.find((category) => category.id === id) ?? null;
}

export function shuffleCategories(categories, random = Math.random) {
  const shuffled = [...categories];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const replacement = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[replacement]] = [shuffled[replacement], shuffled[index]];
  }

  return shuffled;
}
