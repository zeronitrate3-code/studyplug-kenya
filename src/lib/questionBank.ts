import type { Question } from "./mockData";
import { extraQuestions } from "./questionBankExtra";

// Large question bank — exams serve questions sequentially in declared order.
// After each attempt the cursor advances so students see NEW questions next time.
const baseBank: Record<string, Question[]> = {
  // ============ MATHEMATICS ============
  mathematics: [
    { id: "math-1", question: "What is 1/2 + 1/4?", options: ["1/2", "3/4", "1/3", "2/3"], correctAnswer: 1, explanation: "1/2 = 2/4, so 2/4 + 1/4 = 3/4." },
    { id: "math-2", question: "Convert 0.75 to a fraction.", options: ["3/5", "7/10", "3/4", "4/5"], correctAnswer: 2, explanation: "0.75 = 75/100 = 3/4." },
    { id: "math-3", question: "What is 3/5 × 10?", options: ["5", "6", "7", "8"], correctAnswer: 1, explanation: "3/5 × 10 = 30/5 = 6." },
    { id: "math-4", question: "Solve: 2x + 6 = 16", options: ["3", "4", "5", "6"], correctAnswer: 2, explanation: "2x = 10, x = 5." },
    { id: "math-5", question: "Area of a rectangle 8cm × 5cm?", options: ["13 cm²", "26 cm²", "40 cm²", "80 cm²"], correctAnswer: 2, explanation: "Area = l × w = 40 cm²." },
    { id: "math-6", question: "What is 15% of 200?", options: ["15", "25", "30", "35"], correctAnswer: 2, explanation: "15/100 × 200 = 30." },
    { id: "math-7", question: "Square root of 144?", options: ["10", "11", "12", "13"], correctAnswer: 2, explanation: "12 × 12 = 144." },
    { id: "math-8", question: "What is 7² + 3²?", options: ["52", "58", "49", "62"], correctAnswer: 1, explanation: "49 + 9 = 58." },
    { id: "math-9", question: "Perimeter of a square side 9cm?", options: ["18", "27", "36", "81"], correctAnswer: 2, explanation: "4 × 9 = 36 cm." },
    { id: "math-10", question: "Convert 3/4 to a decimal.", options: ["0.34", "0.75", "0.43", "0.5"], correctAnswer: 1, explanation: "3 ÷ 4 = 0.75." },
    { id: "math-11", question: "Solve: 5(x - 2) = 25", options: ["5", "6", "7", "8"], correctAnswer: 2, explanation: "x - 2 = 5, so x = 7." },
    { id: "math-12", question: "Angles in a triangle add to?", options: ["90°", "180°", "270°", "360°"], correctAnswer: 1, explanation: "Triangle angles always sum to 180°." },
    { id: "math-13", question: "Volume of a cube side 4cm?", options: ["16", "32", "64", "128"], correctAnswer: 2, explanation: "4³ = 64 cm³." },
    { id: "math-14", question: "What is the LCM of 4 and 6?", options: ["10", "12", "18", "24"], correctAnswer: 1, explanation: "Lowest common multiple is 12." },
    { id: "math-15", question: "What is the HCF of 12 and 18?", options: ["2", "3", "6", "9"], correctAnswer: 2, explanation: "Highest common factor of 12 and 18 is 6." },
    { id: "math-16", question: "Simplify: 8/12", options: ["1/2", "2/3", "3/4", "4/5"], correctAnswer: 1, explanation: "8 ÷ 4 = 2; 12 ÷ 4 = 3 → 2/3." },
    { id: "math-17", question: "Circumference of circle radius 7 (π=22/7)?", options: ["22", "33", "44", "55"], correctAnswer: 2, explanation: "2πr = 2 × 22/7 × 7 = 44." },
    { id: "math-18", question: "What is 2⁵?", options: ["10", "16", "25", "32"], correctAnswer: 3, explanation: "2×2×2×2×2 = 32." },
    { id: "math-19", question: "Average of 10, 20, 30?", options: ["15", "20", "25", "30"], correctAnswer: 1, explanation: "(10+20+30)/3 = 20." },
    { id: "math-20", question: "Solve: 3x = 27", options: ["6", "8", "9", "10"], correctAnswer: 2, explanation: "x = 27/3 = 9." },
  ],

  // ============ ENGLISH ============
  english: [
    { id: "eng-1", question: "Which word is a noun?", options: ["Run", "Beautiful", "Happiness", "Quickly"], correctAnswer: 2, explanation: "Happiness names a feeling — it's a noun." },
    { id: "eng-2", question: "Choose the correct sentence:", options: ["She don't like it.", "She doesn't likes it.", "She doesn't like it.", "She not like it."], correctAnswer: 2, explanation: "'Doesn't' takes the base verb." },
    { id: "eng-3", question: "Synonym of 'happy'?", options: ["Sad", "Joyful", "Angry", "Tired"], correctAnswer: 1, explanation: "Joyful = happy." },
    { id: "eng-4", question: "Identify the verb: 'The cat slept on the mat.'", options: ["cat", "slept", "on", "mat"], correctAnswer: 1, explanation: "'Slept' is the action." },
    { id: "eng-5", question: "Which is a compound sentence?", options: ["I went home.", "I went home, and she stayed.", "Going home.", "The big red car."], correctAnswer: 1, explanation: "Two clauses joined by 'and'." },
    { id: "eng-6", question: "Antonym of 'brave'?", options: ["Bold", "Cowardly", "Strong", "Quick"], correctAnswer: 1, explanation: "Brave ↔ cowardly." },
    { id: "eng-7", question: "Which is an adverb?", options: ["Fast", "Quickly", "Tall", "Red"], correctAnswer: 1, explanation: "Quickly describes how — it's an adverb." },
    { id: "eng-8", question: "Plural of 'child'?", options: ["Childs", "Childen", "Children", "Childes"], correctAnswer: 2, explanation: "Irregular plural: children." },
    { id: "eng-9", question: "Past tense of 'go'?", options: ["Goed", "Went", "Gone", "Going"], correctAnswer: 1, explanation: "Simple past of 'go' is 'went'." },
    { id: "eng-10", question: "Which is a preposition?", options: ["Under", "Run", "Big", "Happy"], correctAnswer: 0, explanation: "'Under' shows position — preposition." },
    { id: "eng-11", question: "Choose correct article: '___ honest man'", options: ["A", "An", "The", "No article"], correctAnswer: 1, explanation: "'Honest' begins with a vowel sound → 'an'." },
    { id: "eng-12", question: "Which is a simile?", options: ["She is a star.", "She runs like the wind.", "Time flies.", "The sun smiled."], correctAnswer: 1, explanation: "Simile uses 'like' or 'as'." },
    { id: "eng-13", question: "Identify the subject: 'The boys are playing.'", options: ["The", "boys", "are", "playing"], correctAnswer: 1, explanation: "'Boys' is the subject." },
    { id: "eng-14", question: "Meaning of 'punctual'?", options: ["Late", "On time", "Slow", "Quick"], correctAnswer: 1, explanation: "Punctual = on time." },
    { id: "eng-15", question: "Which is correctly punctuated?", options: ["where are you", "Where are you?", "where are you.", "Where are you!"], correctAnswer: 1, explanation: "Questions end with '?' and start capital." },
    { id: "eng-16", question: "Pronoun in: 'They went home.'", options: ["They", "went", "home", "none"], correctAnswer: 0, explanation: "'They' is the pronoun." },
    { id: "eng-17", question: "Opposite of 'expand'?", options: ["Grow", "Shrink", "Stretch", "Build"], correctAnswer: 1, explanation: "Expand ↔ shrink." },
    { id: "eng-18", question: "Correct spelling:", options: ["Recieve", "Receive", "Receeve", "Receiv"], correctAnswer: 1, explanation: "'i before e except after c'." },
    { id: "eng-19", question: "Which is a conjunction?", options: ["But", "Tall", "Run", "Slowly"], correctAnswer: 0, explanation: "'But' joins clauses — conjunction." },
    { id: "eng-20", question: "Meaning of 'generous'?", options: ["Greedy", "Willing to give", "Angry", "Shy"], correctAnswer: 1, explanation: "Generous = willing to share/give." },
  ],

  // ============ KISWAHILI ============
  kiswahili: [
    { id: "kis-1", question: "Neno 'Uhuru' lina maana gani?", options: ["Amani", "Freedom", "Nguvu", "Umoja"], correctAnswer: 1, explanation: "Uhuru = freedom." },
    { id: "kis-2", question: "Wingi wa 'mtoto'?", options: ["Watoto", "Mitoto", "Matoto", "Vitoto"], correctAnswer: 0, explanation: "mtoto → watoto." },
    { id: "kis-3", question: "Sentensi sahihi:", options: ["Mimi kupenda chakula.", "Mimi ninapenda chakula.", "Mimi penda chakula.", "Ninapenda mimi chakula."], correctAnswer: 1, explanation: "Mimi ninapenda — sahihi." },
    { id: "kis-4", question: "'Shule' ni aina gani?", options: ["Kitenzi", "Kivumishi", "Nomino", "Kielezi"], correctAnswer: 2, explanation: "Shule ni nomino." },
    { id: "kis-5", question: "Kinyume cha 'kubwa'?", options: ["Kidogo", "Ndefu", "Fupi", "Nyembamba"], correctAnswer: 0, explanation: "Kubwa ↔ kidogo." },
    { id: "kis-6", question: "Wingi wa 'kitabu'?", options: ["Makitabu", "Vitabu", "Kitabuni", "Wakitabu"], correctAnswer: 1, explanation: "KI-VI: kitabu → vitabu." },
    { id: "kis-7", question: "Methali: 'Haraka haraka ___'", options: ["haina baraka", "ina nguvu", "ni nzuri", "haijui"], correctAnswer: 0, explanation: "Haraka haraka haina baraka." },
    { id: "kis-8", question: "Rangi ya 'nyekundu' kwa Kiingereza?", options: ["Blue", "Red", "Green", "Black"], correctAnswer: 1, explanation: "Nyekundu = red." },
    { id: "kis-9", question: "Kisawe cha 'furaha'?", options: ["huzuni", "raha", "hasira", "uchovu"], correctAnswer: 1, explanation: "Furaha = raha." },
    { id: "kis-10", question: "Idadi ya herufi katika alfabeti ya Kiswahili?", options: ["22", "24", "26", "28"], correctAnswer: 1, explanation: "Kiswahili ina herufi 24." },
    { id: "kis-11", question: "Wakati uliopita wa 'kula':", options: ["nakula", "nilikula", "nitakula", "ninakula"], correctAnswer: 1, explanation: "Nilikula — uliopita." },
    { id: "kis-12", question: "'Walimu' ni wingi wa?", options: ["mwalimu", "mwanafunzi", "mtoto", "mwanamke"], correctAnswer: 0, explanation: "Mwalimu → walimu." },
    { id: "kis-13", question: "Maana ya 'rafiki'?", options: ["enemy", "friend", "brother", "father"], correctAnswer: 1, explanation: "Rafiki = friend." },
    { id: "kis-14", question: "Chagua kivumishi:", options: ["kimbia", "mzuri", "haraka", "shule"], correctAnswer: 1, explanation: "Mzuri ni kivumishi." },
    { id: "kis-15", question: "Siku ya kwanza ya juma:", options: ["Jumatatu", "Jumapili", "Jumamosi", "Ijumaa"], correctAnswer: 1, explanation: "Jumapili ni siku ya kwanza ya juma." },
  ],

  // ============ CHEMISTRY ============
  chemistry: [
    { id: "chem-1", question: "Chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], correctAnswer: 0, explanation: "Water = H₂O." },
    { id: "chem-2", question: "pH of neutral solution?", options: ["0", "7", "10", "14"], correctAnswer: 1, explanation: "pH 7 is neutral." },
    { id: "chem-3", question: "Gas from acid + metal?", options: ["Oxygen", "CO2", "Hydrogen", "Nitrogen"], correctAnswer: 2, explanation: "Produces hydrogen gas." },
    { id: "chem-4", question: "Atomic number of Carbon?", options: ["4", "6", "8", "12"], correctAnswer: 1, explanation: "Carbon = 6." },
    { id: "chem-5", question: "Which is a mixture?", options: ["Water", "Salt", "Air", "Iron"], correctAnswer: 2, explanation: "Air is a mixture of gases." },
    { id: "chem-6", question: "Symbol for Sodium?", options: ["S", "So", "Na", "N"], correctAnswer: 2, explanation: "Sodium = Na (Latin: natrium)." },
    { id: "chem-7", question: "Most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Nitrogen", "Argon", "CO₂"], correctAnswer: 1, explanation: "~78% nitrogen." },
    { id: "chem-8", question: "Acids turn litmus...?", options: ["Blue", "Red", "Green", "Yellow"], correctAnswer: 1, explanation: "Acids turn blue litmus red." },
    { id: "chem-9", question: "State of matter with fixed volume but no shape?", options: ["Solid", "Liquid", "Gas", "Plasma"], correctAnswer: 1, explanation: "Liquid." },
    { id: "chem-10", question: "Common name for NaCl?", options: ["Sugar", "Table salt", "Baking soda", "Chalk"], correctAnswer: 1, explanation: "Sodium chloride = table salt." },
    { id: "chem-11", question: "Number of electrons in a neutral oxygen atom?", options: ["6", "7", "8", "10"], correctAnswer: 2, explanation: "Atomic number 8 → 8 electrons." },
    { id: "chem-12", question: "What is an element?", options: ["Two atoms joined", "Pure substance of one type of atom", "A mixture", "A solution"], correctAnswer: 1, explanation: "Element = one kind of atom." },
    { id: "chem-13", question: "Gas needed for combustion?", options: ["Nitrogen", "Oxygen", "Hydrogen", "Argon"], correctAnswer: 1, explanation: "Combustion needs oxygen." },
    { id: "chem-14", question: "Process: liquid → gas?", options: ["Freezing", "Melting", "Evaporation", "Condensation"], correctAnswer: 2, explanation: "Evaporation." },
    { id: "chem-15", question: "Formula of carbon dioxide?", options: ["CO", "CO2", "C2O", "CO3"], correctAnswer: 1, explanation: "CO₂." },
  ],

  // ============ BIOLOGY ============
  biology: [
    { id: "bio-1", question: "Basic unit of life?", options: ["Atom", "Molecule", "Cell", "Organ"], correctAnswer: 2, explanation: "Cell." },
    { id: "bio-2", question: "Gas plants absorb in photosynthesis?", options: ["O₂", "N₂", "CO₂", "H₂"], correctAnswer: 2, explanation: "CO₂ in, O₂ out." },
    { id: "bio-3", question: "DNA stands for?", options: ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Dynamic Nuclear Acid", "Dual Nucleotide Acid"], correctAnswer: 0, explanation: "Deoxyribonucleic Acid." },
    { id: "bio-4", question: "Organ that pumps blood?", options: ["Liver", "Lungs", "Heart", "Brain"], correctAnswer: 2, explanation: "Heart." },
    { id: "bio-5", question: "Largest human organ?", options: ["Liver", "Brain", "Skin", "Heart"], correctAnswer: 2, explanation: "Skin." },
    { id: "bio-6", question: "Green pigment in plants?", options: ["Hemoglobin", "Chlorophyll", "Melanin", "Carotene"], correctAnswer: 1, explanation: "Chlorophyll." },
    { id: "bio-7", question: "How many chambers in human heart?", options: ["2", "3", "4", "5"], correctAnswer: 2, explanation: "Four chambers." },
    { id: "bio-8", question: "Part of plant that absorbs water?", options: ["Leaves", "Stem", "Roots", "Flowers"], correctAnswer: 2, explanation: "Roots." },
    { id: "bio-9", question: "Process of cell division?", options: ["Osmosis", "Mitosis", "Diffusion", "Respiration"], correctAnswer: 1, explanation: "Mitosis." },
    { id: "bio-10", question: "Organ for breathing?", options: ["Heart", "Lungs", "Kidney", "Liver"], correctAnswer: 1, explanation: "Lungs." },
    { id: "bio-11", question: "Vitamin from sunlight?", options: ["A", "B", "C", "D"], correctAnswer: 3, explanation: "Vitamin D." },
    { id: "bio-12", question: "Vertebrates have a...?", options: ["Shell", "Backbone", "Exoskeleton", "Wings"], correctAnswer: 1, explanation: "Backbone (spine)." },
    { id: "bio-13", question: "Reproductive part of flower?", options: ["Root", "Stem", "Stamen", "Leaf"], correctAnswer: 2, explanation: "Stamen (male part)." },
    { id: "bio-14", question: "Carries oxygen in blood?", options: ["White cells", "Platelets", "Red cells", "Plasma"], correctAnswer: 2, explanation: "Red blood cells (hemoglobin)." },
    { id: "bio-15", question: "Filters waste from blood?", options: ["Liver", "Kidney", "Heart", "Spleen"], correctAnswer: 1, explanation: "Kidneys." },
  ],

  // ============ PHYSICS ============
  physics: [
    { id: "phy-1", question: "SI unit of force?", options: ["Joule", "Newton", "Watt", "Pascal"], correctAnswer: 1, explanation: "Newton (N)." },
    { id: "phy-2", question: "Speed of light?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], correctAnswer: 1, explanation: "≈ 3×10⁸ m/s." },
    { id: "phy-3", question: "'Action = reaction' is which law?", options: ["1st", "2nd", "3rd", "Gravity"], correctAnswer: 2, explanation: "Newton's 3rd Law." },
    { id: "phy-4", question: "Unit of resistance?", options: ["Ampere", "Volt", "Ohm", "Watt"], correctAnswer: 2, explanation: "Ohm (Ω)." },
    { id: "phy-5", question: "Moving car has which energy?", options: ["Potential", "Kinetic", "Chemical", "Thermal"], correctAnswer: 1, explanation: "Kinetic." },
    { id: "phy-6", question: "Unit of electric current?", options: ["Volt", "Ampere", "Ohm", "Watt"], correctAnswer: 1, explanation: "Ampere (A)." },
    { id: "phy-7", question: "Acceleration due to gravity ≈?", options: ["5.8 m/s²", "9.8 m/s²", "12 m/s²", "20 m/s²"], correctAnswer: 1, explanation: "9.8 m/s² on Earth." },
    { id: "phy-8", question: "Energy of a stretched spring?", options: ["Kinetic", "Potential", "Thermal", "Sound"], correctAnswer: 1, explanation: "Elastic potential energy." },
    { id: "phy-9", question: "What does a thermometer measure?", options: ["Mass", "Time", "Temperature", "Pressure"], correctAnswer: 2, explanation: "Temperature." },
    { id: "phy-10", question: "Light travels fastest in?", options: ["Water", "Glass", "Vacuum", "Air"], correctAnswer: 2, explanation: "Vacuum." },
    { id: "phy-11", question: "Sound cannot travel through?", options: ["Air", "Water", "Steel", "Vacuum"], correctAnswer: 3, explanation: "Sound needs a medium." },
    { id: "phy-12", question: "Density formula?", options: ["m × v", "m ÷ v", "v ÷ m", "m + v"], correctAnswer: 1, explanation: "Density = mass/volume." },
    { id: "phy-13", question: "Unit of power?", options: ["Joule", "Newton", "Watt", "Ohm"], correctAnswer: 2, explanation: "Watt (W)." },
    { id: "phy-14", question: "Reflection of light occurs on?", options: ["Rough wood", "Mirror", "Cloth", "Sand"], correctAnswer: 1, explanation: "Smooth mirror surface." },
    { id: "phy-15", question: "Magnets attract which metal?", options: ["Copper", "Iron", "Aluminium", "Gold"], correctAnswer: 1, explanation: "Iron (and nickel/cobalt)." },
  ],

  // ============ GENERAL SCIENCE ============
  "general-science": [
    { id: "gs-1", question: "Boiling point of water (°C)?", options: ["90", "95", "100", "110"], correctAnswer: 2, explanation: "100°C at sea level." },
    { id: "gs-2", question: "Closest planet to Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], correctAnswer: 1, explanation: "Mercury." },
    { id: "gs-3", question: "Largest planet?", options: ["Saturn", "Neptune", "Jupiter", "Uranus"], correctAnswer: 2, explanation: "Jupiter." },
    { id: "gs-4", question: "Rock formed from cooled lava?", options: ["Sedimentary", "Metamorphic", "Igneous", "Organic"], correctAnswer: 2, explanation: "Igneous." },
    { id: "gs-5", question: "Bones in adult body?", options: ["186", "206", "226", "256"], correctAnswer: 1, explanation: "206 bones." },
    { id: "gs-6", question: "Freezing point of water (°C)?", options: ["-10", "0", "10", "32"], correctAnswer: 1, explanation: "0°C." },
    { id: "gs-7", question: "How many planets in our solar system?", options: ["7", "8", "9", "10"], correctAnswer: 1, explanation: "8 planets." },
    { id: "gs-8", question: "Earth's natural satellite?", options: ["Sun", "Moon", "Mars", "Star"], correctAnswer: 1, explanation: "The Moon." },
    { id: "gs-9", question: "Source of solar energy?", options: ["Wind", "Water", "Sun", "Coal"], correctAnswer: 2, explanation: "The Sun." },
    { id: "gs-10", question: "Layer of Earth we live on?", options: ["Core", "Mantle", "Crust", "Atmosphere"], correctAnswer: 2, explanation: "Crust." },
    { id: "gs-11", question: "Animal that lays eggs and gives milk?", options: ["Dog", "Platypus", "Cat", "Horse"], correctAnswer: 1, explanation: "Platypus is a monotreme." },
    { id: "gs-12", question: "Which sense uses the tongue?", options: ["Sight", "Smell", "Taste", "Hearing"], correctAnswer: 2, explanation: "Taste." },
    { id: "gs-13", question: "Hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Glass"], correctAnswer: 2, explanation: "Diamond." },
    { id: "gs-14", question: "Earth's main source of light?", options: ["Moon", "Stars", "Sun", "Lightning"], correctAnswer: 2, explanation: "The Sun." },
    { id: "gs-15", question: "Total continents?", options: ["5", "6", "7", "8"], correctAnswer: 2, explanation: "Seven continents." },
  ],

  // ============ COMPUTER STUDIES ============
  "computer-studies": [
    { id: "cs-1", question: "CPU stands for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correctAnswer: 0, explanation: "Central Processing Unit." },
    { id: "cs-2", question: "Input device?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correctAnswer: 2, explanation: "Keyboard." },
    { id: "cs-3", question: "RAM stands for?", options: ["Read Access Memory", "Random Access Memory", "Rapid Access Memory", "Ready Access Module"], correctAnswer: 1, explanation: "Random Access Memory." },
    { id: "cs-4", question: "Web page extension?", options: [".doc", ".html", ".mp3", ".exe"], correctAnswer: 1, explanation: ".html." },
    { id: "cs-5", question: "Binary of 5?", options: ["100", "101", "110", "111"], correctAnswer: 1, explanation: "5 = 101." },
    { id: "cs-6", question: "Output device?", options: ["Mouse", "Scanner", "Monitor", "Keyboard"], correctAnswer: 2, explanation: "Monitor displays output." },
    { id: "cs-7", question: "Permanent storage?", options: ["RAM", "Cache", "Hard disk", "Register"], correctAnswer: 2, explanation: "Hard disk." },
    { id: "cs-8", question: "Smallest unit of data?", options: ["Byte", "Bit", "KB", "MB"], correctAnswer: 1, explanation: "A bit (0 or 1)." },
    { id: "cs-9", question: "Software for browsing the web?", options: ["Word", "Excel", "Browser", "Notepad"], correctAnswer: 2, explanation: "Web browser." },
    { id: "cs-10", question: "Brain of the computer?", options: ["Monitor", "CPU", "Keyboard", "RAM"], correctAnswer: 1, explanation: "CPU." },
    { id: "cs-11", question: "1 byte = how many bits?", options: ["2", "4", "8", "16"], correctAnswer: 2, explanation: "8 bits = 1 byte." },
    { id: "cs-12", question: "Which is an operating system?", options: ["Word", "Windows", "Chrome", "Photoshop"], correctAnswer: 1, explanation: "Windows is an OS." },
    { id: "cs-13", question: "Malware that copies itself?", options: ["Trojan", "Virus", "Spyware", "Adware"], correctAnswer: 1, explanation: "Virus self-replicates." },
    { id: "cs-14", question: "Shortcut to copy?", options: ["Ctrl+V", "Ctrl+C", "Ctrl+X", "Ctrl+Z"], correctAnswer: 1, explanation: "Ctrl+C copies." },
    { id: "cs-15", question: "Programming language for web styling?", options: ["HTML", "CSS", "Python", "Java"], correctAnswer: 1, explanation: "CSS styles web pages." },
  ],

  // ============ LITERATURE ============
  literature: [
    { id: "lit-1", question: "Author of 'Things Fall Apart'?", options: ["Wole Soyinka", "Chinua Achebe", "Ngugi wa Thiong'o", "Chimamanda Adichie"], correctAnswer: 1, explanation: "Chinua Achebe (1958)." },
    { id: "lit-2", question: "What is a stanza?", options: ["A line", "A group of lines", "A rhyme", "A title"], correctAnswer: 1, explanation: "Group of lines." },
    { id: "lit-3", question: "'Wind whispered through trees' is...?", options: ["Simile", "Metaphor", "Personification", "Alliteration"], correctAnswer: 2, explanation: "Personification." },
    { id: "lit-4", question: "Main character?", options: ["Antagonist", "Narrator", "Protagonist", "Author"], correctAnswer: 2, explanation: "Protagonist." },
    { id: "lit-5", question: "Story within a story?", options: ["Flashback", "Frame narrative", "Foreshadowing", "Plot twist"], correctAnswer: 1, explanation: "Frame narrative." },
    { id: "lit-6", question: "Repetition of initial consonant sounds?", options: ["Rhyme", "Alliteration", "Onomatopoeia", "Hyperbole"], correctAnswer: 1, explanation: "Alliteration." },
    { id: "lit-7", question: "Author of 'Weep Not, Child'?", options: ["Soyinka", "Ngugi wa Thiong'o", "Achebe", "Okot p'Bitek"], correctAnswer: 1, explanation: "Ngugi wa Thiong'o." },
    { id: "lit-8", question: "Exaggeration for effect?", options: ["Simile", "Hyperbole", "Metaphor", "Symbol"], correctAnswer: 1, explanation: "Hyperbole." },
    { id: "lit-9", question: "Time and place of a story?", options: ["Plot", "Setting", "Theme", "Mood"], correctAnswer: 1, explanation: "Setting." },
    { id: "lit-10", question: "Underlying message of a work?", options: ["Plot", "Theme", "Tone", "Setting"], correctAnswer: 1, explanation: "Theme." },
    { id: "lit-11", question: "A poem of 14 lines?", options: ["Haiku", "Ode", "Sonnet", "Ballad"], correctAnswer: 2, explanation: "Sonnet has 14 lines." },
    { id: "lit-12", question: "Words that imitate sounds?", options: ["Metaphor", "Onomatopoeia", "Irony", "Pun"], correctAnswer: 1, explanation: "Onomatopoeia (e.g., buzz)." },
    { id: "lit-13", question: "Sequence of events in a story?", options: ["Plot", "Theme", "Mood", "Style"], correctAnswer: 0, explanation: "Plot." },
    { id: "lit-14", question: "Opposite outcome to expected?", options: ["Symbolism", "Irony", "Imagery", "Metaphor"], correctAnswer: 1, explanation: "Irony." },
    { id: "lit-15", question: "Conversation between characters?", options: ["Monologue", "Dialogue", "Soliloquy", "Narrative"], correctAnswer: 1, explanation: "Dialogue." },
  ],

  // ============ BUSINESS STUDIES ============
  business: [
    { id: "bus-1", question: "Profit = ?", options: ["Total sales", "Income − Expenses", "Total expenses", "Revenue"], correctAnswer: 1, explanation: "Income − Expenses." },
    { id: "bus-2", question: "GDP stands for?", options: ["Gross Domestic Product", "General Domestic Price", "Grand Delivery Price", "Gross Delivery Product"], correctAnswer: 0, explanation: "Gross Domestic Product." },
    { id: "bus-3", question: "Example of a need?", options: ["Smartphone", "Food", "Game", "Jewelry"], correctAnswer: 1, explanation: "Food is a basic need." },
    { id: "bus-4", question: "A budget is?", options: ["A tax", "A spending plan", "A bank account", "A loan"], correctAnswer: 1, explanation: "Spending plan." },
    { id: "bus-5", question: "Who is an entrepreneur?", options: ["Employee", "Starts a business", "Customer", "Supplier"], correctAnswer: 1, explanation: "Starts/runs a business." },
    { id: "bus-6", question: "Money paid to use borrowed money?", options: ["Profit", "Interest", "Tax", "Wage"], correctAnswer: 1, explanation: "Interest." },
    { id: "bus-7", question: "Document showing a sale?", options: ["Receipt", "Cheque", "Will", "Letter"], correctAnswer: 0, explanation: "Receipt." },
    { id: "bus-8", question: "Compulsory payment to government?", options: ["Donation", "Tax", "Tip", "Loan"], correctAnswer: 1, explanation: "Tax." },
    { id: "bus-9", question: "Place where goods are sold?", options: ["Factory", "Market", "Office", "School"], correctAnswer: 1, explanation: "Market." },
    { id: "bus-10", question: "Currency of Kenya?", options: ["Dollar", "Shilling", "Pound", "Euro"], correctAnswer: 1, explanation: "Kenyan Shilling." },
    { id: "bus-11", question: "Demand falls as price...?", options: ["Falls", "Rises", "Stays same", "Disappears"], correctAnswer: 1, explanation: "Law of demand." },
    { id: "bus-12", question: "Business owned by one person?", options: ["Partnership", "Sole proprietorship", "Company", "Cooperative"], correctAnswer: 1, explanation: "Sole proprietorship." },
    { id: "bus-13", question: "Saving is?", options: ["Spending all", "Keeping money for later", "Investing", "Borrowing"], correctAnswer: 1, explanation: "Reserve for future use." },
    { id: "bus-14", question: "Money used to start a business?", options: ["Profit", "Capital", "Loss", "Wage"], correctAnswer: 1, explanation: "Capital." },
    { id: "bus-15", question: "Loss occurs when?", options: ["Income > expenses", "Income = expenses", "Income < expenses", "No sales"], correctAnswer: 2, explanation: "Expenses exceed income." },
  ],

  // ============ SOCIAL STUDIES ============
  "social-studies": [
    { id: "ss-1", question: "Capital of Kenya?", options: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"], correctAnswer: 1, explanation: "Nairobi." },
    { id: "ss-2", question: "Kenya independence year?", options: ["1960", "1963", "1964", "1965"], correctAnswer: 1, explanation: "12 Dec 1963." },
    { id: "ss-3", question: "Counties in Kenya?", options: ["42", "45", "47", "50"], correctAnswer: 2, explanation: "47 counties." },
    { id: "ss-4", question: "Longest river in Africa?", options: ["Congo", "Niger", "Nile", "Zambezi"], correctAnswer: 2, explanation: "Nile (~6,650 km)." },
    { id: "ss-5", question: "Largest lake in Africa?", options: ["Turkana", "Victoria", "Tanganyika", "Malawi"], correctAnswer: 1, explanation: "Lake Victoria." },
    { id: "ss-6", question: "Head of state in Kenya?", options: ["Governor", "Senator", "President", "Speaker"], correctAnswer: 2, explanation: "President." },
    { id: "ss-7", question: "Right to vote = ?", options: ["Suffrage", "Census", "Treaty", "Embassy"], correctAnswer: 0, explanation: "Suffrage." },
    { id: "ss-8", question: "Highest mountain in Kenya?", options: ["Elgon", "Kenya", "Kilimanjaro", "Longonot"], correctAnswer: 1, explanation: "Mt. Kenya." },
    { id: "ss-9", question: "Largest desert in Africa?", options: ["Kalahari", "Sahara", "Namib", "Gobi"], correctAnswer: 1, explanation: "Sahara." },
    { id: "ss-10", question: "Currency of USA?", options: ["Euro", "Dollar", "Yen", "Pound"], correctAnswer: 1, explanation: "US Dollar." },
    { id: "ss-11", question: "Kenya's neighbour to the south?", options: ["Uganda", "Ethiopia", "Tanzania", "Sudan"], correctAnswer: 2, explanation: "Tanzania." },
    { id: "ss-12", question: "Equator passes through Kenya?", options: ["Yes", "No", "Only south", "Only east"], correctAnswer: 0, explanation: "Yes — passes through Kenya." },
    { id: "ss-13", question: "Coastal city in Kenya?", options: ["Nairobi", "Mombasa", "Eldoret", "Kisii"], correctAnswer: 1, explanation: "Mombasa is on the coast." },
    { id: "ss-14", question: "Kenya's national language?", options: ["English", "Kiswahili", "French", "Arabic"], correctAnswer: 1, explanation: "Kiswahili." },
    { id: "ss-15", question: "How often general elections held in Kenya?", options: ["3 yrs", "5 yrs", "7 yrs", "10 yrs"], correctAnswer: 1, explanation: "Every 5 years." },
  ],

  // ============ CREATIVE ARTS ============
  "creative-arts": [
    { id: "ca-1", question: "Three primary colors?", options: ["R/G/B", "R/Y/B", "R/O/P", "Y/G/B"], correctAnswer: 1, explanation: "Red, yellow, blue (art)." },
    { id: "ca-2", question: "A portrait shows?", options: ["Landscape", "A person", "Still life", "Abstract"], correctAnswer: 1, explanation: "A person." },
    { id: "ca-3", question: "Element of art dealing with light/dark?", options: ["Line", "Color", "Value", "Texture"], correctAnswer: 2, explanation: "Value." },
    { id: "ca-4", question: "Nyatiti is a?", options: ["Drum", "String instr.", "Wind instr.", "Keyboard"], correctAnswer: 1, explanation: "Luo string instrument." },
    { id: "ca-5", question: "Symmetry means?", options: ["Random", "Balanced arrangement", "Dark", "Curved"], correctAnswer: 1, explanation: "Balanced/mirror-like." },
    { id: "ca-6", question: "Mixing red + yellow gives?", options: ["Purple", "Orange", "Green", "Brown"], correctAnswer: 1, explanation: "Orange." },
    { id: "ca-7", question: "Sketching tool?", options: ["Brush", "Pencil", "Chisel", "Loom"], correctAnswer: 1, explanation: "Pencil." },
    { id: "ca-8", question: "Sculpture is...?", options: ["2D art", "3D art", "Music", "Dance"], correctAnswer: 1, explanation: "Three-dimensional art." },
    { id: "ca-9", question: "African drum example?", options: ["Tabla", "Djembe", "Sitar", "Erhu"], correctAnswer: 1, explanation: "Djembe (West Africa)." },
    { id: "ca-10", question: "Pattern that repeats?", options: ["Motif", "Tone", "Shade", "Hue"], correctAnswer: 0, explanation: "Motif." },
  ],

  // ============ AGRICULTURE ============
  agriculture: [
    { id: "agri-1", question: "Crop rotation means?", options: ["Crops in water", "Changing crops each season", "Planting in rows", "Using fertilizer"], correctAnswer: 1, explanation: "Different crops in succession." },
    { id: "agri-2", question: "Best soil for farming?", options: ["Sandy", "Clay", "Loam", "Gravel"], correctAnswer: 2, explanation: "Loam — balanced." },
    { id: "agri-3", question: "Photosynthesis is?", options: ["Absorbing water", "Making food with sunlight", "Releasing oxygen only", "Growing roots"], correctAnswer: 1, explanation: "Plants make food from sunlight." },
    { id: "agri-4", question: "Cash crop in Kenya?", options: ["Maize", "Tea", "Beans", "Spinach"], correctAnswer: 1, explanation: "Tea — major export." },
    { id: "agri-5", question: "Irrigation is?", options: ["Removing weeds", "Supplying water to crops", "Harvesting", "Planting"], correctAnswer: 1, explanation: "Artificial water supply." },
    { id: "agri-6", question: "Animal kept for milk?", options: ["Goat", "Cow", "Pig", "Sheep"], correctAnswer: 1, explanation: "Dairy cow." },
    { id: "agri-7", question: "Tool for digging?", options: ["Sickle", "Jembe (hoe)", "Wheelbarrow", "Rake"], correctAnswer: 1, explanation: "Hoe/jembe." },
    { id: "agri-8", question: "Fertilizer adds?", options: ["Pests", "Nutrients", "Diseases", "Weeds"], correctAnswer: 1, explanation: "Nutrients to soil." },
    { id: "agri-9", question: "Process of removing weeds?", options: ["Pruning", "Weeding", "Mulching", "Harvesting"], correctAnswer: 1, explanation: "Weeding." },
    { id: "agri-10", question: "Maize is a?", options: ["Cereal", "Legume", "Tuber", "Fruit"], correctAnswer: 0, explanation: "Cereal crop." },
    { id: "agri-11", question: "Bee product used as food?", options: ["Wax", "Honey", "Pollen only", "Hive"], correctAnswer: 1, explanation: "Honey." },
    { id: "agri-12", question: "Pasture is for?", options: ["Birds", "Grazing animals", "Fish", "Crops only"], correctAnswer: 1, explanation: "Grazing livestock." },
  ],

  // ============ INTEGRATED SCIENCE ============
  "integrated-science": [
    { id: "is-1", question: "States of matter?", options: ["Hot/cold/warm", "Solid/liquid/gas", "Heavy/light/medium", "Big/small/tiny"], correctAnswer: 1, explanation: "Solid, liquid, gas." },
    { id: "is-2", question: "Cause of day & night?", options: ["Moon orbit", "Earth's rotation", "Sun moving", "Clouds"], correctAnswer: 1, explanation: "Earth rotates on its axis." },
    { id: "is-3", question: "White blood cells?", options: ["Carry O₂", "Fight infection", "Clot blood", "Digest food"], correctAnswer: 1, explanation: "Fight infections." },
    { id: "is-4", question: "Formula of table salt?", options: ["NaCl", "H₂O", "CO₂", "KCl"], correctAnswer: 0, explanation: "NaCl." },
    { id: "is-5", question: "Energy from the sun?", options: ["Mechanical", "Nuclear", "Solar", "Chemical"], correctAnswer: 2, explanation: "Solar." },
    { id: "is-6", question: "Water boils at?", options: ["50°C", "100°C", "150°C", "200°C"], correctAnswer: 1, explanation: "100°C." },
    { id: "is-7", question: "Smallest unit of an element?", options: ["Cell", "Atom", "Molecule", "Ion"], correctAnswer: 1, explanation: "Atom." },
    { id: "is-8", question: "Mammals have ___ hearts?", options: ["2", "3", "4-chambered", "5"], correctAnswer: 2, explanation: "Four chambers." },
    { id: "is-9", question: "Object falls due to?", options: ["Wind", "Gravity", "Heat", "Light"], correctAnswer: 1, explanation: "Gravity." },
    { id: "is-10", question: "Plants release at night?", options: ["O₂", "CO₂", "Water", "Sugar"], correctAnswer: 1, explanation: "CO₂ from respiration." },
    { id: "is-11", question: "Conductor of electricity?", options: ["Wood", "Rubber", "Copper", "Plastic"], correctAnswer: 2, explanation: "Copper." },
    { id: "is-12", question: "Earth's only natural satellite?", options: ["Mars", "Sun", "Moon", "Venus"], correctAnswer: 2, explanation: "The Moon." },
  ],

  // ============ PRE-TECHNICAL STUDIES ============
  "pre-technical": [
    { id: "pt-1", question: "Tool to measure length?", options: ["Ruler", "Thermometer", "Scale", "Stopwatch"], correctAnswer: 0, explanation: "Ruler." },
    { id: "pt-2", question: "Good electrical conductor?", options: ["Rubber", "Wood", "Copper", "Glass"], correctAnswer: 2, explanation: "Copper." },
    { id: "pt-3", question: "A circuit is?", options: ["A wire", "Complete path for electricity", "A battery", "A switch"], correctAnswer: 1, explanation: "Complete path." },
    { id: "pt-4", question: "Renewable energy?", options: ["Coal", "Gas", "Solar", "Petroleum"], correctAnswer: 2, explanation: "Solar." },
    { id: "pt-5", question: "A lever helps?", options: ["Make electricity", "Lift loads", "Measure weight", "Store energy"], correctAnswer: 1, explanation: "Simple machine for lifting." },
    { id: "pt-6", question: "PPE in workshop?", options: ["Shorts", "Helmet & goggles", "Sandals", "Shorts only"], correctAnswer: 1, explanation: "Personal protective equipment." },
    { id: "pt-7", question: "Saw is used for?", options: ["Drilling", "Cutting", "Measuring", "Polishing"], correctAnswer: 1, explanation: "Cutting wood/metal." },
    { id: "pt-8", question: "Hammer drives?", options: ["Screws", "Nails", "Bolts", "Pins only"], correctAnswer: 1, explanation: "Drives nails." },
    { id: "pt-9", question: "Source of hydropower?", options: ["Sun", "Wind", "Water", "Coal"], correctAnswer: 2, explanation: "Moving water." },
    { id: "pt-10", question: "Insulator example?", options: ["Iron", "Copper", "Plastic", "Aluminium"], correctAnswer: 2, explanation: "Plastic." },
  ],

  // ============ PE ============
  pe: [
    { id: "pe-1", question: "Players in a soccer team?", options: ["9", "10", "11", "12"], correctAnswer: 2, explanation: "11 players." },
    { id: "pe-2", question: "Warm-up means?", options: ["Warm clothes", "Light exercise before sport", "Hot water", "Resting"], correctAnswer: 1, explanation: "Prepares body." },
    { id: "pe-3", question: "Sport using a shuttlecock?", options: ["Tennis", "Badminton", "Cricket", "Golf"], correctAnswer: 1, explanation: "Badminton." },
    { id: "pe-4", question: "Stamina is?", options: ["Speed", "Sustaining effort", "Flexibility", "Strength"], correctAnswer: 1, explanation: "Endurance." },
    { id: "pe-5", question: "Marathon length?", options: ["21 km", "32 km", "42 km", "50 km"], correctAnswer: 2, explanation: "42.195 km." },
    { id: "pe-6", question: "Sport on a pitch with bat & ball?", options: ["Hockey", "Cricket", "Swimming", "Boxing"], correctAnswer: 1, explanation: "Cricket." },
    { id: "pe-7", question: "Olympic Games held every?", options: ["2 yrs", "3 yrs", "4 yrs", "5 yrs"], correctAnswer: 2, explanation: "Every 4 years." },
    { id: "pe-8", question: "Net sport indoor?", options: ["Volleyball", "Boxing", "Cycling", "Running"], correctAnswer: 0, explanation: "Volleyball." },
    { id: "pe-9", question: "Doing 'press-ups' builds?", options: ["Stamina", "Strength", "Flexibility", "Vision"], correctAnswer: 1, explanation: "Upper-body strength." },
    { id: "pe-10", question: "Long jump is?", options: ["Track event", "Field event", "Water sport", "Combat"], correctAnswer: 1, explanation: "Field event." },
  ],

  // ============ ICT ============
  ict: [
    { id: "ict-1", question: "What is the internet?", options: ["A computer", "Global network of computers", "A program", "A website"], correctAnswer: 1, explanation: "Global network." },
    { id: "ict-2", question: "'www' stands for?", options: ["World Wide Web", "Wide World Web", "Web World Wide", "World Web Wide"], correctAnswer: 0, explanation: "World Wide Web." },
    { id: "ict-3", question: "Search engine?", options: ["Facebook", "Google", "WhatsApp", "Word"], correctAnswer: 1, explanation: "Google." },
    { id: "ict-4", question: "Password protects?", options: ["Speed", "Accounts", "Internet", "Downloads"], correctAnswer: 1, explanation: "Accounts." },
    { id: "ict-5", question: "Email = ?", options: ["Electronic mail", "Express mail", "Emergency mail", "Encoded mail"], correctAnswer: 0, explanation: "Electronic mail." },
    { id: "ict-6", question: "Safe online practice?", options: ["Share password", "Use strong passwords", "Open all links", "Trust strangers"], correctAnswer: 1, explanation: "Use strong passwords." },
    { id: "ict-7", question: "File extension for image?", options: [".doc", ".jpg", ".mp3", ".exe"], correctAnswer: 1, explanation: ".jpg / .png." },
    { id: "ict-8", question: "Cloud storage example?", options: ["Hard disk", "Google Drive", "Floppy", "CD"], correctAnswer: 1, explanation: "Google Drive." },
    { id: "ict-9", question: "Cyberbullying is?", options: ["Good thing", "Harming others online", "A game", "A virus"], correctAnswer: 1, explanation: "Bullying via digital means." },
    { id: "ict-10", question: "Keyboard shortcut to paste?", options: ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+Z"], correctAnswer: 1, explanation: "Ctrl+V." },
  ],

  // ============ HISTORY ============
  history: [
    { id: "his-1", question: "First President of Kenya?", options: ["Moi", "Jomo Kenyatta", "Kibaki", "Uhuru"], correctAnswer: 1, explanation: "Jomo Kenyatta (1964-78)." },
    { id: "his-2", question: "AU stands for?", options: ["American Union", "African Union", "Asian Union", "Atlantic Union"], correctAnswer: 1, explanation: "African Union." },
    { id: "his-3", question: "Berlin Conference 1884-85 about?", options: ["WWI", "Partition of Africa", "African independence", "Trade"], correctAnswer: 1, explanation: "Division of Africa." },
    { id: "his-4", question: "Mau Mau leader?", options: ["Tom Mboya", "Dedan Kimathi", "Oginga Odinga", "Ronald Ngala"], correctAnswer: 1, explanation: "Dedan Kimathi." },
    { id: "his-5", question: "Kenya 2010 Constitution promulgated?", options: ["2005", "2008", "2010", "2013"], correctAnswer: 2, explanation: "27 Aug 2010." },
    { id: "his-6", question: "WWII ended in?", options: ["1939", "1945", "1950", "1960"], correctAnswer: 1, explanation: "1945." },
    { id: "his-7", question: "Who said 'Harambee'?", options: ["Moi", "Kenyatta", "Kibaki", "Raila"], correctAnswer: 1, explanation: "Jomo Kenyatta's rallying call." },
    { id: "his-8", question: "Egypt's ancient writing?", options: ["Latin", "Hieroglyphics", "Cuneiform", "Sanskrit"], correctAnswer: 1, explanation: "Hieroglyphics." },
    { id: "his-9", question: "Apartheid was in?", options: ["Kenya", "Nigeria", "South Africa", "Ghana"], correctAnswer: 2, explanation: "South Africa." },
    { id: "his-10", question: "Who ended apartheid?", options: ["Mugabe", "Mandela", "Nkrumah", "Nyerere"], correctAnswer: 1, explanation: "Nelson Mandela." },
  ],

  // ============ GEOGRAPHY ============
  geography: [
    { id: "geo-1", question: "Mt. Kenya is Africa's ___ highest?", options: ["1st", "2nd", "3rd", "4th"], correctAnswer: 1, explanation: "Second after Kilimanjaro." },
    { id: "geo-2", question: "Great Rift Valley is?", options: ["River", "Geological trench", "Mountain range", "Desert"], correctAnswer: 1, explanation: "Geological trench." },
    { id: "geo-3", question: "Ocean east of Kenya?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correctAnswer: 2, explanation: "Indian Ocean." },
    { id: "geo-4", question: "Earthquakes caused by?", options: ["Wind", "Rain", "Tectonic movement", "Volcanoes only"], correctAnswer: 2, explanation: "Plate tectonics." },
    { id: "geo-5", question: "Climate is?", options: ["Today's weather", "Long-term average weather", "Temp only", "Rain only"], correctAnswer: 1, explanation: "Long-term average." },
    { id: "geo-6", question: "Tool to find direction?", options: ["Ruler", "Compass", "Clock", "Map only"], correctAnswer: 1, explanation: "Compass." },
    { id: "geo-7", question: "Imaginary line at 0° latitude?", options: ["Tropic", "Equator", "Prime meridian", "Pole"], correctAnswer: 1, explanation: "Equator." },
    { id: "geo-8", question: "Largest ocean?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correctAnswer: 1, explanation: "Pacific." },
    { id: "geo-9", question: "Volcano example in Kenya?", options: ["Longonot", "Everest", "Fuji", "Vesuvius"], correctAnswer: 0, explanation: "Mt. Longonot." },
    { id: "geo-10", question: "Map scale shows?", options: ["Direction", "Distance ratio", "Time", "Weather"], correctAnswer: 1, explanation: "Ratio of map to ground distance." },
  ],

  // ============ RELIGIOUS EDUCATION ============
  "religious-ed": [
    { id: "re-1", question: "Books in the Bible (Protestant)?", options: ["39", "46", "66", "73"], correctAnswer: 2, explanation: "66 books." },
    { id: "re-2", question: "Golden Rule?", options: ["Be wealthy", "Treat others as you wish", "Follow all rules", "Obey authority"], correctAnswer: 1, explanation: "Treat others as you want to be treated." },
    { id: "re-3", question: "Pillar of Islam?", options: ["Baptism", "Salah (Prayer)", "Sabbath", "Communion"], correctAnswer: 1, explanation: "Salah." },
    { id: "re-4", question: "Morality is?", options: ["Being rich", "Right vs wrong", "Trends", "Popularity"], correctAnswer: 1, explanation: "Right vs wrong." },
    { id: "re-5", question: "Compassion means?", options: ["Bravery", "Concern for others' suffering", "Smartness", "Strictness"], correctAnswer: 1, explanation: "Caring concern." },
    { id: "re-6", question: "Holy book of Islam?", options: ["Bible", "Quran", "Torah", "Vedas"], correctAnswer: 1, explanation: "Quran." },
    { id: "re-7", question: "Holy book of Judaism?", options: ["Quran", "Torah", "Bible NT", "Gita"], correctAnswer: 1, explanation: "Torah." },
    { id: "re-8", question: "Day of worship for Muslims?", options: ["Sunday", "Friday", "Saturday", "Monday"], correctAnswer: 1, explanation: "Jumu'ah on Friday." },
    { id: "re-9", question: "Christian sacrament with water?", options: ["Communion", "Baptism", "Marriage", "Confession"], correctAnswer: 1, explanation: "Baptism." },
    { id: "re-10", question: "10 Commandments given to?", options: ["Abraham", "Moses", "David", "Noah"], correctAnswer: 1, explanation: "Moses on Mt. Sinai." },
  ],

  // ============ CSL ============
  csl: [
    { id: "csl-1", question: "Community service is?", options: ["Paid work", "Voluntary help", "Homework", "Govt job"], correctAnswer: 1, explanation: "Voluntary help." },
    { id: "csl-2", question: "Why teamwork?", options: ["Not important", "Achieve more together", "Easier to be lazy", "Only leaders matter"], correctAnswer: 1, explanation: "Achieve more together." },
    { id: "csl-3", question: "Empathy is?", options: ["Ignoring others", "Understanding others' feelings", "Selfishness", "Anger"], correctAnswer: 1, explanation: "Shared understanding." },
    { id: "csl-4", question: "Environmental conservation?", options: ["Cutting trees", "Protecting environment", "Building factories", "Mining"], correctAnswer: 1, explanation: "Protect & preserve." },
    { id: "csl-5", question: "Civic responsibility?", options: ["Watching TV", "Voting", "Sleeping", "Gaming"], correctAnswer: 1, explanation: "Voting." },
    { id: "csl-6", question: "Recycling helps?", options: ["Pollution", "Reduce waste", "Increase cost", "Nothing"], correctAnswer: 1, explanation: "Reduces waste." },
    { id: "csl-7", question: "Volunteering benefit?", options: ["Money", "Skills & helping others", "Fame only", "Nothing"], correctAnswer: 1, explanation: "Skills and helping." },
    { id: "csl-8", question: "Respect means?", options: ["Disregarding", "Valuing others", "Ignoring", "Mocking"], correctAnswer: 1, explanation: "Valuing others." },
  ],

  // ============ SPORTS SCIENCE ============
  "sports-science": [
    { id: "sps-1", question: "Skeleton's role in sport?", options: ["Digestion", "Support/movement", "Breathing", "Thinking"], correctAnswer: 1, explanation: "Support + movement." },
    { id: "sps-2", question: "Aerobic exercise?", options: ["No breathing", "Uses oxygen", "Only stretching", "Sleeping"], correctAnswer: 1, explanation: "Uses oxygen." },
    { id: "sps-3", question: "Sprain is?", options: ["Broken bone", "Stretched/torn ligament", "Muscle cramp", "Skin cut"], correctAnswer: 1, explanation: "Ligament injury." },
    { id: "sps-4", question: "Daily exercise mins?", options: ["10", "20", "30-60", "120"], correctAnswer: 2, explanation: "30-60 min." },
    { id: "sps-5", question: "BMI stands for?", options: ["Body Mass Index", "Basic Movement Indicator", "Blood Measurement Index", "Bone Muscle Intensity"], correctAnswer: 0, explanation: "Body Mass Index." },
    { id: "sps-6", question: "Hydration means?", options: ["Eating fats", "Drinking water", "Sleeping", "Stretching"], correctAnswer: 1, explanation: "Drinking enough water." },
    { id: "sps-7", question: "Anaerobic example?", options: ["Marathon", "Sprinting", "Cycling slowly", "Walking"], correctAnswer: 1, explanation: "Short, intense effort." },
    { id: "sps-8", question: "Cool-down purpose?", options: ["Prepare body", "Reduce soreness", "Warm body", "Build muscle"], correctAnswer: 1, explanation: "Gradual recovery." },
  ],

  // ============ FINE ART ============
  "fine-art": [
    { id: "fa-1", question: "Still life shows?", options: ["A portrait", "Inanimate objects", "A landscape", "Action"], correctAnswer: 1, explanation: "Inanimate items." },
    { id: "fa-2", question: "Complementary colors?", options: ["Same colors", "Opposite on wheel", "Dark", "Light"], correctAnswer: 1, explanation: "Opposite on color wheel." },
    { id: "fa-3", question: "Perspective creates?", options: ["Color mixing", "Depth illusion", "Ruler use", "Erasing"], correctAnswer: 1, explanation: "Illusion of depth." },
    { id: "fa-4", question: "Mosaic is?", options: ["Painting style", "Art from small pieces", "Sculpture type", "Drawing tool"], correctAnswer: 1, explanation: "Small colored pieces." },
    { id: "fa-5", question: "Painter of Mona Lisa?", options: ["Michelangelo", "Da Vinci", "Picasso", "Van Gogh"], correctAnswer: 1, explanation: "Leonardo da Vinci." },
    { id: "fa-6", question: "Secondary color?", options: ["Red", "Blue", "Green", "Yellow"], correctAnswer: 2, explanation: "Green (blue+yellow)." },
    { id: "fa-7", question: "Art with no recognizable subject?", options: ["Abstract", "Portrait", "Landscape", "Still life"], correctAnswer: 0, explanation: "Abstract art." },
    { id: "fa-8", question: "Sketching uses mostly?", options: ["Oil paint", "Pencil/charcoal", "Clay", "Glass"], correctAnswer: 1, explanation: "Pencil/charcoal." },
  ],

  // ============ MUSIC ============
  music: [
    { id: "mus-1", question: "Notes in a scale?", options: ["5", "7", "8", "12"], correctAnswer: 2, explanation: "8 (do-re-mi-...-do)." },
    { id: "mus-2", question: "Tempo is?", options: ["Volume", "Speed", "Pitch", "Rhythm"], correctAnswer: 1, explanation: "Speed of music." },
    { id: "mus-3", question: "Percussion instrument?", options: ["Guitar", "Flute", "Drum", "Violin"], correctAnswer: 2, explanation: "Drum." },
    { id: "mus-4", question: "'Forte' means?", options: ["Soft", "Loud", "Fast", "Slow"], correctAnswer: 1, explanation: "Loud." },
    { id: "mus-5", question: "Kenya anthem first line?", options: ["God save Kenya", "Ee Mungu nguvu yetu", "Kenya our homeland", "Arise"], correctAnswer: 1, explanation: "Ee Mungu nguvu yetu." },
    { id: "mus-6", question: "String instrument?", options: ["Drum", "Flute", "Guitar", "Trumpet"], correctAnswer: 2, explanation: "Guitar." },
    { id: "mus-7", question: "Wind instrument?", options: ["Drum", "Piano", "Flute", "Violin"], correctAnswer: 2, explanation: "Flute." },
    { id: "mus-8", question: "'Piano' (dynamic) means?", options: ["Soft", "Loud", "Fast", "Slow"], correctAnswer: 0, explanation: "Soft." },
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

// Merge extras into base — extras are appended after originals so the cursor
// naturally moves on to fresh questions once the original set is exhausted.
const questionBank: Record<string, Question[]> = (() => {
  const merged: Record<string, Question[]> = { ...baseBank };
  for (const [key, list] of Object.entries(extraQuestions)) {
    merged[key] = [...(merged[key] || []), ...list];
  }
  return merged;
})();

function getBank(subjectId: string): Question[] {
  return questionBank[subjectId] || questionBank[aliases[subjectId] || ""] || [];
}

const CURSOR_PREFIX = "studyplug:cursor:";
const EXAM_SIZE = 5;

function loadCursor(subjectId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(CURSOR_PREFIX + subjectId);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function saveCursor(subjectId: string, cursor: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURSOR_PREFIX + subjectId, String(cursor));
  } catch {
    /* ignore */
  }
}

/**
 * Returns the next batch of questions for the subject, IN ORDER.
 * Each call advances the cursor so the student gets NEW questions on the next
 * attempt. When the bank is exhausted, it wraps back to the start.
 * No shuffling of questions or options.
 */
export function getQuestionsForSubject(subjectId: string): Question[] {
  const bank = getBank(subjectId);
  if (bank.length === 0) return [];

  const size = Math.min(EXAM_SIZE, bank.length);
  let cursor = loadCursor(subjectId) % bank.length;

  const picked: Question[] = [];
  for (let i = 0; i < size; i++) {
    picked.push(bank[(cursor + i) % bank.length]);
  }

  saveCursor(subjectId, (cursor + size) % bank.length);
  return picked;
}

export function hasQuestions(subjectId: string): boolean {
  return getBank(subjectId).length > 0;
}

// Aliases moved above getBank() reference
export default questionBank;

