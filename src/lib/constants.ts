export const ITEMS_PER_PAGE = 20;

/** Platform commission on tutor earnings (20%). */
export const PLATFORM_COMMISSION_RATE = 0.2;

/** Payment methods for manual payments */
export const PAYMENT_METHODS = {
  BANK_TRANSFER: "Bank Transfer",
  EASYPAISA: "Easypaisa",
  JAZZCASH: "JazzCash"
} as const;

/** Default Expertise Categories, Subjects, and Education Levels */
export const DEFAULT_EXPERTISE_CATEGORIES = [
  { name: "Academic", description: "Primary, Secondary, and Higher Education", sortOrder: 1 },
  { name: "Exam Preparation", description: "SAT, ACT, IELTS, TOEFL, etc.", sortOrder: 2 },
  { name: "Language Learning", description: "English, Arabic, Urdu, French, etc.", sortOrder: 3 },
  { name: "Quranic Studies", description: "Nazra, Tajweed, Hifz, etc.", sortOrder: 4 },
  { name: "Science", description: "Physics, Chemistry, Biology, etc.", sortOrder: 5 },
  { name: "Mathematics", description: "Algebra, Calculus, Statistics, etc.", sortOrder: 6 },
  { name: "Technology & Programming", description: "Programming languages, AI, etc.", sortOrder: 7 },
  { name: "Business", description: "Finance, Marketing, Management, etc.", sortOrder: 8 },
  { name: "Communication", description: "Public Speaking, Soft Skills, etc.", sortOrder: 9 },
  { name: "Arts & Humanities", description: "History, Geography, Psychology, etc.", sortOrder: 10 },
  { name: "Engineering", description: "Mechanical, Electrical, Civil, etc.", sortOrder: 11 },
  { name: "Medical", description: "Biology, Pre-Med, etc.", sortOrder: 12 },
  { name: "Commerce", description: "Accounting, Economics, etc.", sortOrder: 13 },
  { name: "Other", description: "Miscellaneous subjects", sortOrder: 14 },
];

export const DEFAULT_EXPERTISE_SUBJECTS: Record<string, string[]> = {
  "Academic": [
    "Primary School (Grades 1-5)",
    "Middle School (Grades 6-8)",
    "High School (Grades 9-12)",
  ],
  "Exam Preparation": [
    "SAT",
    "ACT",
    "GRE",
    "GMAT",
    "IELTS",
    "TOEFL",
    "O Levels",
    "A Levels",
    "IGCSE",
    "IB",
  ],
  "Language Learning": [
    "English",
    "Urdu",
    "Arabic",
    "French",
    "Spanish",
    "German",
    "Chinese",
    "Japanese",
  ],
  "Quranic Studies": [
    "Nazra Quran",
    "Tajweed",
    "Hifz Quran",
    "Quran Translation",
    "Tafseer",
    "Islamic Studies",
  ],
  "Science": [
    "Physics",
    "Chemistry",
    "Biology",
  ],
  "Mathematics": [
    "General Math",
    "Algebra",
    "Calculus",
    "Geometry",
    "Statistics",
    "Trigonometry",
  ],
  "Technology & Programming": [
    "Python",
    "JavaScript",
    "Java",
    "C++",
    "C#",
    "Web Development",
    "Artificial Intelligence",
    "Machine Learning",
  ],
  "Business": [
    "Business Studies",
    "Marketing",
    "Finance",
    "Accounting",
    "Management",
  ],
  "Communication": [
    "Public Speaking",
    "Soft Skills",
    "Communication Skills",
  ],
  "Arts & Humanities": [
    "History",
    "Geography",
    "Sociology",
    "Psychology",
    "Philosophy",
    "Literature",
  ],
  "Engineering": [
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Computer Engineering",
  ],
  "Medical": [
    "Biology (Pre-Med)",
    "Medical Terminology",
  ],
  "Commerce": [
    "Economics",
    "Accounting",
    "Business Studies",
  ],
};

export const DEFAULT_EDUCATION_LEVELS = [
  { name: "Pre-School / Kindergarten", description: "Early childhood education", sortOrder: 1 },
  { name: "Grade 1-5", description: "Primary school", sortOrder: 2 },
  { name: "Grade 6-8", description: "Middle school", sortOrder: 3 },
  { name: "Grade 9-10", description: "Secondary school", sortOrder: 4 },
  { name: "O Levels", description: "Cambridge O Levels", sortOrder: 5 },
  { name: "Grade 11-12", description: "High school", sortOrder: 6 },
  { name: "A Levels", description: "Cambridge A Levels", sortOrder: 7 },
  { name: "IGCSE", description: "International GCSE", sortOrder: 8 },
  { name: "IB", description: "International Baccalaureate", sortOrder: 9 },
  { name: "University / Undergraduate", description: "Bachelor's degree", sortOrder: 10 },
  { name: "Graduate / Masters", description: "Master's degree", sortOrder: 11 },
  { name: "PhD", description: "Doctorate", sortOrder: 12 },
  { name: "Professional Development", description: "Career and skill development", sortOrder: 13 },
];

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

/** Payment statuses for manual payment flow */
export const PAYMENT_STATUSES = {
  AWAITING_PAYMENT: "awaiting_payment",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  CONFIRMED: "confirmed",
  REJECTED: "rejected"
} as const;

/** Payment method details (can be configured via environment variables later) */
export const PAYMENT_METHOD_DETAILS = {
  [PAYMENT_METHODS.BANK_TRANSFER]: {
    accountName: "Encrusted Academy",
    accountNumber: "0123456789",
    bankName: "Habib Bank Limited"
  },
  [PAYMENT_METHODS.EASYPAISA]: {
    accountName: "Encrusted Academy",
    accountNumber: "03001234567",
    walletName: "Easypaisa"
  },
  [PAYMENT_METHODS.JAZZCASH]: {
    accountName: "Encrusted Academy",
    accountNumber: "03101234567",
    walletName: "JazzCash"
  }
};

export const allCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
    "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
    "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
    "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
    "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North",
    "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
    "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
    "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia",
    "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka",
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
    "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
    "Zambia", "Zimbabwe"
];

export const allTimezones = [
    "GMT-12:00 (International Date Line West)",
    "GMT-11:00 (Midway Island, Samoa)",
    "GMT-10:00 (Hawaii)",
    "GMT-09:00 (Alaska)",
    "GMT-08:00 (Pacific Time - US & Canada)",
    "GMT-07:00 (Mountain Time - US & Canada)",
    "GMT-06:00 (Central Time - US & Canada, Mexico City)",
    "GMT-05:00 (Eastern Time - US & Canada, Bogota, Lima)",
    "GMT-04:00 (Atlantic Time - Canada, Caracas, La Paz)",
    "GMT-03:30 (Newfoundland)",
    "GMT-03:00 (Brazil, Buenos Aires, Georgetown)",
    "GMT-02:00 (Mid-Atlantic)",
    "GMT-01:00 (Azores, Cape Verde Islands)",
    "GMT+00:00 (Western Europe Time, London, Lisbon, Casablanca)",
    "GMT+01:00 (Brussels, Copenhagen, Madrid, Paris)",
    "GMT+02:00 (Kaliningrad, South Africa, Cairo)",
    "GMT+03:00 (Baghdad, Riyadh, Moscow, St. Petersburg)",
    "GMT+03:30 (Tehran)",
    "GMT+04:00 (Abu Dhabi, Muscat, Baku, Tbilisi)",
    "GMT+04:30 (Kabul)",
    "GMT+05:00 (Ekaterinburg, Islamabad, Karachi, Tashkent)",
    "GMT+05:30 (Chennai, Kolkata, Mumbai, New Delhi)",
    "GMT+05:45 (Kathmandu)",
    "GMT+06:00 (Almaty, Novosibirsk, Astana, Dhaka)",
    "GMT+06:30 (Yangon - Rangoon)",
    "GMT+07:00 (Bangkok, Hanoi, Jakarta)",
    "GMT+08:00 (Beijing, Hong Kong, Perth, Singapore, Taipei)",
    "GMT+09:00 (Tokyo, Seoul, Osaka, Sapporo, Yakutsk)",
    "GMT+09:30 (Adelaide, Darwin)",
    "GMT+10:00 (Canberra, Melbourne, Sydney, Guam, Vladivostok)",
    "GMT+11:00 (Magadan, Solomon Islands, New Caledonia)",
    "GMT+12:00 (Auckland, Wellington, Fiji, Kamchatka)"
];

export const allGrades = [
    // Early Years
    "Playgroup", "Nursery", "Kindergarten",

    // Primary/Elementary
    "Prep 1", "Prep 2", "Prep 3", "Prep 4",
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",

    // Secondary/High School
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
    "Grade 11", "Grade 12", "O-Levels", "A-Levels",

    // Higher Education
    "College", "Undergraduate", "Graduate", "Post-Graduate", "PhD", "University Student",

    // Specific / Professional
    "Private Candidate", "Public School Student", "Self-Learning", "Professional Development",

    // The "Trigger"
    "Other (Type manually)"
];