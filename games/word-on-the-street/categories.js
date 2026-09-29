// Short, concrete prompts a high-school group can answer in seconds. Each family
// groups look-alike topics; a draw never follows a prompt from its own family.
const DECK = {
  food: [
    "A fruit", "A vegetable", "A snack", "A cold drink", "A hot drink", "A breakfast food",
    "A dessert", "A candy", "A pizza topping", "A sandwich filling", "A fast-food item",
    "A kind of bread", "A kind of nut", "A spice or seasoning", "A sauce or dip", "A dairy product",
    "Something you grill", "A frozen treat", "Something at a picnic", "A lunchbox item",
    "Something in a salad", "A holiday food", "A crunchy food", "A salty food", "A sour food",
    "A spicy food", "Something on toast", "A kind of soup", "A kind of pasta or noodle",
    "Something on a burger", "Something to eat with"
  ],
  animals: [
    "A pet", "A farm animal", "A zoo animal", "A bird", "A bug", "A sea creature", "A reptile",
    "A baby animal", "A forest animal", "A dog breed", "An animal that hops or jumps",
    "An animal with stripes or spots", "A desert animal", "A cold-weather animal",
    "An animal that lives in trees"
  ],
  home: [
    "Something in a kitchen", "Something in a bathroom", "Something in a bedroom",
    "Something in a living room", "A piece of furniture", "Something in a garage",
    "Something in a backyard", "A cleaning supply", "Something in a toolbox", "Something on a desk",
    "Something on a wall", "Something in a drawer", "Something in a pocket",
    "Something in a trash can", "Something under a bed", "Something in a fridge",
    "Something in a wallet", "Something in a mailbox"
  ],
  school: [
    "Something in a classroom", "A school subject", "A school supply", "Something in a cafeteria",
    "Something in a locker", "Something in a library", "A school club", "A room in a school",
    "A shape", "A math word", "Something in a science lab", "A school event"
  ],
  style: [
    "Something you wear on your feet", "Something you wear on your head",
    "Something you wear in the rain", "Something you wear at the beach", "A piece of jewelry",
    "A pattern or print", "Something you wear to bed", "A kind of bag", "A hairstyle"
  ],
  body: [
    "A body part", "Something you do with your hands", "Something you do with your mouth",
    "Something you do with your eyes", "A common illness", "Something at a doctor's office",
    "A kind of exercise", "Something you do to relax"
  ],
  nature: [
    "A kind of weather", "A kind of tree", "A flower", "A gemstone", "A body of water",
    "A landform", "Something in the sky", "Something at the beach", "Something you see in autumn",
    "Something you see in winter", "Something in the ground"
  ],
  places: [
    "A country", "A U.S. state", "A big city", "A kind of store", "A kind of restaurant",
    "A public building", "Something at an amusement park", "Something at an airport",
    "Something at a museum", "Something at a park", "A place to sleep", "A place to swim",
    "A quiet place", "A place to hang out", "A vacation spot", "A room in a house",
    "A kind of road or path", "Something on a farm", "Something in a city",
    "Something at a hair salon", "Something at a bank", "Something at a gym"
  ],
  travel: [
    "A kind of vehicle", "A part of a car", "Something you pack for a trip", "Something at a hotel",
    "Something at a gas station", "A kind of boat", "A kind of aircraft"
  ],
  play: [
    "A sport", "Something used in a sport", "A board game", "A card game", "A video game", "A toy",
    "Something at a playground", "A water activity", "An outdoor activity", "A hobby",
    "Something at a sports game", "A sports position", "A party game"
  ],
  arts: [
    "A musical instrument", "A music genre", "A kind of dance", "A color", "A movie genre",
    "A sound or noise", "A kind of art", "A kind of show"
  ],
  media: ["Something you watch", "Something you read", "Something you listen to"],
  work: [
    "A job with a uniform", "A job outdoors", "A job at a hospital", "A job at a restaurant",
    "A job at a school", "A job with tools", "A family member", "A first name", "A last name"
  ],
  tech: ["Something on a phone", "Something you charge", "Something you do online"],
  actions: [
    "A way to move", "A way to talk", "A way to laugh", "A way to cook", "A way to eat",
    "A way to say hello", "A chore", "Something you do every day", "Something you do at night",
    "Something you do with friends", "Something you do on weekends",
    "Something you can throw", "Something you can break", "Something you can fold",
    "Something you can open", "Something you can wash", "Something you can climb",
    "Something you can lose", "Something you can collect", "Something you can carry",
    "Something you can draw", "Something you can build", "Something you can cut",
    "Something you can stack", "Something you can squeeze", "Something you can pop",
    "Something you can spill", "Something you can blow", "Something you can pull",
    "Something you can push", "Something you can wrap", "Something you can tie",
    "Something you can shake", "Something you can plant", "Something you can hang",
    "Something you can save", "Something you can win", "Something you can borrow",
    "Something you can fix", "Something you can paint", "Something you can cross"
  ],
  words: [
    "A feeling", "A word for big", "A word for small", "A compliment", "Something you shout",
    "A word for a friend", "A word for money", "A word for a group"
  ],
  traits: [
    "Something round", "Something cold", "Something hot", "Something soft", "Something sharp",
    "Something sticky", "Something loud", "Something shiny", "Something heavy", "Something fast",
    "Something flat", "Something tall", "Something wet", "Something red", "Something green",
    "Something yellow", "Something blue", "Something white", "Something brown",
    "Something that smells good", "Something that smells bad", "Something that melts",
    "Something that bounces", "Something that floats", "Something with a lid",
    "Something with a handle", "Something with buttons", "Something you can see through",
    "Something you plug in", "Something that spins", "Something with teeth",
    "Something with a shell", "Something with holes", "Something with a string",
    "Something with a face", "Something that grows", "Something that falls", "A source of light",
    "Something that keeps you warm", "Something that keeps you dry", "Something that comes in pairs",
    "Something you count", "Something you measure"
  ],
  events: [
    "A holiday", "Something at a birthday party", "Something at a wedding", "Something at a concert",
    "Something at a graduation", "Something at a campfire", "Something at a sleepover",
    "Something at a circus", "A fantasy creature", "Something in a haunted house",
    "Something in space", "Something in a movie theater"
  ],
  materials: [
    "Something made of metal", "Something made of wood", "Something made of glass",
    "Something made of paper", "Something made of plastic", "Something made of cloth",
    "Something made of rubber", "Something made of leather", "Something made of stone",
    "A kind of metal", "A kind of container"
  ]
};

const slug = (prompt) => prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const CATEGORIES = Object.freeze(Object.entries(DECK).flatMap(([family, prompts]) => (
  prompts.map((prompt) => Object.freeze({ id: slug(prompt), family, prompt }))
)));

const FAMILY_BY_ID = new Map(CATEGORIES.map((item) => [item.id, item.family]));

// Prompts from the first release, before per-game history existed.
export const LEGACY_CATEGORY_IDS = Object.freeze([
  "a-chemical-element", "a-laboratory-tool", "a-field-of-science", "a-scientific-invention",
  "a-planet-or-moon", "a-constellation", "a-mineral", "a-unit-of-measurement", "a-mammal", "a-bird",
  "a-reptile", "an-insect", "a-tree", "a-flower", "a-landform", "a-weather-event", "a-sea-creature",
  "a-type-of-rock", "a-country", "a-capital-city", "a-u-s-state", "a-mountain-range", "a-river",
  "an-island", "a-place-people-work", "a-public-building", "a-musical-instrument", "a-music-genre",
  "a-dance-style", "a-film-genre", "a-board-game", "a-character-from-mythology", "a-type-of-book",
  "a-painting-tool", "a-stage-role", "a-type-of-photograph", "a-sport", "an-olympic-sport",
  "a-school-subject", "a-profession", "a-hand-tool", "a-piece-of-furniture", "a-mode-of-transport",
  "a-fabric", "a-language", "a-programming-language", "a-fruit", "a-vegetable", "a-spice", "a-dessert",
  "a-type-of-bread", "a-pasta-shape", "a-breakfast-food", "a-cooking-method"
]);

function shuffle(ids, random) {
  const result = [...ids];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function drawCategory(progress = {}, random = Math.random) {
  const seen = new Set(Array.isArray(progress.seen) ? progress.seen.filter((id) => FAMILY_BY_ID.has(id)) : []);
  let bag = Array.isArray(progress.bag) ? progress.bag.filter((id) => FAMILY_BY_ID.has(id) && !seen.has(id)) : [];
  if (!bag.length) {
    bag = shuffle(CATEGORIES.map((item) => item.id).filter((id) => !seen.has(id)), random);
  }
  if (!bag.length) {
    return { category: null, progress: { bag: [], seen: [...seen], lastId: progress.lastId ?? null } };
  }
  const lastFamily = FAMILY_BY_ID.get(progress.lastId);
  let position = bag.length - 1;
  while (position > 0 && FAMILY_BY_ID.get(bag[position]) === lastFamily) position -= 1;
  const [id] = bag.splice(position, 1);
  seen.add(id);
  return {
    category: CATEGORIES.find((item) => item.id === id),
    progress: { bag, seen: [...seen], lastId: id }
  };
}
