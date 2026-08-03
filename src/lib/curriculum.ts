// StudyPlug Kenya – CBC curriculum definitions (Junior & Senior School)

export interface CurriculumSubject {
  id: string;
  name: string;
  icon: string;
}

export type PathwayId = "stem" | "social-sciences" | "arts-sports";

export const JUNIOR_SUBJECTS: CurriculumSubject[] = [
  { id: "english", name: "English", icon: "📖" },
  { id: "kiswahili", name: "Kiswahili", icon: "🗣️" },
  { id: "mathematics", name: "Mathematics", icon: "📐" },
  { id: "integrated-science", name: "Integrated Science", icon: "🔬" },
  { id: "social-studies", name: "Social Studies", icon: "🌍" },
  { id: "agriculture-nutrition", name: "Agriculture and Nutrition", icon: "🌾" },
  { id: "creative-arts-sports", name: "Creative Arts and Sports", icon: "🎨" },
  { id: "pre-technical", name: "Pre-Technical Studies", icon: "🔧" },
  { id: "religious-ed", name: "Religious Education", icon: "📿" },
  { id: "health-education", name: "Health Education", icon: "🩺" },
];

export const SENIOR_COMPULSORY: CurriculumSubject[] = [
  { id: "english", name: "English", icon: "📖" },
  { id: "kiswahili", name: "Kiswahili or Kenya Sign Language", icon: "🗣️" },
  { id: "csl", name: "Community Service Learning", icon: "🤝" },
  { id: "pe", name: "Physical Education", icon: "🏃" },
];

export const PATHWAYS: {
  id: PathwayId;
  name: string;
  icon: string;
  blurb: string;
  optional: CurriculumSubject[];
}[] = [
  {
    id: "stem",
    name: "STEM",
    icon: "🧪",
    blurb: "Science, Technology, Engineering and Mathematics",
    optional: [
      { id: "mathematics", name: "Mathematics", icon: "📐" },
      { id: "biology", name: "Biology", icon: "🧬" },
      { id: "chemistry", name: "Chemistry", icon: "⚗️" },
      { id: "physics", name: "Physics", icon: "⚛️" },
      { id: "computer-studies", name: "Computer Studies", icon: "💻" },
      { id: "agriculture", name: "Agriculture", icon: "🌾" },
      { id: "general-science", name: "General Science", icon: "🔬" },
      { id: "engineering-technology", name: "Engineering Technology", icon: "⚙️" },
      { id: "building-construction", name: "Building Construction", icon: "🏗️" },
      { id: "electricity", name: "Electricity", icon: "💡" },
      { id: "electronics", name: "Electronics", icon: "🔌" },
      { id: "woodwork", name: "Woodwork", icon: "🪵" },
      { id: "metalwork", name: "Metalwork", icon: "🔩" },
      { id: "power-mechanics", name: "Power Mechanics", icon: "🛠️" },
      { id: "aviation-technology", name: "Aviation Technology", icon: "✈️" },
      { id: "marine-fisheries", name: "Marine and Fisheries Technology", icon: "🐟" },
    ],
  },
  {
    id: "social-sciences",
    name: "Social Sciences",
    icon: "🏛️",
    blurb: "Humanities, business and languages",
    optional: [
      { id: "history", name: "History", icon: "🏛️" },
      { id: "geography", name: "Geography", icon: "🌍" },
      { id: "cre", name: "Christian Religious Education (CRE)", icon: "✝️" },
      { id: "ire", name: "Islamic Religious Education (IRE)", icon: "☪️" },
      { id: "hre", name: "Hindu Religious Education (HRE)", icon: "🕉️" },
      { id: "business", name: "Business Studies", icon: "💼" },
      { id: "accounting", name: "Accounting", icon: "🧾" },
      { id: "economics", name: "Economics", icon: "📈" },
      { id: "entrepreneurship", name: "Entrepreneurship", icon: "🚀" },
    ],
  },
  {
    id: "arts-sports",
    name: "Arts and Sports Science",
    icon: "🎭",
    blurb: "Creative arts, performance and sports",
    optional: [
      { id: "fine-art", name: "Fine Art", icon: "🎨" },
      { id: "music", name: "Music", icon: "🎵" },
      { id: "dance", name: "Dance", icon: "💃" },
      { id: "drama-theatre", name: "Drama and Theatre", icon: "🎭" },
      { id: "film-production", name: "Film Production", icon: "🎬" },
      { id: "sports-science", name: "Sports Science", icon: "🏅" },
      { id: "fashion-design", name: "Fashion Design and Clothing Technology", icon: "👗" },
      { id: "textile-design", name: "Textile Design", icon: "🧵" },
      { id: "home-management", name: "Home Management", icon: "🏠" },
    ],
  },
];

export const GRADE_OPTIONS = [7, 8, 9, 10, 11, 12];

export const isJuniorGrade = (grade?: number | null) => !!grade && grade >= 7 && grade <= 9;
export const isSeniorGrade = (grade?: number | null) => !!grade && grade >= 10;

export function getPathway(id?: string | null) {
  return PATHWAYS.find((p) => p.id === id);
}

/** All subjects known to the curriculum, keyed by id. */
export const SUBJECT_INDEX: Record<string, CurriculumSubject> = (() => {
  const map: Record<string, CurriculumSubject> = {};
  [JUNIOR_SUBJECTS, SENIOR_COMPULSORY, ...PATHWAYS.map((p) => p.optional)].forEach((list) =>
    list.forEach((s) => {
      map[s.id] = s;
    })
  );
  return map;
})();

export function subjectById(id: string): CurriculumSubject {
  return SUBJECT_INDEX[id] ?? { id, name: id.replace(/-/g, " "), icon: "📚" };
}

/** Accent colour (HSL string) used by the floating AI orb, per subject family. */
export function subjectAccent(subjectId?: string | null): string {
  if (!subjectId) return "168 72% 45%";
  const id = subjectId.toLowerCase();
  if (id.includes("math")) return "217 91% 60%"; // Blue
  if (id.includes("english") || id.includes("literature")) return "45 93% 55%"; // Yellow
  if (id.includes("kiswahili") || id.includes("sign")) return "270 65% 60%"; // Purple
  if (
    id.includes("business") ||
    id.includes("account") ||
    id.includes("econom") ||
    id.includes("entrepreneur")
  )
    return "25 90% 55%"; // Orange
  if (id.includes("social") || id.includes("history") || id.includes("geograph"))
    return "0 78% 58%"; // Red
  if (
    id.includes("science") ||
    id.includes("bio") ||
    id.includes("chem") ||
    id.includes("physics") ||
    id.includes("agri")
  )
    return "142 72% 42%"; // Green
  return "168 72% 45%";
}

/** Default subject list for a grade when the learner hasn't chosen yet. */
export function defaultSubjectsForGrade(grade?: number | null): string[] {
  if (isJuniorGrade(grade)) return JUNIOR_SUBJECTS.map((s) => s.id);
  if (isSeniorGrade(grade)) return SENIOR_COMPULSORY.map((s) => s.id);
  return ["english", "kiswahili", "mathematics"];
}

// ---------------------------------------------------------------------------
// Smart Notes topic catalogue: Grade → Subject → Topics
// ---------------------------------------------------------------------------

const TOPICS: Record<string, string[]> = {
  mathematics: [
    "Whole Numbers and Place Value",
    "Fractions, Decimals and Percentages",
    "Ratio, Rates and Proportion",
    "Algebraic Expressions and Equations",
    "Geometry: Angles and Shapes",
    "Measurement: Area, Volume and Capacity",
    "Statistics and Data Handling",
    "Probability",
  ],
  english: [
    "Parts of Speech",
    "Tenses and Verb Forms",
    "Punctuation and Capitalisation",
    "Reading Comprehension Skills",
    "Functional Writing: Letters and Emails",
    "Creative Composition Writing",
    "Oral Skills and Listening",
    "Vocabulary and Idiomatic Expressions",
  ],
  kiswahili: [
    "Sarufi: Ngeli za Nomino",
    "Vitenzi na Nyakati",
    "Insha za Kimaelezo",
    "Ufahamu na Ufupisho",
    "Methali na Nahau",
    "Fasihi Simulizi",
    "Matumizi ya Lugha",
    "Uandishi wa Barua",
  ],
  "integrated-science": [
    "Living Things and Their Environment",
    "Human Body Systems",
    "Matter and Its Properties",
    "Mixtures, Elements and Compounds",
    "Force, Energy and Simple Machines",
    "Electricity and Magnetism",
    "Light and Sound",
    "Health and Disease",
  ],
  "social-studies": [
    "Map Work and Physical Features of Kenya",
    "Climate and Vegetation",
    "People and Population",
    "Historical Information and Sources",
    "Citizenship and Governance",
    "Human Rights and Responsibilities",
    "Resources and Economic Activities",
    "Regional and International Cooperation",
  ],
  "agriculture-nutrition": [
    "Soil and Soil Fertility",
    "Crop Production Practices",
    "Livestock Keeping",
    "Farm Tools and Equipment",
    "Food Nutrients and Balanced Diet",
    "Food Preparation and Preservation",
    "Kitchen Hygiene and Safety",
    "Agribusiness Basics",
  ],
  "creative-arts-sports": [
    "Elements and Principles of Art",
    "Drawing and Painting Techniques",
    "Crafts and Indigenous Art",
    "Music Notation and Rhythm",
    "Performance and Stage Skills",
    "Athletics and Field Events",
    "Ball Games Skills and Rules",
    "Fitness and Safety in Sports",
  ],
  "pre-technical": [
    "Workshop Safety and Tools",
    "Technical Drawing Basics",
    "Materials and Their Properties",
    "Simple Structures and Mechanisms",
    "Basic Electronics",
    "Entrepreneurship in Technology",
    "Communication Technology",
    "Project Design Process",
  ],
  "religious-ed": [
    "Creation and Human Life",
    "Sacred Writings",
    "Faith and Worship",
    "Moral Values and Decision Making",
    "Leadership and Service",
    "Family and Community Life",
    "Religious Festivals",
    "Peace and Reconciliation",
  ],
  "health-education": [
    "Personal Hygiene",
    "Nutrition and Healthy Eating",
    "Communicable Diseases",
    "Non-Communicable Diseases",
    "Mental Health and Wellbeing",
    "Drug and Substance Abuse",
    "First Aid Basics",
    "Reproductive Health Education",
  ],
  biology: [
    "Cell Structure and Function",
    "Classification of Living Things",
    "Nutrition in Plants and Animals",
    "Transport in Living Things",
    "Gaseous Exchange and Respiration",
    "Excretion and Homeostasis",
    "Reproduction and Growth",
    "Genetics and Evolution",
  ],
  chemistry: [
    "Introduction to Chemistry and Lab Safety",
    "Structure of the Atom",
    "The Periodic Table",
    "Chemical Bonding",
    "Acids, Bases and Salts",
    "Chemical Reactions and Equations",
    "Moles and Stoichiometry",
    "Organic Chemistry Basics",
  ],
  physics: [
    "Measurement and Units",
    "Force and Motion",
    "Work, Energy and Power",
    "Pressure and Fluids",
    "Heat and Thermal Physics",
    "Waves, Light and Sound",
    "Electricity and Circuits",
    "Magnetism and Electromagnetism",
  ],
  "computer-studies": [
    "Computer Hardware and Software",
    "Operating Systems and Files",
    "Word Processing and Spreadsheets",
    "Networking and the Internet",
    "Data Representation",
    "Programming Fundamentals",
    "Databases",
    "Cyber Security and Digital Ethics",
  ],
  business: [
    "Introduction to Business Studies",
    "Business Environment",
    "Production and Enterprise",
    "Demand, Supply and Markets",
    "Money and Banking",
    "Trade: Home and International",
    "Business Financing",
    "Bookkeeping Basics",
  ],
  history: [
    "Sources of History",
    "Early Human Societies",
    "Kenyan Communities and Migration",
    "Colonisation and Resistance",
    "Struggle for Independence",
    "Constitution and Governance in Kenya",
    "Pan-Africanism",
    "World Wars and Their Effects",
  ],
  geography: [
    "Earth and the Solar System",
    "Maps and Map Reading",
    "Weather and Climate",
    "Internal Land-Forming Processes",
    "External Land-Forming Processes",
    "Vegetation and Soils",
    "Agriculture and Industry",
    "Population and Settlement",
  ],
  cre: [
    "Creation and the Fall",
    "Faith and God's Promises",
    "The Life and Ministry of Jesus",
    "The Early Church",
    "Christian Values in Modern Life",
    "Christian Marriage and Family",
    "Work and Leisure",
    "Law, Order and Justice",
  ],
  agriculture: [
    "Introduction to Agriculture",
    "Soil Science",
    "Crop Husbandry",
    "Livestock Health and Production",
    "Farm Machinery",
    "Agroforestry and Conservation",
    "Farm Records and Accounts",
    "Agricultural Economics",
  ],
};

const GENERIC_TOPICS = [
  "Introduction and Key Concepts",
  "Core Principles",
  "Practical Skills and Application",
  "Tools, Materials and Techniques",
  "Safety, Ethics and Best Practice",
  "Real-Life Examples in Kenya",
  "Project Work",
  "Revision and Assessment",
];

export interface NoteTopic {
  id: string;
  title: string;
  subjectId: string;
  grade: number;
  readingMinutes: number;
}

export function topicsFor(subjectId: string, grade: number): NoteTopic[] {
  const list = TOPICS[subjectId] ?? GENERIC_TOPICS;
  return list.map((title, i) => ({
    id: `${grade}-${subjectId}-${i + 1}`,
    title,
    subjectId,
    grade,
    readingMinutes: 5 + (i % 4) * 2,
  }));
}

export function findTopic(topicKey: string): NoteTopic | null {
  const [gradeRaw, ...rest] = topicKey.split("-");
  const grade = Number(gradeRaw);
  if (!grade || rest.length < 2) return null;
  const index = Number(rest[rest.length - 1]);
  const subjectId = rest.slice(0, -1).join("-");
  const topics = topicsFor(subjectId, grade);
  return topics[index - 1] ?? null;
}
