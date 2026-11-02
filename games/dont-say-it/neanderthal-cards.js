// Original prompts for one-syllable clues: familiar school-level concepts,
// processes, and phrases whose usual descriptions need longer words.
const GROUPS = [
  ["Reasoning", [
    "Confirmation Bias", "Critical Thinking", "Logical Fallacy", "Double Standard",
    "False Dilemma", "Circular Reasoning", "Burden of Proof", "Contradiction",
    "Coincidence", "Correlation", "Cause and Effect", "Hypothesis",
    "Assumption", "Generalization", "Paradox", "Probability",
    "Process of Elimination", "Educated Guess", "Trial and Error", "Perspective",
    "Skepticism", "Objectivity", "Intuition", "Hindsight",
    "Peer Review", "Scientific Method", "Control Group", "Placebo Effect",
    "Independent Variable", "Margin of Error"
  ]],
  ["Science and nature", [
    "Natural Selection", "Photosynthesis", "Cell Division", "Genetic Mutation",
    "Food Chain", "Biodiversity", "Symbiosis", "Camouflage",
    "Metamorphosis", "Hibernation", "Echolocation", "Invasive Species",
    "Renewable Energy", "Greenhouse Effect", "Carbon Footprint", "Plate Tectonics",
    "Continental Drift", "Erosion", "Water Cycle", "Evaporation",
    "Condensation", "Atmospheric Pressure", "Static Electricity", "Magnetic Field",
    "Nuclear Fusion", "Chemical Reaction", "Conservation of Energy", "Refraction",
    "Surface Tension", "Terminal Velocity"
  ]],
  ["Society and history", [
    "Civil Disobedience", "Freedom of Speech", "Separation of Powers", "Checks and Balances",
    "Constitution", "Democracy", "Dictatorship", "Constitutional Monarchy",
    "Industrial Revolution", "Cultural Heritage", "Archaeology", "Oral Tradition",
    "Civil Rights", "Universal Suffrage", "Peace Treaty", "Arms Race",
    "Economic Sanctions", "Diplomatic Immunity", "Propaganda", "Censorship",
    "Civilization", "Colonization", "Immigration", "Urbanization",
    "Public Opinion", "Social Contract", "Majority Rule", "Minority Rights",
    "Separation of Church and State", "Humanitarian Aid"
  ]],
  ["Money and systems", [
    "Opportunity Cost", "Supply and Demand", "Inflation", "Recession",
    "Compound Interest", "Minimum Wage", "Income Tax", "Budget Deficit",
    "National Debt", "Trade Agreement", "Exchange Rate", "Market Competition",
    "Monopoly", "Division of Labor", "Assembly Line", "Supply Chain",
    "Quality Control", "Planned Obsolescence", "Consumer Rights", "Price Gouging",
    "Scarcity", "Investment", "Insurance", "Bankruptcy",
    "Crowdfunding", "Financial Literacy", "Profit Margin", "Cost of Living",
    "Fair Trade", "Economic Inequality"
  ]],
  ["Language and culture", [
    "Dramatic Irony", "Unreliable Narrator", "Foreshadowing", "Symbolism",
    "Metaphor", "Allegory", "Satire", "Hyperbole",
    "Alliteration", "Personification", "Character Development", "Plot Twist",
    "Cliffhanger", "Antagonist", "Internal Conflict", "Moral Dilemma",
    "Point of View", "Historical Fiction", "Autobiography", "Stage Fright",
    "Cultural Appropriation", "Freedom of Expression", "Public Domain", "Intellectual Property",
    "Creative License", "Suspension of Disbelief", "Unwritten Rule", "Lost in Translation",
    "Figure of Speech", "Rhetorical Question"
  ]],
  ["People and technology", [
    "Artificial Intelligence", "Machine Learning", "Digital Footprint", "Identity Theft",
    "Two-Factor Authentication", "End-to-End Encryption", "Search Algorithm", "Facial Recognition",
    "Virtual Reality", "Augmented Reality", "Satellite Navigation", "Wireless Charging",
    "Data Privacy", "Misinformation", "Echo Chamber", "Cyberbullying",
    "Peer Pressure", "Conflict of Interest", "Delayed Gratification", "Instant Gratification",
    "Cognitive Dissonance", "Emotional Intelligence", "Impostor Syndrome", "Self-Fulfilling Prophecy",
    "Nonverbal Communication", "Bystander Effect", "Personal Boundaries", "Constructive Criticism",
    "Compromise", "Accountability"
  ]]
];

export const NEANDERTHAL_CARDS = Object.freeze(GROUPS.flatMap(([category, targets]) =>
  targets.map((target) => Object.freeze({
    id: `neanderthals:${target.toLowerCase()}`,
    target,
    category,
    forbidden: Object.freeze([])
  }))
));
