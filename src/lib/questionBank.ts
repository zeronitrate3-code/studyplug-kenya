import type { Question } from "./mockData";

// Question bank for all subjects across grades
const questionBank: Record<string, Question[]> = {
  // ============ MATHEMATICS ============
  mathematics: [
    { id: "math-1", question: "What is 1/2 + 1/4?", options: ["1/2", "3/4", "1/3", "2/3"], correctAnswer: 1, explanation: "1/2 = 2/4, so 2/4 + 1/4 = 3/4." },
    { id: "math-2", question: "Convert 0.75 to a fraction.", options: ["3/5", "7/10", "3/4", "4/5"], correctAnswer: 2, explanation: "0.75 = 75/100 = 3/4." },
    { id: "math-3", question: "What is 3/5 × 10?", options: ["5", "6", "7", "8"], correctAnswer: 1, explanation: "3/5 × 10 = 30/5 = 6." },
    { id: "math-4", question: "Solve: 2x + 6 = 16", options: ["3", "4", "5", "6"], correctAnswer: 2, explanation: "2x = 10, x = 5." },
    { id: "math-5", question: "What is the area of a rectangle with length 8cm and width 5cm?", options: ["13 cm²", "26 cm²", "40 cm²", "80 cm²"], correctAnswer: 2, explanation: "Area = l × w = 8 × 5 = 40 cm²." },
  ],

  // ============ ENGLISH ============
  english: [
    { id: "eng-1", question: "Which word is a noun?", options: ["Run", "Beautiful", "Happiness", "Quickly"], correctAnswer: 2, explanation: "Happiness is a noun — it names a feeling." },
    { id: "eng-2", question: "Choose the correct sentence:", options: ["She don't like it.", "She doesn't likes it.", "She doesn't like it.", "She not like it."], correctAnswer: 2, explanation: "'Doesn't' is used with 'she' and the base verb." },
    { id: "eng-3", question: "What is a synonym of 'happy'?", options: ["Sad", "Joyful", "Angry", "Tired"], correctAnswer: 1, explanation: "Joyful means the same as happy." },
    { id: "eng-4", question: "Identify the verb: 'The cat slept on the mat.'", options: ["cat", "slept", "on", "mat"], correctAnswer: 1, explanation: "'Slept' is the action word (verb)." },
    { id: "eng-5", question: "Which is a compound sentence?", options: ["I went home.", "I went home, and she stayed.", "Going home.", "The big red car."], correctAnswer: 1, explanation: "It has two independent clauses joined by 'and'." },
  ],

  // ============ KISWAHILI ============
  kiswahili: [
    { id: "kis-1", question: "Neno 'Uhuru' lina maana gani?", options: ["Amani", "Freedom", "Nguvu", "Umoja"], correctAnswer: 1, explanation: "Uhuru means freedom/independence." },
    { id: "kis-2", question: "Wingi wa 'mtoto' ni nini?", options: ["Watoto", "Mitoto", "Matoto", "Vitoto"], correctAnswer: 0, explanation: "M-WA class: mtoto → watoto." },
    { id: "kis-3", question: "Chagua sentensi sahihi:", options: ["Mimi kupenda chakula.", "Mimi ninapenda chakula.", "Mimi penda chakula.", "Ninapenda mimi chakula."], correctAnswer: 1, explanation: "Correct subject-verb agreement: Mimi ninapenda." },
    { id: "kis-4", question: "'Shule' ni neno la aina gani?", options: ["Kitenzi", "Kivumishi", "Nomino", "Kielezi"], correctAnswer: 2, explanation: "Shule (school) is a nomino (noun)." },
    { id: "kis-5", question: "Kinyume cha 'kubwa' ni nini?", options: ["Kidogo", "Ndefu", "Fupi", "Nyembamba"], correctAnswer: 0, explanation: "Kubwa (big) → kidogo (small)." },
  ],

  // ============ CHEMISTRY ============
  chemistry: [
    { id: "chem-1", question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], correctAnswer: 0, explanation: "Water is H2O — two hydrogen atoms and one oxygen." },
    { id: "chem-2", question: "What is the pH of a neutral solution?", options: ["0", "7", "10", "14"], correctAnswer: 1, explanation: "pH 7 is neutral — neither acidic nor basic." },
    { id: "chem-3", question: "Which gas is produced when acids react with metals?", options: ["Oxygen", "Carbon dioxide", "Hydrogen", "Nitrogen"], correctAnswer: 2, explanation: "Acid + metal → salt + hydrogen gas." },
    { id: "chem-4", question: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], correctAnswer: 1, explanation: "Carbon has 6 protons, so atomic number = 6." },
    { id: "chem-5", question: "Which of these is a mixture?", options: ["Water", "Salt", "Air", "Iron"], correctAnswer: 2, explanation: "Air is a mixture of gases (N₂, O₂, CO₂, etc.)." },
  ],

  // ============ BIOLOGY ============
  biology: [
    { id: "bio-1", question: "What is the basic unit of life?", options: ["Atom", "Molecule", "Cell", "Organ"], correctAnswer: 2, explanation: "The cell is the basic structural and functional unit of life." },
    { id: "bio-2", question: "Which gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: 2, explanation: "Plants absorb CO₂ and release O₂ during photosynthesis." },
    { id: "bio-3", question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nuclear Acid", "Dual Nucleotide Acid"], correctAnswer: 0, explanation: "DNA = Deoxyribonucleic Acid." },
    { id: "bio-4", question: "Which organ pumps blood in the human body?", options: ["Liver", "Lungs", "Heart", "Brain"], correctAnswer: 2, explanation: "The heart pumps blood through the circulatory system." },
    { id: "bio-5", question: "What is the largest organ of the human body?", options: ["Liver", "Brain", "Skin", "Heart"], correctAnswer: 2, explanation: "The skin is the largest organ by surface area." },
  ],

  // ============ PHYSICS ============
  physics: [
    { id: "phy-1", question: "What is the SI unit of force?", options: ["Joule", "Newton", "Watt", "Pascal"], correctAnswer: 1, explanation: "Force is measured in Newtons (N)." },
    { id: "phy-2", question: "What is the speed of light approximately?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correctAnswer: 1, explanation: "Speed of light ≈ 3 × 10⁸ m/s." },
    { id: "phy-3", question: "Which law states 'For every action there is an equal and opposite reaction'?", options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravity"], correctAnswer: 2, explanation: "Newton's Third Law of Motion." },
    { id: "phy-4", question: "What is the unit of electrical resistance?", options: ["Ampere", "Volt", "Ohm", "Watt"], correctAnswer: 2, explanation: "Resistance is measured in Ohms (Ω)." },
    { id: "phy-5", question: "Which form of energy does a moving car have?", options: ["Potential", "Kinetic", "Chemical", "Thermal"], correctAnswer: 1, explanation: "A moving object has kinetic energy." },
  ],

  // ============ GENERAL SCIENCE ============
  "general-science": [
    { id: "gs-1", question: "What is the boiling point of water in °C?", options: ["90", "95", "100", "110"], correctAnswer: 2, explanation: "Water boils at 100°C at sea level." },
    { id: "gs-2", question: "What planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], correctAnswer: 1, explanation: "Mercury is the closest planet to the Sun." },
    { id: "gs-3", question: "What is the largest planet in our solar system?", options: ["Saturn", "Neptune", "Jupiter", "Uranus"], correctAnswer: 2, explanation: "Jupiter is the largest planet." },
    { id: "gs-4", question: "What type of rock is formed from cooled lava?", options: ["Sedimentary", "Metamorphic", "Igneous", "Organic"], correctAnswer: 2, explanation: "Igneous rocks form from cooled magma/lava." },
    { id: "gs-5", question: "How many bones are in an adult human body?", options: ["186", "206", "226", "256"], correctAnswer: 1, explanation: "An adult human has 206 bones." },
  ],

  // ============ COMPUTER STUDIES ============
  "computer-studies": [
    { id: "cs-1", question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correctAnswer: 0, explanation: "CPU = Central Processing Unit." },
    { id: "cs-2", question: "Which is an input device?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correctAnswer: 2, explanation: "A keyboard is used to input data into a computer." },
    { id: "cs-3", question: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Rapid Access Memory", "Ready Access Module"], correctAnswer: 1, explanation: "RAM = Random Access Memory." },
    { id: "cs-4", question: "Which file extension is for a web page?", options: [".doc", ".html", ".mp3", ".exe"], correctAnswer: 1, explanation: ".html is the extension for web pages." },
    { id: "cs-5", question: "What is the binary representation of the number 5?", options: ["100", "101", "110", "111"], correctAnswer: 1, explanation: "5 in binary is 101 (4+1)." },
  ],

  // ============ LITERATURE ============
  literature: [
    { id: "lit-1", question: "Who wrote 'Things Fall Apart'?", options: ["Wole Soyinka", "Chinua Achebe", "Ngugi wa Thiong'o", "Chimamanda Adichie"], correctAnswer: 1, explanation: "Chinua Achebe wrote Things Fall Apart in 1958." },
    { id: "lit-2", question: "What is a 'stanza' in poetry?", options: ["A line", "A group of lines", "A rhyme", "A title"], correctAnswer: 1, explanation: "A stanza is a group of lines forming a unit in a poem." },
    { id: "lit-3", question: "What literary device is 'The wind whispered through the trees'?", options: ["Simile", "Metaphor", "Personification", "Alliteration"], correctAnswer: 2, explanation: "Giving human qualities (whispering) to non-human things is personification." },
    { id: "lit-4", question: "What is the main character of a story called?", options: ["Antagonist", "Narrator", "Protagonist", "Author"], correctAnswer: 2, explanation: "The protagonist is the main character." },
    { id: "lit-5", question: "A story within a story is called?", options: ["Flashback", "Frame narrative", "Foreshadowing", "Plot twist"], correctAnswer: 1, explanation: "A frame narrative is a story within a story." },
  ],

  // ============ BUSINESS STUDIES ============
  business: [
    { id: "bus-1", question: "What is profit?", options: ["Total sales", "Income minus expenses", "Total expenses", "Revenue"], correctAnswer: 1, explanation: "Profit = Income - Expenses." },
    { id: "bus-2", question: "What does GDP stand for?", options: ["Gross Domestic Product", "General Domestic Price", "Grand Delivery Price", "Gross Delivery Product"], correctAnswer: 0, explanation: "GDP = Gross Domestic Product." },
    { id: "bus-3", question: "Which is an example of a need?", options: ["Smartphone", "Food", "Video game", "Jewelry"], correctAnswer: 1, explanation: "Food is a basic human need for survival." },
    { id: "bus-4", question: "What is a budget?", options: ["A type of tax", "A plan for spending money", "A bank account", "A loan"], correctAnswer: 1, explanation: "A budget is a plan for how to spend money." },
    { id: "bus-5", question: "Who is an entrepreneur?", options: ["An employee", "A person who starts a business", "A customer", "A supplier"], correctAnswer: 1, explanation: "An entrepreneur starts and runs their own business." },
  ],

  // ============ SOCIAL STUDIES ============
  "social-studies": [
    { id: "ss-1", question: "What is the capital of Kenya?", options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"], correctAnswer: 1, explanation: "Nairobi is the capital city of Kenya." },
    { id: "ss-2", question: "Kenya gained independence in which year?", options: ["1960", "1963", "1964", "1965"], correctAnswer: 1, explanation: "Kenya gained independence on December 12, 1963." },
    { id: "ss-3", question: "How many counties does Kenya have?", options: ["42", "45", "47", "50"], correctAnswer: 2, explanation: "Kenya has 47 counties." },
    { id: "ss-4", question: "What is the longest river in Africa?", options: ["Congo", "Niger", "Nile", "Zambezi"], correctAnswer: 2, explanation: "The Nile is the longest river in Africa (~6,650 km)." },
    { id: "ss-5", question: "Which lake is the largest in Africa?", options: ["Lake Turkana", "Lake Victoria", "Lake Tanganyika", "Lake Malawi"], correctAnswer: 1, explanation: "Lake Victoria is the largest lake in Africa." },
  ],

  // ============ CREATIVE ARTS ============
  "creative-arts": [
    { id: "ca-1", question: "What are the three primary colors?", options: ["Red, Green, Blue", "Red, Yellow, Blue", "Red, Orange, Purple", "Yellow, Green, Blue"], correctAnswer: 1, explanation: "In art, primary colors are red, yellow, and blue." },
    { id: "ca-2", question: "What is a 'portrait'?", options: ["A landscape painting", "A picture of a person", "A still life", "An abstract work"], correctAnswer: 1, explanation: "A portrait is a representation of a person." },
    { id: "ca-3", question: "Which element of art deals with light and dark?", options: ["Line", "Color", "Value", "Texture"], correctAnswer: 2, explanation: "Value refers to the lightness or darkness of a color." },
    { id: "ca-4", question: "What instrument is a 'nyatiti'?", options: ["Drum", "String instrument", "Wind instrument", "Keyboard"], correctAnswer: 1, explanation: "Nyatiti is a traditional Luo string instrument." },
    { id: "ca-5", question: "What is symmetry in art?", options: ["Random shapes", "Balanced arrangement", "Dark colors", "Curved lines"], correctAnswer: 1, explanation: "Symmetry means a balanced, mirror-like arrangement." },
  ],

  // ============ AGRICULTURE ============
  agriculture: [
    { id: "agri-1", question: "What is crop rotation?", options: ["Growing crops in water", "Changing crops each season", "Planting in rows", "Using fertilizer"], correctAnswer: 1, explanation: "Crop rotation means growing different crops in succession." },
    { id: "agri-2", question: "Which soil type is best for farming?", options: ["Sandy", "Clay", "Loam", "Gravel"], correctAnswer: 2, explanation: "Loam soil has the best balance of nutrients and drainage." },
    { id: "agri-3", question: "What is photosynthesis?", options: ["Plants absorbing water", "Plants making food using sunlight", "Plants releasing oxygen only", "Plants growing roots"], correctAnswer: 1, explanation: "Photosynthesis is the process plants use to make food from sunlight." },
    { id: "agri-4", question: "Which of these is a cash crop in Kenya?", options: ["Maize", "Tea", "Beans", "Spinach"], correctAnswer: 1, explanation: "Tea is one of Kenya's major cash (export) crops." },
    { id: "agri-5", question: "What is irrigation?", options: ["Removing weeds", "Supplying water to crops", "Harvesting crops", "Planting seeds"], correctAnswer: 1, explanation: "Irrigation is the artificial supply of water to crops." },
  ],

  // ============ INTEGRATED SCIENCE ============
  "integrated-science": [
    { id: "is-1", question: "What are the states of matter?", options: ["Hot, cold, warm", "Solid, liquid, gas", "Heavy, light, medium", "Big, small, tiny"], correctAnswer: 1, explanation: "The three main states of matter are solid, liquid, and gas." },
    { id: "is-2", question: "What causes day and night?", options: ["The moon's orbit", "Earth's rotation", "The sun moving", "Clouds"], correctAnswer: 1, explanation: "Earth's rotation on its axis causes day and night." },
    { id: "is-3", question: "What is the function of white blood cells?", options: ["Carry oxygen", "Fight infections", "Clot blood", "Digest food"], correctAnswer: 1, explanation: "White blood cells defend the body against infections." },
    { id: "is-4", question: "What is the chemical formula for table salt?", options: ["NaCl", "H2O", "CO2", "KCl"], correctAnswer: 0, explanation: "Table salt is sodium chloride (NaCl)." },
    { id: "is-5", question: "Which type of energy comes from the sun?", options: ["Mechanical", "Nuclear", "Solar", "Chemical"], correctAnswer: 2, explanation: "The sun provides solar energy." },
  ],

  // ============ PRE-TECHNICAL STUDIES ============
  "pre-technical": [
    { id: "pt-1", question: "What tool is used to measure length accurately?", options: ["Ruler", "Thermometer", "Scale", "Stopwatch"], correctAnswer: 0, explanation: "A ruler is used to measure length." },
    { id: "pt-2", question: "What material is a good electrical conductor?", options: ["Rubber", "Wood", "Copper", "Glass"], correctAnswer: 2, explanation: "Copper is an excellent conductor of electricity." },
    { id: "pt-3", question: "What is a circuit?", options: ["A type of wire", "A complete path for electricity", "A battery", "A switch"], correctAnswer: 1, explanation: "A circuit is a complete path through which electricity flows." },
    { id: "pt-4", question: "Which is a renewable energy source?", options: ["Coal", "Natural gas", "Solar", "Petroleum"], correctAnswer: 2, explanation: "Solar energy is renewable — it won't run out." },
    { id: "pt-5", question: "What does a lever do?", options: ["Creates electricity", "Helps lift heavy loads", "Measures weight", "Stores energy"], correctAnswer: 1, explanation: "A lever is a simple machine that helps lift or move loads." },
  ],

  // ============ PE / PHYSICAL EDUCATION ============
  pe: [
    { id: "pe-1", question: "How many players are on a soccer team?", options: ["9", "10", "11", "12"], correctAnswer: 2, explanation: "A soccer team has 11 players on the field." },
    { id: "pe-2", question: "What is a warm-up?", options: ["Wearing warm clothes", "Light exercise before sports", "Drinking hot water", "Resting"], correctAnswer: 1, explanation: "A warm-up is light exercise to prepare the body." },
    { id: "pe-3", question: "Which sport uses a shuttlecock?", options: ["Tennis", "Badminton", "Cricket", "Golf"], correctAnswer: 1, explanation: "Badminton uses a shuttlecock." },
    { id: "pe-4", question: "What is stamina?", options: ["Speed", "Ability to sustain effort", "Flexibility", "Strength"], correctAnswer: 1, explanation: "Stamina is the ability to maintain physical effort over time." },
    { id: "pe-5", question: "How long is a marathon in km?", options: ["21 km", "32 km", "42 km", "50 km"], correctAnswer: 2, explanation: "A marathon is 42.195 km." },
  ],

  // ============ ICT / DIGITAL LITERACY ============
  ict: [
    { id: "ict-1", question: "What is the internet?", options: ["A computer", "A global network of computers", "A program", "A website"], correctAnswer: 1, explanation: "The internet is a global network connecting millions of computers." },
    { id: "ict-2", question: "What does 'www' stand for?", options: ["World Wide Web", "Wide World Web", "Web World Wide", "World Web Wide"], correctAnswer: 0, explanation: "WWW = World Wide Web." },
    { id: "ict-3", question: "Which is a search engine?", options: ["Facebook", "Google", "WhatsApp", "Word"], correctAnswer: 1, explanation: "Google is a search engine used to find information online." },
    { id: "ict-4", question: "What is a password used for?", options: ["Speed up computer", "Protect accounts", "Connect to internet", "Download files"], correctAnswer: 1, explanation: "Passwords protect your accounts from unauthorized access." },
    { id: "ict-5", question: "What is email?", options: ["Electronic mail", "Express mail", "Emergency mail", "Encoded mail"], correctAnswer: 0, explanation: "Email stands for electronic mail." },
  ],

  // ============ HISTORY ============
  history: [
    { id: "his-1", question: "Who was the first President of Kenya?", options: ["Daniel arap Moi", "Jomo Kenyatta", "Mwai Kibaki", "Uhuru Kenyatta"], correctAnswer: 1, explanation: "Jomo Kenyatta was Kenya's first President (1964–1978)." },
    { id: "his-2", question: "What does the acronym 'AU' stand for?", options: ["American Union", "African Union", "Asian Union", "Atlantic Union"], correctAnswer: 1, explanation: "AU = African Union, an organization of African nations." },
    { id: "his-3", question: "The Berlin Conference of 1884-85 was about:", options: ["World War I", "Partitioning of Africa", "African independence", "Trade agreements"], correctAnswer: 1, explanation: "European powers divided Africa at the Berlin Conference." },
    { id: "his-4", question: "Who led the Mau Mau uprising?", options: ["Tom Mboya", "Dedan Kimathi", "Oginga Odinga", "Ronald Ngala"], correctAnswer: 1, explanation: "Dedan Kimathi was a key leader of the Mau Mau movement." },
    { id: "his-5", question: "When was the Kenya Constitution promulgated?", options: ["2005", "2008", "2010", "2013"], correctAnswer: 2, explanation: "The new Kenya Constitution was promulgated on August 27, 2010." },
  ],

  // ============ GEOGRAPHY ============
  geography: [
    { id: "geo-1", question: "Mt. Kenya is the ___ highest mountain in Africa.", options: ["1st", "2nd", "3rd", "4th"], correctAnswer: 1, explanation: "Mt. Kenya (5,199m) is the second highest after Kilimanjaro." },
    { id: "geo-2", question: "What is the Great Rift Valley?", options: ["A river", "A geological trench", "A mountain range", "A desert"], correctAnswer: 1, explanation: "The Great Rift Valley is a geological trench running through East Africa." },
    { id: "geo-3", question: "Which ocean borders Kenya to the east?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correctAnswer: 2, explanation: "The Indian Ocean borders Kenya's east coast." },
    { id: "geo-4", question: "What causes earthquakes?", options: ["Wind", "Rain", "Tectonic plate movement", "Volcanoes only"], correctAnswer: 2, explanation: "Earthquakes are caused by movement of tectonic plates." },
    { id: "geo-5", question: "What is climate?", options: ["Today's weather", "Average weather over a long period", "Temperature only", "Rainfall only"], correctAnswer: 1, explanation: "Climate is the average weather conditions over a long period." },
  ],

  // ============ RELIGIOUS EDUCATION ============
  "religious-ed": [
    { id: "re-1", question: "How many books are in the Bible?", options: ["39", "46", "66", "73"], correctAnswer: 2, explanation: "The Protestant Bible has 66 books (39 OT + 27 NT)." },
    { id: "re-2", question: "What is the Golden Rule?", options: ["Be wealthy", "Treat others as you want to be treated", "Follow all rules", "Obey authority"], correctAnswer: 1, explanation: "The Golden Rule: treat others the way you want to be treated." },
    { id: "re-3", question: "Which is one of the Five Pillars of Islam?", options: ["Baptism", "Prayer (Salah)", "Sabbath", "Communion"], correctAnswer: 1, explanation: "Salah (Prayer) is one of the Five Pillars of Islam." },
    { id: "re-4", question: "What is morality?", options: ["Being rich", "Knowing right from wrong", "Following trends", "Being popular"], correctAnswer: 1, explanation: "Morality is about understanding right and wrong behavior." },
    { id: "re-5", question: "What is the meaning of 'compassion'?", options: ["Being brave", "Feeling concern for others' suffering", "Being smart", "Being strict"], correctAnswer: 1, explanation: "Compassion is caring about others' suffering and wanting to help." },
  ],

  // ============ COMMUNITY SERVICE LEARNING ============
  csl: [
    { id: "csl-1", question: "What is community service?", options: ["Paid work", "Voluntary work to help others", "School homework", "Government job"], correctAnswer: 1, explanation: "Community service is voluntary work done to help the community." },
    { id: "csl-2", question: "Why is teamwork important?", options: ["It's not important", "People can achieve more together", "It's easier to be lazy", "Only leaders matter"], correctAnswer: 1, explanation: "Teamwork allows people to achieve more than working alone." },
    { id: "csl-3", question: "What is empathy?", options: ["Ignoring others", "Understanding others' feelings", "Being selfish", "Being angry"], correctAnswer: 1, explanation: "Empathy is the ability to understand and share others' feelings." },
    { id: "csl-4", question: "What is environmental conservation?", options: ["Cutting trees", "Protecting the environment", "Building factories", "Mining"], correctAnswer: 1, explanation: "Conservation means protecting and preserving the natural environment." },
    { id: "csl-5", question: "Which is a civic responsibility?", options: ["Watching TV", "Voting", "Sleeping", "Gaming"], correctAnswer: 1, explanation: "Voting is a civic responsibility in a democracy." },
  ],

  // ============ SPORTS SCIENCE ============
  "sports-science": [
    { id: "sps-1", question: "What is the function of the skeletal system in sports?", options: ["Digestion", "Support and movement", "Breathing", "Thinking"], correctAnswer: 1, explanation: "The skeletal system provides support, protection, and enables movement." },
    { id: "sps-2", question: "What is aerobic exercise?", options: ["No breathing needed", "Uses oxygen for energy", "Only stretching", "Sleeping well"], correctAnswer: 1, explanation: "Aerobic exercise uses oxygen to generate energy (e.g., running, swimming)." },
    { id: "sps-3", question: "What is a sprain?", options: ["Broken bone", "Stretched or torn ligament", "Muscle cramp", "Skin cut"], correctAnswer: 1, explanation: "A sprain is when a ligament is stretched or torn." },
    { id: "sps-4", question: "How many minutes should you exercise daily?", options: ["10", "20", "30-60", "120"], correctAnswer: 2, explanation: "Health experts recommend 30-60 minutes of daily exercise." },
    { id: "sps-5", question: "What does BMI stand for?", options: ["Body Mass Index", "Basic Movement Indicator", "Blood Measurement Index", "Bone Muscle Intensity"], correctAnswer: 0, explanation: "BMI = Body Mass Index, a measure of body fat based on height and weight." },
  ],

  // ============ FINE ART ============
  "fine-art": [
    { id: "fa-1", question: "What is a 'still life' painting?", options: ["A portrait", "Objects that don't move", "A landscape", "An action scene"], correctAnswer: 1, explanation: "Still life depicts inanimate objects like fruit, flowers, etc." },
    { id: "fa-2", question: "What are complementary colors?", options: ["Same colors", "Colors opposite on the color wheel", "Dark colors", "Light colors"], correctAnswer: 1, explanation: "Complementary colors are opposite each other on the color wheel." },
    { id: "fa-3", question: "What is 'perspective' in drawing?", options: ["Color mixing", "Creating depth on a flat surface", "Using a ruler", "Erasing mistakes"], correctAnswer: 1, explanation: "Perspective creates the illusion of depth and distance." },
    { id: "fa-4", question: "What is a mosaic?", options: ["A painting style", "Art made from small pieces", "A type of sculpture", "A drawing tool"], correctAnswer: 1, explanation: "A mosaic is art made from small pieces of colored material." },
    { id: "fa-5", question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Leonardo da Vinci", "Pablo Picasso", "Van Gogh"], correctAnswer: 1, explanation: "Leonardo da Vinci painted the Mona Lisa." },
  ],

  // ============ MUSIC ============
  music: [
    { id: "mus-1", question: "How many notes are in a musical scale?", options: ["5", "7", "8", "12"], correctAnswer: 2, explanation: "A standard musical scale has 8 notes (do-re-mi-fa-sol-la-ti-do)." },
    { id: "mus-2", question: "What is tempo?", options: ["Volume", "Speed of music", "Pitch", "Rhythm"], correctAnswer: 1, explanation: "Tempo is the speed at which music is played." },
    { id: "mus-3", question: "Which is a percussion instrument?", options: ["Guitar", "Flute", "Drum", "Violin"], correctAnswer: 2, explanation: "Drums are percussion instruments — played by hitting." },
    { id: "mus-4", question: "What does 'forte' mean in music?", options: ["Soft", "Loud", "Fast", "Slow"], correctAnswer: 1, explanation: "Forte (f) means loud in music notation." },
    { id: "mus-5", question: "What is the Kenya national anthem's first line?", options: ["God save Kenya", "Ee Mungu nguvu yetu", "Kenya our homeland", "Arise, O compatriots"], correctAnswer: 1, explanation: "The Kenyan national anthem begins with 'Ee Mungu nguvu yetu'." },
  ],
};

// Aliases for subjects with different IDs in different grade groups
const aliases: Record<string, string> = {
  "pe-advanced": "pe",
  "health-fitness": "sports-science",
  "anatomy": "biology",
  "sports-mgmt": "business",
  "theatre-film": "creative-arts",
  "dance": "pe",
  "creative-writing": "literature",
};

export function getQuestionsForSubject(subjectId: string): Question[] {
  return questionBank[subjectId] || questionBank[aliases[subjectId] || ""] || [];
}

export function hasQuestions(subjectId: string): boolean {
  return getQuestionsForSubject(subjectId).length > 0;
}

export default questionBank;
