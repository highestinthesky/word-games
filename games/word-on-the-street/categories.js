// Original, single-word-friendly prompts for high-school groups.
const PROMPTS = [
  ["science", "A chemical element"], ["science", "A laboratory tool"],
  ["science", "A field of science"], ["science", "A scientific invention"],
  ["science", "A planet or moon"], ["science", "A constellation"],
  ["science", "A mineral"], ["science", "A unit of measurement"],
  ["nature", "A mammal"], ["nature", "A bird"], ["nature", "A reptile"],
  ["nature", "An insect"], ["nature", "A tree"], ["nature", "A flower"],
  ["nature", "A landform"], ["nature", "A weather event"],
  ["nature", "A sea creature"], ["nature", "A type of rock"],
  ["places", "A country"], ["places", "A capital city"],
  ["places", "A U.S. state"], ["places", "A mountain range"],
  ["places", "A river"], ["places", "An island"],
  ["places", "A place people work"], ["places", "A public building"],
  ["arts", "A musical instrument"], ["arts", "A music genre"],
  ["arts", "A dance style"], ["arts", "A film genre"],
  ["arts", "A board game"], ["arts", "A character from mythology"],
  ["arts", "A type of book"], ["arts", "A painting tool"],
  ["arts", "A stage role"], ["arts", "A type of photograph"],
  ["life", "A sport"], ["life", "An Olympic sport"],
  ["life", "A school subject"], ["life", "A profession"],
  ["life", "A hand tool"], ["life", "A piece of furniture"],
  ["life", "A mode of transport"], ["life", "A fabric"],
  ["life", "A language"], ["life", "A programming language"],
  ["food", "A fruit"], ["food", "A vegetable"],
  ["food", "A spice"], ["food", "A dessert"],
  ["food", "A type of bread"], ["food", "A pasta shape"],
  ["food", "A breakfast food"], ["food", "A cooking method"],
  ["science", "A body organ"], ["science", "A bone"],
  ["science", "A muscle"], ["science", "A human sense"],
  ["science", "A branch of mathematics"], ["science", "A geometric shape"],
  ["science", "A mathematical symbol"], ["science", "A physics term"],
  ["science", "A chemistry term"], ["science", "A type of energy"],
  ["science", "A cell structure"], ["science", "A disease"],
  ["science", "A fossil"], ["science", "A space object"],
  ["nature", "A fish"], ["nature", "An amphibian"],
  ["nature", "A dinosaur"], ["nature", "A farm animal"],
  ["nature", "A wild cat"], ["nature", "A primate"],
  ["nature", "A type of forest"], ["nature", "A desert plant"],
  ["nature", "A mushroom"], ["nature", "A seed"],
  ["nature", "A natural disaster"], ["nature", "A cloud type"],
  ["nature", "A body of water"], ["nature", "A gemstone"],
  ["places", "A continent"], ["places", "An ocean"],
  ["places", "A sea"], ["places", "A desert"],
  ["places", "A mountain"], ["places", "A volcano"],
  ["places", "A canyon"], ["places", "A waterfall"],
  ["places", "A European city"], ["places", "An Asian city"],
  ["places", "An African country"], ["places", "A national park"],
  ["places", "A type of bridge"], ["places", "A place to study"],
  ["arts", "An art movement"], ["arts", "A painting style"],
  ["arts", "A sculpture material"], ["arts", "A camera part"],
  ["arts", "A poem form"], ["arts", "A literary genre"],
  ["arts", "A literary device"], ["arts", "A theater genre"],
  ["arts", "A percussion instrument"], ["arts", "A string instrument"],
  ["arts", "A type of song"], ["arts", "A visual art tool"],
  ["life", "A team sport"], ["life", "An individual sport"],
  ["life", "A sports position"], ["life", "A fitness activity"],
  ["life", "A school club"], ["life", "A school supply"],
  ["life", "A clothing item"], ["life", "A shoe style"],
  ["life", "A job in medicine"], ["life", "A job in technology"],
  ["life", "A household appliance"], ["life", "A vehicle part"],
  ["life", "A type of boat"], ["life", "A type of aircraft"],
  ["food", "A berry"], ["food", "A nut"],
  ["food", "A cheese"], ["food", "A herb"],
  ["food", "A grain"], ["food", "A legume"],
  ["food", "A soup"], ["food", "A sauce"],
  ["food", "A pastry"], ["food", "A candy"],
  ["technology", "A computer component"], ["technology", "A file format"],
  ["technology", "A coding term"], ["technology", "A website feature"],
  ["technology", "A video game genre"], ["technology", "A robot part"],
  ["technology", "A type of sensor"], ["technology", "A source of electricity"]
];

export const CATEGORIES = Object.freeze(PROMPTS.map(([family, prompt]) => Object.freeze({
  id: prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  family,
  prompt
})));

// The first 54 prompts shipped before per-game history existed.
export const LEGACY_CATEGORY_IDS = Object.freeze(CATEGORIES.slice(0, 54).map((item) => item.id));

function shuffle(ids, random) {
  const result = [...ids];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function drawCategory(progress = {}, random = Math.random) {
  const known = new Set(CATEGORIES.map((item) => item.id));
  const seen = new Set(Array.isArray(progress.seen) ? progress.seen.filter((id) => known.has(id)) : []);
  let bag = Array.isArray(progress.bag) ? progress.bag.filter((id) => known.has(id) && !seen.has(id)) : [];
  if (!bag.length) {
    bag = shuffle(CATEGORIES.map((item) => item.id).filter((id) => !seen.has(id)), random);
  }
  if (!bag.length) {
    return { category: null, progress: { bag: [], seen: [...seen], lastId: progress.lastId ?? null } };
  }
  const id = bag.pop();
  seen.add(id);
  return {
    category: CATEGORIES.find((item) => item.id === id),
    progress: { bag, seen: [...seen], lastId: id }
  };
}
