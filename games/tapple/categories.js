// Each prompt has at least eight reviewed examples. The examples stay off the
// board; they document that a topic has ordinary answers across several letters.
export const CATEGORY_PACK_VERSION = 3;
const REVIEWED_CATEGORIES = [
  ["food", "Breakfast foods", "eggs|cereal|pancakes|waffles|toast|bagels|muffins|oatmeal|yogurt"],
  ["food", "Fruits", "apple|banana|cherry|date|grape|kiwi|lemon|mango|orange|pear"],
  ["food", "Vegetables", "asparagus|broccoli|carrot|celery|eggplant|kale|lettuce|onion|peas|spinach"],
  ["food", "Desserts", "cake|brownie|cookie|pie|ice cream|doughnut|pudding|tart|fudge"],
  ["food", "Drinks", "water|milk|juice|lemonade|tea|coffee|hot chocolate|soda|cider"],
  ["food", "Pizza toppings", "pepperoni|sausage|mushrooms|olives|onions|basil|ham|pineapple|tomatoes|spinach"],
  ["food", "Sandwich fillings", "ham|turkey|cheese|lettuce|tomato|egg|bacon|avocado|cucumber|peanut butter"],
  ["food", "Sauces and dips", "ketchup|mustard|salsa|hummus|ranch|barbecue sauce|gravy|pesto|guacamole"],
  ["food", "Herbs and spices", "basil|cinnamon|garlic|ginger|oregano|pepper|rosemary|salt|thyme|vanilla"],
  ["food", "Foods you can grill", "burger|hot dog|chicken|corn|steak|fish|peppers|zucchini|mushrooms|tofu"],
  ["food", "Snack foods", "chips|pretzels|popcorn|crackers|nuts|raisins|granola|fruit|candy|yogurt"],
  ["food", "Foods eaten with a spoon", "soup|cereal|ice cream|pudding|yogurt|oatmeal|chili|stew|rice|applesauce"],
  ["food", "Types of bread", "bagel|croissant|flatbread|naan|pita|roll|sourdough|tortilla|rye", 2],
  ["food", "Candy", "lollipop|gummy bear|chocolate|taffy|jelly bean|marshmallow|mint|hard candy|caramel", 2],
  ["food", "Soups and stews", "tomato soup|chicken noodle|minestrone|lentil soup|vegetable soup|chowder|chili|beef stew|pea soup|gumbo", 2],
  ["food", "Foods made from potatoes", "fries|chips|hash browns|mashed potatoes|baked potato|potato salad|gnocchi|tater tots|scalloped potatoes|potato soup", 2],
  ["food", "Foods eaten with a fork", "spaghetti|salad|steak|fish|broccoli|pancakes|cake|rice|potatoes|noodles", 2],
  ["food", "Things on a taco", "lettuce|cheese|salsa|beef|chicken|beans|tomatoes|onions|guacamole|sour cream", 2],

  ["nature", "Birds", "robin|eagle|owl|duck|sparrow|penguin|flamingo|chicken|turkey"],
  ["nature", "Sea animals", "whale|shark|dolphin|octopus|crab|turtle|jellyfish|fish|seal"],
  ["nature", "Insects", "ant|bee|cricket|dragonfly|fly|grasshopper|ladybug|moth|mosquito"],
  ["nature", "Farm animals", "cow|pig|horse|sheep|goat|chicken|duck|turkey|rabbit"],
  ["nature", "Wild mammals", "bear|lion|tiger|zebra|elephant|giraffe|deer|fox|moose|kangaroo"],
  ["nature", "Trees", "oak|maple|pine|birch|cedar|willow|elm|apple tree|palm|spruce"],
  ["nature", "Flowers", "rose|tulip|daisy|sunflower|lily|orchid|violet|poppy|marigold|carnation"],
  ["nature", "Weather words", "rain|snow|hail|fog|wind|thunder|lightning|cloudy|storm"],
  ["nature", "Things at a pond", "ducks|frogs|reeds|lily pads|turtles|insects|water|algae|fish"],
  ["nature", "Animal sounds", "bark|meow|roar|chirp|neigh|hiss|quack|squeak|moo"],
  ["nature", "Bodies of water", "ocean|lake|river|pond|stream|creek|bay|lagoon|sea"],
  ["nature", "Things in a forest", "trees|deer|mushrooms|pinecones|squirrels|foxes|owls|ants|moss"],
  ["nature", "Pets", "dog|cat|fish|hamster|rabbit|guinea pig|bird|turtle|gerbil|parakeet", 2],
  ["nature", "Reptiles", "alligator|crocodile|snake|turtle|lizard|gecko|iguana|chameleon|tortoise|monitor lizard", 2],
  ["nature", "Things in a garden", "soil|flowers|weeds|seeds|hose|shovel|worms|bugs|vegetables|fence", 2],
  ["nature", "Things at a beach", "sand|umbrella|towel|waves|crab|driftwood|jellyfish|boat|lighthouse|palm tree", 2],
  ["nature", "Things that fly", "birds|airplanes|helicopters|bats|butterflies|bees|drones|kites|balloons|rockets", 2],
  ["nature", "Things seen at night", "moon|stars|fireflies|bats|owls|streetlights|airplanes|clouds|porch lights|cars", 2],

  ["places", "Rooms in a home", "kitchen|bathroom|garage|attic|office|den|laundry room|pantry|bedroom"],
  ["places", "Places in a school", "classroom|gym|library|hallway|office|playground|bathroom|auditorium|cafeteria"],
  ["places", "Places to buy food", "supermarket|bakery|market|grocery store|deli|fruit stand|convenience store|ice cream shop"],
  ["places", "Places to eat", "restaurant|cafeteria|diner|pizzeria|bakery|food truck|home|school"],
  ["places", "Buildings in a town", "school|library|post office|fire station|hospital|bank|museum|theater|city hall"],
  ["places", "Places to play sports", "field|court|gym|pool|stadium|park|arena|beach|track|rink"],
  ["places", "Places to see animals", "zoo|farm|pond|ocean|aquarium|backyard|desert|garden|park"],
  ["places", "Places to hear live music", "concert hall|theater|stadium|park|restaurant|festival|arena|school|music hall"],
  ["places", "Places to watch a movie", "movie theater|home|drive-in|school|airplane|backyard|community center|park|hotel"],
  ["places", "Places to learn", "school|library|museum|home|workshop|zoo|art class|park|aquarium"],
  ["places", "Places with a line to wait in", "bank|airport|cafeteria|store|theme park|post office|ice cream shop|grocery store"],
  ["places", "Places to spend the night", "hotel|cabin|home|tent|motel|apartment|friend's house|dorm|campsite|hostel"],
  ["places", "Types of stores", "bookstore|pharmacy|grocery store|bakery|hardware store|toy store|pet shop|shoe store|flower shop|clothing store", 2],
  ["places", "Places with tickets", "movie theater|stadium|museum|aquarium|concert hall|zoo|train station|fair|theater|carnival", 2],
  ["places", "Places to explore outdoors", "forest|trail|canyon|mountain|garden|farm|swamp|lake|beach|desert", 2],
  ["places", "Places to park a vehicle", "garage|driveway|parking lot|street|airport|dock|bike rack|bus depot|campground|rest stop", 2],

  ["objects", "Kitchen tools", "spatula|whisk|knife|ladle|tongs|grater|peeler|colander|measuring cup|blender"],
  ["objects", "School supplies", "pencil|eraser|ruler|notebook|marker|scissors|glue|folder|calculator|tape"],
  ["objects", "Clothing", "shirt|pants|skirt|jacket|socks|hat|coat|dress|vest|tie|blouse"],
  ["objects", "Furniture", "chair|table|sofa|bed|desk|shelf|stool|bench|cabinet|dresser|ottoman"],
  ["objects", "Hand tools", "hammer|screwdriver|wrench|pliers|saw|drill|level|tape measure|clamp|file|rake"],
  ["objects", "Electronics", "phone|tablet|computer|radio|television|printer|speaker|camera|router|headphones|monitor"],
  ["objects", "Cleaning supplies", "broom|mop|sponge|soap|duster|vacuum|brush|spray bottle|cloth|detergent|bucket"],
  ["objects", "Containers", "box|jar|bottle|bag|bin|can|crate|basket|tub|case|envelope|pail"],
  ["objects", "Musical instruments", "guitar|piano|drums|flute|trumpet|violin|saxophone|clarinet|harmonica|banjo"],
  ["objects", "Toys", "ball|doll|blocks|puzzle|kite|yo-yo|train|teddy bear|marbles|action figure"],
  ["objects", "Sports equipment", "bat|ball|glove|helmet|net|racket|stick|skates|cleats|pads"],
  ["objects", "Craft supplies", "paper|glue|scissors|paint|brush|yarn|markers|tape|clay|string|fabric"],
  ["objects", "Footwear", "sneakers|boots|sandals|slippers|cleats|heels|flats|loafers|flip-flops|rain boots", 2],
  ["objects", "Things with wheels", "car|bicycle|stroller|wagon|roller skates|truck|motorcycle|unicycle|go-cart|pram", 2],
  ["objects", "Things that give off light", "lamp|flashlight|candle|fire|sun|moon|television|phone|star|lantern", 2],
  ["objects", "Things made of paper", "book|newspaper|envelope|map|card|poster|napkin|bag|ticket|magazine", 2],
  ["objects", "Things with a handle", "mug|suitcase|door|hammer|spoon|umbrella|basket|pan|brush|bucket", 2],
  ["objects", "Bathroom items", "toothbrush|soap|mirror|comb|lotion|razor|faucet|bathmat|shampoo|towel|plunger|dental floss", 2],
  ["objects", "Things at a picnic", "basket|blanket|sandwiches|napkins|plates|cups|cooler|fruit|ants|table|lemonade", 2],
  ["objects", "Things in a car", "seat|steering wheel|radio|mirror|window|door|glove box|trunk|seatbelt|dashboard|cup holder", 2],

  ["activities", "Sports", "soccer|basketball|football|tennis|volleyball|golf|swimming|baseball|hockey|running"],
  ["activities", "Household chores", "sweeping|mopping|vacuuming|dusting|washing dishes|laundry|cooking|tidying|folding|ironing"],
  ["activities", "Hobbies", "reading|painting|gardening|knitting|cycling|dancing|photography|baking|fishing|sewing"],
  ["activities", "Playground activities", "swinging|sliding|climbing|running|jumping|tag|hide-and-seek|hopscotch|balancing|spinning"],
  ["activities", "Beach activities", "swimming|surfing|sunbathing|building sandcastles|walking|playing volleyball|collecting shells|reading|fishing|napping"],
  ["activities", "Rainy-day activities", "reading|baking|drawing|painting|watching movies|listening to music|puzzles|cooking|napping"],
  ["activities", "Party activities", "dancing|singing|eating|playing games|chatting|opening gifts|laughing|taking photos|decorating"],
  ["activities", "Ways to exercise", "running|walking|swimming|yoga|jumping|cycling|hiking|dancing|stretching|pushups"],
  ["activities", "Ways to travel", "walking|biking|driving|flying|sailing|riding|taking a train|carpooling|boating"],
  ["activities", "Paper crafts", "airplane|boat|card|flower|hat|lantern|fan|chain|mask|snowflake"],
  ["activities", "Ways to move to music", "dancing|clapping|swaying|tapping|spinning|marching|hopping|jumping|nodding"],
  ["activities", "Before-bed routines", "brushing teeth|changing clothes|reading|showering|setting an alarm|turning lights off|putting on pajamas|flossing|drinking water"],
  ["activities", "Outdoor games", "tag|hide-and-seek|hopscotch|soccer|kickball|frisbee|jump rope|capture the flag|red light green light|dodgeball", 2],
  ["activities", "Kitchen actions", "chopping|mixing|baking|washing|peeling|stirring|tasting|pouring|measuring|frying", 2],
  ["activities", "Morning routines", "stretching|showering|brushing teeth|making bed|eating breakfast|getting dressed|packing bag|walking dog|combing hair|tying shoes", 2],
  ["activities", "Things to do at a pool", "swimming|diving|floating|splashing|playing|racing|kicking|practicing|resting|sunbathing", 2],
  ["activities", "Things to do at a campsite", "hiking|cooking|pitching a tent|building a fire|roasting marshmallows|fishing|stargazing|sleeping|playing cards|exploring", 2],
  ["activities", "Things to do with a ball", "throwing|catching|kicking|bouncing|rolling|dribbling|juggling|passing|spinning|tossing", 2],

  ["arts-games", "Board games", "chess|checkers|Monopoly|Scrabble|Clue|Sorry|Life|Guess Who|Battleship|Operation"],
  ["arts-games", "Card games", "Uno|Go Fish|War|Snap|Old Maid|Crazy Eights|Hearts|Memory|Rummy|Solitaire"],
  ["arts-games", "Cartoon characters", "Bugs Bunny|SpongeBob|Mickey Mouse|Tom|Dora|Pikachu|Garfield|Arthur"],
  ["arts-games", "Movie characters", "Elsa|Shrek|Woody|Buzz|Cinderella|Moana|Ariel|Harry Potter|Simba"],
  ["arts-games", "Things in a comic", "heroes|villains|speech bubbles|panels|capes|masks|buildings|aliens|robots"],
  ["arts-games", "Things at a parade", "balloons|floats|costumes|dancers|mascots|signs|vehicles|confetti|drums"],
  ["arts-games", "Things on a stage", "microphone|actor|curtain|lights|props|singer|dancer|set|costume"],
  ["arts-games", "Fairy-tale characters", "Cinderella|Snow White|Red Riding Hood|Goldilocks|Jack|Rapunzel|Pinocchio|Aladdin|Humpty Dumpty"],
  ["arts-games", "Things in a library", "books|shelves|librarians|tables|computers|magazines|newspapers|catalog|printers|chairs"],
  ["arts-games", "Things in a movie theater", "screen|popcorn|tickets|candy|lights|aisles|ushers|projector|seats"],
  ["arts-games", "Music styles", "pop|rock|jazz|country|hip-hop|blues|folk|disco|techno|soul"],
  ["arts-games", "Things at a museum", "paintings|sculptures|exhibits|dinosaur bones|fossils|tickets|guards|artifacts|maps"],
  ["arts-games", "Movie genres", "comedy|drama|adventure|action|animation|fantasy|horror|documentary|musical|science fiction", 2],
  ["arts-games", "Kinds of books", "picture book|comic|mystery|biography|fantasy|cookbook|poetry|dictionary|encyclopedia|graphic novel", 2],
  ["arts-games", "Fairy-tale objects", "castle|dragon|magic wand|crown|spell|throne|glass slipper|beanstalk|sword|pumpkin carriage|mirror", 2],
  ["arts-games", "Things in a magic show", "magician|wand|hat|rabbit|cards|cape|assistant|curtain|audience|trick|box", 2],
  ["arts-games", "Things in a board game", "dice|cards|board|tokens|pieces|spinner|timer|rules|pawn|scorepad", 2],
  ["arts-games", "Things at a birthday party", "cake|candles|balloons|presents|music|games|guests|decorations|hats|snacks", 2],

  ["food", "Pasta shapes", "spaghetti|penne|macaroni|fusilli|rigatoni|linguine|farfalle|orzo|tagliatelle", 3],
  ["food", "Cheeses", "cheddar|mozzarella|brie|feta|gouda|parmesan|ricotta|provolone|Swiss", 3],
  ["food", "Nuts and seeds", "almond|cashew|walnut|pecan|hazelnut|pistachio|sunflower seed|pumpkin seed|sesame seed", 3],
  ["food", "Berries", "strawberry|blueberry|raspberry|blackberry|cranberry|gooseberry|elderberry|mulberry|boysenberry", 3],
  ["food", "Ice cream flavors", "vanilla|chocolate|strawberry|mint chip|pistachio|coffee|butter pecan|rocky road|cookie dough", 3],
  ["food", "Cookie varieties", "chocolate chip|oatmeal raisin|snickerdoodle|gingerbread|shortbread|peanut butter|macaron|fortune cookie|sugar cookie", 3],
  ["food", "Salad ingredients", "arugula|beet|croutons|cucumber|feta|radish|walnut|lettuce|dressing", 3],
  ["food", "Baking ingredients", "flour|sugar|butter|eggs|yeast|baking powder|cocoa|vanilla|milk", 3],
  ["food", "Cereal brands", "Cheerios|Corn Flakes|Froot Loops|Rice Krispies|Lucky Charms|Wheaties|Kix|Raisin Bran|Shredded Wheat", 3],
  ["food", "Dried foods", "apricots|raisins|prunes|dates|jerky|cranberries|mango slices|banana chips|figs", 3],
  ["food", "Foods with a crust", "pie|pizza|quiche|tart|bread|cheesecake|pasty|potpie|galette", 3],
  ["food", "Foods sold frozen", "peas|waffles|dumplings|berries|fish sticks|ice cream|pizza|edamame|chicken nuggets", 3],
  ["food", "Breakfast spreads", "butter|jam|marmalade|honey|peanut butter|cream cheese|hazelnut spread|apple butter|lemon curd", 3],
  ["food", "Foods on a skewer", "kebab|satay|fruit|marshmallow|tofu|shrimp|meatballs|pineapple|vegetables", 3],
  ["food", "Grains", "rice|wheat|oats|barley|corn|millet|rye|sorghum|teff", 3],
  ["food", "Edible mushrooms", "button|portobello|shiitake|oyster|enoki|morel|chanterelle|porcini|cremini", 3],
  ["food", "Foods with a filling", "ravioli|dumpling|empanada|samosa|burrito|cannoli|eclair|pierogi|turnover", 3],
  ["food", "Ways to cook food", "bake|boil|fry|grill|roast|steam|poach|broil|saute", 3],

  ["nature", "Dinosaurs", "triceratops|stegosaurus|velociraptor|diplodocus|ankylosaurus|brachiosaurus|iguanodon|parasaurolophus|tyrannosaurus", 3],
  ["nature", "Dog breeds", "beagle|poodle|dalmatian|collie|labrador|husky|boxer|greyhound|chihuahua", 3],
  ["nature", "Cat breeds", "Siamese|Persian|Maine coon|ragdoll|Bengal|sphynx|Burmese|Abyssinian|Manx", 3],
  ["nature", "Animal homes", "nest|burrow|den|hive|web|shell|lodge|anthill|cocoon", 3],
  ["nature", "Animal coverings", "fur|feathers|scales|shell|skin|wool|quills|spines|armor|bristles|down|hide", 3],
  ["nature", "Animals with tails", "peacock|beaver|scorpion|rattlesnake|monkey|fox|kangaroo|horse|dog", 3],
  ["nature", "Baby animal names", "calf|foal|kitten|puppy|chick|duckling|lamb|cub|joey", 3],
  ["nature", "Things in a cave", "bats|rocks|darkness|echoes|water|crystals|stalactites|stalagmites|tunnels", 3],
  ["nature", "Parts of a plant", "root|stem|leaf|flower|seed|bud|petal|bark|branch", 3],
  ["nature", "Things in a desert", "cactus|dune|oasis|sand|lizard|camel|scorpion|tumbleweed|roadrunner", 3],
  ["nature", "Things in the Arctic", "iceberg|polar bear|walrus|narwhal|seal|tundra|snow|reindeer|arctic fox", 3],
  ["nature", "Things in a rainforest", "vines|toucan|sloth|jaguar|canopy|orchid|parrot|monkey|tree frog", 3],
  ["nature", "Landforms", "mountain|valley|plateau|canyon|hill|plain|island|peninsula|cliff", 3],
  ["nature", "Rocks and minerals", "granite|marble|quartz|slate|basalt|limestone|sandstone|obsidian|mica", 3],
  ["nature", "Gemstones", "ruby|sapphire|emerald|diamond|opal|amethyst|topaz|garnet|jade", 3],
  ["nature", "Things in space", "planet|asteroid|comet|galaxy|nebula|star|moon|satellite|meteor", 3],
  ["nature", "Signs of spring", "blossoms|seedlings|tadpoles|ducklings|daffodils|bluebells|crocuses|buds|pollen", 3],
  ["nature", "Things you find on a shore", "seashell|pebble|seaweed|driftwood|sea glass|sand dollar|clam|mussel|limpet", 3],

  ["places", "Things at an airport", "runway|terminal|gate|luggage|pilot|check-in desk|control tower|hangar|conveyor belt", 3],
  ["places", "Things at a train station", "platform|track|ticket machine|timetable|bench|conductor|clock|suitcase|escalator", 3],
  ["places", "Things at a post office", "stamp|parcel|envelope|scale|mailbox|counter|label|postcard|tape", 3],
  ["places", "Things at a hotel", "reception|key card|elevator|lobby|suitcase|pool|bell cart|room|towel", 3],
  ["places", "Things at a campsite", "tent|sleeping bag|lantern|firepit|cooler|hammock|backpack|picnic table|rope", 3],
  ["places", "Things at a playground", "slide|swing|seesaw|climbing frame|sandbox|bench|tunnel|merry-go-round|ladder", 3],
  ["places", "Things at a swimming pool", "diving board|lane rope|ladder|goggles|float|kickboard|lifeguard|whistle|towel", 3],
  ["places", "Things at a zoo", "giraffe|keeper|enclosure|penguin|map|reptile house|aviary|otter|elephant", 3],
  ["places", "Things at an aquarium", "tank|coral|stingray|seahorse|jellyfish|diver|anemone|lobster|eel", 3],
  ["places", "Things at a fairground", "carousel|Ferris wheel|roller coaster|bumper cars|cotton candy|ticket booth|prize|ring toss|funhouse", 3],
  ["places", "Things at a bowling alley", "pins|lane|ball|shoes|scoreboard|gutter|ramp|counter|seats", 3],
  ["places", "Things at a restaurant table", "menu|napkin|fork|knife|spoon|plate|glass|salt shaker|placemat", 3],
  ["places", "Things at a supermarket", "cart|checkout|aisle|freezer|produce|bakery|scale|shelf|basket", 3],
  ["places", "Things at a construction site", "crane|bricks|concrete|scaffold|bulldozer|hard hat|excavator|ladder|wheelbarrow", 3],
  ["places", "Things at a hair salon", "comb|scissors|mirror|cape|hair dryer|shampoo|clippers|brush|curlers|foils", 3],
  ["places", "Things at a bakery", "oven|apron|dough|flour|rolling pin|mixing bowl|display case|loaf|scale", 3],
  ["places", "Parts of a building", "roof|wall|floor|ceiling|window|door|staircase|balcony|chimney", 3],
  ["places", "Things along a street", "sidewalk|crosswalk|traffic light|mailbox|bus stop|hydrant|lamppost|curb|drain", 3],

  ["objects", "Vehicles on rails", "train|tram|streetcar|subway|monorail|trolley|funicular|locomotive|minecart|roller coaster", 3],
  ["objects", "Types of boats", "canoe|kayak|sailboat|ferry|yacht|tugboat|raft|gondola|barge", 3],
  ["objects", "Parts of a bicycle", "pedal|chain|saddle|handlebar|brake|wheel|spoke|frame|bell", 3],
  ["objects", "Fasteners", "zipper|button|buckle|snap|clasp|hook|knot|Velcro|screw", 3],
  ["objects", "Fabrics", "cotton|denim|silk|wool|linen|velvet|fleece|nylon|polyester", 3],
  ["objects", "Clothing accessories", "scarf|belt|tie|bracelet|necklace|watch|earrings|headband|brooch", 3],
  ["objects", "Things for a rainy day", "umbrella|raincoat|boots|poncho|hood|galoshes|waterproof bag|wiper|tarp", 3],
  ["objects", "Things in a sewing kit", "needle|thread|thimble|scissors|pins|buttons|tape measure|seam ripper|chalk", 3],
  ["objects", "Parts of a computer", "keyboard|mouse|monitor|processor|motherboard|fan|hard drive|memory|power supply|graphics card", 3],
  ["objects", "Camera equipment", "tripod|lens|flash|battery|memory card|strap|filter|reflector|light meter", 3],
  ["objects", "Things used to measure", "ruler|scale|thermometer|stopwatch|protractor|compass|odometer|measuring cup|barometer", 3],
  ["objects", "Things that tell time", "clock|watch|sundial|hourglass|phone|timer|stopwatch|microwave|oven", 3],
  ["objects", "Things that make a ringing sound", "bell|telephone|alarm clock|doorbell|triangle|chime|tuning fork|bicycle bell|gong", 3],
  ["objects", "Things that use batteries", "flashlight|remote control|toy car|hearing aid|calculator|smoke detector|game controller|watch|electric toothbrush", 3],
  ["objects", "Things with a lid", "teapot|jar|saucepan|trash can|lunchbox|chest|cooler|kettle|cookie tin", 3],
  ["objects", "Things that come in pairs", "socks|shoes|gloves|earrings|chopsticks|skates|mittens|cufflinks|bookends", 3],
  ["objects", "Things made of rubber", "tire|eraser|rubber band|balloon|gasket|glove|bouncy ball|doorstop|hose", 3],
  ["objects", "Things made of glass", "window|bottle|marble|vase|mirror|jar|aquarium|lens|light bulb", 3],

  ["activities", "Ways to move on land", "crawl|walk|run|hop|skip|jump|march|tiptoe|shuffle", 3],
  ["activities", "Actions in a soccer game", "pass|kick|dribble|tackle|shoot|head|save|cross|throw in", 3],
  ["activities", "Gymnastics moves", "cartwheel|handstand|somersault|backflip|split|tuck|leap|bridge|roundoff", 3],
  ["activities", "Track and field events", "sprint|relay|hurdles|long jump|high jump|pole vault|discus|javelin|shot put", 3],
  ["activities", "Winter sports", "skiing|snowboarding|curling|bobsledding|luge|skeleton|ice hockey|speed skating|figure skating", 3],
  ["activities", "Water sports", "surfing|kayaking|rowing|sailing|diving|water polo|wakeboarding|windsurfing|canoeing", 3],
  ["activities", "Dance styles", "ballet|tap|salsa|waltz|jazz|breakdancing|flamenco|tango|swing", 3],
  ["activities", "Things to do with yarn", "knit|crochet|weave|braid|wrap|tie|wind|knot|embroider", 3],
  ["activities", "Ways to decorate paper", "draw|paint|stamp|print|stencil|doodle|emboss|collage|glitter", 3],
  ["activities", "Gardening actions", "plant|water|weed|prune|rake|dig|mulch|harvest|compost", 3],
  ["activities", "Ways to care for a pet", "feed|groom|walk|brush|bathe|train|play|refill water|clean cage", 3],
  ["activities", "Things to check before a trip", "route|weather|tickets|luggage|reservations|fuel|tire pressure|opening hours|battery", 3],
  ["activities", "Things to pack for a hike", "water bottle|map|compass|snacks|sunscreen|hat|jacket|flashlight|binoculars", 3],
  ["activities", "Things to pack for a sleepover", "pajamas|toothbrush|sleeping bag|pillow|clothes|slippers|book|game|teddy bear", 3],
  ["activities", "Steps in doing laundry", "sort|wash|rinse|spin|dry|fold|iron|hang|put away", 3],
  ["activities", "Things you can collect", "stamps|coins|postcards|rocks|shells|stickers|marbles|buttons|comics", 3],
  ["activities", "Things a robot could do", "clean|build|sort|carry|paint|dance|deliver|inspect|assemble", 3],
  ["activities", "Ways to send a message", "email|letter|postcard|text|phone call|video call|radio|sign language|semaphore", 3],

  ["arts-games", "Parts of a book", "cover|spine|page|chapter|index|glossary|title|preface|illustration", 3],
  ["arts-games", "People who make a movie", "director|actor|writer|producer|editor|composer|animator|costume designer|camera operator", 3],
  ["arts-games", "Jobs at a theater", "usher|director|actor|stage manager|lighting technician|costume designer|set builder|choreographer|playwright", 3],
  ["arts-games", "Kinds of art", "painting|sculpture|drawing|photography|pottery|mosaic|collage|printmaking|weaving", 3],
  ["arts-games", "Art materials", "charcoal|pastel|ink|watercolor|pencil|canvas|easel|crayon|chalk|graphite", 3],
  ["arts-games", "Patterns", "stripes|polka dots|checks|plaid|zigzags|spirals|chevrons|paisley|herringbone|floral", 3],
  ["arts-games", "Shapes", "circle|square|triangle|rectangle|oval|hexagon|pentagon|diamond|star", 3],
  ["arts-games", "Colors", "red|orange|yellow|green|blue|purple|pink|brown|black", 3],
  ["arts-games", "Things on a map", "legend|scale|compass rose|border|river|road|city|symbol|grid", 3],
  ["arts-games", "Puzzle types", "jigsaw|crossword|word search|sudoku|riddle|maze|logic puzzle|anagram|rebus", 3],
  ["arts-games", "Video game genres", "platformer|racing|puzzle|adventure|simulation|strategy|sports|rhythm|sandbox|fighting|educational", 3],
  ["arts-games", "Video game characters", "Mario|Sonic|Kirby|Link|Pikachu|Donkey Kong|Yoshi|Samus|Pac-Man", 3],
  ["arts-games", "Superheroes", "Superman|Batman|Wonder Woman|Spider-Man|Hulk|Iron Man|Thor|Flash|Captain Marvel", 3],
  ["arts-games", "Mythical creatures", "dragon|unicorn|mermaid|griffin|phoenix|troll|elf|fairy|centaur", 3],
  ["arts-games", "Things in a circus show", "acrobat|clown|juggler|trapeze|unicycle|tightrope|ringmaster|tent|spotlight", 3],
  ["arts-games", "Parts of a song", "verse|chorus|bridge|intro|outro|melody|harmony|beat|lyrics", 3],
  ["arts-games", "Things in a video game", "level|score|avatar|checkpoint|inventory|quest|map|power-up|boss", 3],
  ["arts-games", "Things on a game controller", "button|joystick|trigger|bumper|directional pad|touchpad|light|cable|charging port", 3]
];

export const CATEGORY_PACKS = Object.freeze([
  {
    id: "classroom-safe",
    name: "Classroom Safe",
    description: "Familiar categories for a shared screen.",
    categories: Object.freeze(REVIEWED_CATEGORIES.map(([family, prompt, examples, introduced = 1]) => {
      const exampleAnswers = Object.freeze(examples.split("|"));
      return Object.freeze({
        id: prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        prompt,
        family,
        introduced,
        difficulty: "easy",
        minAnswers: exampleAnswers.length,
        exampleAnswers
      });
    }))
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

export function upgradeDrawBag(categories, drawBag = [], fromVersion = 1, random = Math.random) {
  const pending = Array.isArray(drawBag) ? drawBag : [];
  const pendingIds = new Set(pending);
  const added = shuffleCategories(categories.filter((category) => category.introduced > fromVersion && !pendingIds.has(category.id)), random);
  return [...added.map((category) => category.id), ...pending];
}

export function drawCategory({ categories, drawBag = [], recentFamilies = [], lastCategoryId = null, random = Math.random }) {
  if (!categories.length) throw new Error("No reviewed categories are available.");
  const byId = new Map(categories.map((category) => [category.id, category]));
  const validBag = Array.isArray(drawBag) ? [...new Set(drawBag.filter((id) => byId.has(id)))] : [];
  const bag = validBag.length ? validBag : shuffleCategories(categories, random).map((category) => category.id);
  const recent = Array.isArray(recentFamilies) ? recentFamilies.slice(-2) : [];
  let index = bag.findIndex((id) => id !== lastCategoryId && !recent.includes(byId.get(id).family));
  if (index < 0) index = bag.findIndex((id) => id !== lastCategoryId);
  if (index < 0) index = 0;
  const [id] = bag.splice(index, 1);
  const category = byId.get(id);
  return {
    category,
    drawBag: bag,
    recentFamilies: [...recent, category.family].slice(-2),
    lastCategoryId: id
  };
}
