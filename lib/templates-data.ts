export const CATEGORIES = [
  "All",
  "Simple",
  "Creative",
  "Modern",
  "Professional",
  "Elegant",
  "Sophisticated",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Template {
  id: string;
  name: string;
  description: string;
  category: Category | Category[];
  gradient: string;
  image?: string;
  features: string[];
  disabled?: boolean;
  release?: string;
  tags: string[];
  colors: string[];
  popularity: number; // 0-100
  date: string; // ISO date
  beta?: boolean;
}

export const templates: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description:
      "A timeless design with structured sections. Excellent for academic and traditional industries.",
    category: ["Simple", "Professional"],
    gradient: "bg-linear-to-br from-amber-50 to-orange-50",
    image: "/images/classic_resume.jpg",
    features: ["Structured Layout", "Formal Design", "Academic Ready"],
    tags: ["Single Column", "Traditional", "Academic"],
    colors: ["#000000"],
    popularity: 99,
    date: "2025-01-31",
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "Modern two-column layout, high density. Ideal for experienced professionals needing to fit extensive history.",
    category: ["Simple", "Professional"],
    gradient: "bg-linear-to-br from-slate-50 to-gray-100",
    image: "/images/professional_template.jpg",
    features: [
      "Two Column Layout",
      "High Content Density",
      "Sidebar for Skills",
      "Executive Look",
    ],
    tags: ["Two Columns", "High Density", "Corporate"],
    colors: ["#0f172a"],
    popularity: 98,
    date: "2025-01-31",
  },
  {
    id: "classic-slate",
    name: "Classic Slate",
    description:
      "Elegant two-column layout with sophisticated bordered sections and clean typography. Perfect for professionals seeking a modern yet professional appearance.",
    category: ["Sophisticated", "Professional"],
    gradient: "bg-linear-to-br from-slate-100 to-slate-200",
    image: "/images/classicSlate_template.jpg",
    features: [
      "Two Column Layout",
      "Bordered Sections",
      "Clean Typography",
      "Professional Look",
    ],
    tags: ["Two Columns", "Clean", "Minimal"],
    colors: ["#334155"],
    popularity: 88,
    date: "2025-01-31",
  },
  {
    id: "creative",
    name: "Creative Sidebar",
    description:
      "A modern two-column design with a colored sidebar. Perfect for showing off skills and personality.",
    category: "Creative",
    gradient: "bg-linear-to-br from-blue-50 to-indigo-50",
    image: "/images/creative_template.jpg",
    features: [
      "Two Column Layout",
      "Skill Bars",
      "Colored Sidebar",
      "Space Efficient",
    ],
    tags: ["Two Columns", "Colorful", "Creative"],
    colors: ["#8b5cf6", "#f4f4f0"],
    popularity: 92,
    date: "2025-01-31",
  },
  {
    id: "glow",
    name: "Glow",
    description:
      "Vibrant accents with modern typography. Perfect for creative professionals and tech-savvy industries.",
    category: ["Modern", "Creative"],
    gradient: "bg-linear-to-br from-slate-900 to-slate-800",
    image: "/images/glow_template.jpg",
    features: [
      "High Contrast",
      "Vibrant Accents",
      "Modern Look",
      "Typography",
    ],
    tags: ["Dark Mode", "Vibrant", "Tech"],
    colors: ["#F4D03F", "#1F2937"],
    popularity: 85,
    date: "2025-01-31",
  },
  {
    id: "multicolumn",
    name: "Multicolumn",
    description:
      "Clean 3-column layout. Perfect for highlighting skills and education alongside experience.",
    category: ["Modern", "Professional"],
    gradient: "bg-linear-to-br from-blue-50 to-sky-100",
    image: "/images/multicolumn_template.jpg",
    features: ["Three Column Layout", "Clean Hierarchy", "Customizable"],
    tags: ["Three Columns", "Complex", "Detailed"],
    colors: ["#000000"],
    popularity: 70,
    date: "2025-01-31",
  },
  {
    id: "stylish",
    name: "Stylish",
    description:
      "A modern two-column design with a colored sidebar. Perfect for showing off skills and personality.",
    category: "Creative",
    gradient: "bg-linear-to-br from-blue-50 to-indigo-50",
    image: "/images/stylish_template.jpg",
    features: [
      "Two Column Layout",
      "Skill Bars",
      "Colored Sidebar",
      "Space Efficient",
    ],
    tags: ["Two Columns", "Stylish", "Modern"],
    colors: ["#2563eb"],
    popularity: 75,
    date: "2025-01-31",
  },
  {
    id: "timeline",
    name: "Timeline",
    description:
      "A modern two-column design with a colored sidebar. Perfect for showing off skills and personality.",
    category: "Creative",
    gradient: "bg-linear-to-br from-blue-50 to-indigo-50",
    image: "/images/timeline_template.jpg",
    features: [
      "Two Column Layout",
      "Skill Bars",
      "Colored Sidebar",
      "Space Efficient",
    ],
    tags: ["Two Columns", "Timeline", "Creative"],
    colors: ["#3b82f6"],
    popularity: 89,
    date: "2025-01-31",
  },
  {
    id: "polished",
    name: "Polished",
    description:
      "A modern two-column design with a colored sidebar. Perfect for showing off skills and personality.",
    category: "Creative",
    gradient: "bg-linear-to-br from-blue-50 to-indigo-50",
    image: "/images/polished_template.jpg",
    features: [
      "Two Column Layout",
      "Skill Bars",
      "Colored Sidebar",
      "Space Efficient",
    ],
    tags: ["Two Columns", "Polished", "Sleek"],
    colors: ["#0B5B75", "#0e7490"],
    popularity: 85,
    date: "2025-01-31",
  },
  {
    id: "ats",
    name: "ATS Scanner",
    description:
      "A clean, single-column layout optimized for Applicant Tracking Systems. Essential for online applications.",
    category: "Simple",
    gradient: "bg-linear-to-br from-gray-50 to-gray-100",
    image: "/images/ats_scanner_template.jpg",
    features: [
      "Single Column Layout",
      "Machine Readable",
      "Standard Fonts",
      "Keyword Optimized",
    ],
    tags: ["Single Column", "ATS Friendly", "Minimal"],
    colors: ["#2563eb"],
    popularity: 90,
    date: "2025-01-31",
  },
  {
    id: "modern",
    name: "Modern Minimalist",
    description: "A sleek, typography-focused design.",
    category: "Modern",
    gradient: "bg-linear-to-br from-emerald-50 to-teal-50",
    image: "/images/modern_minimalist_template.jpg",
    features: [
      "Clean Typography",
      "Minimalist Header",
      "Whitespace",
      "Elegant",
    ],
    disabled: false,
    tags: ["Single Column", "Typography", "Minimalist"],
    colors: ["#10b981"],
    popularity: 90,
    date: "2025-01-31",
  },
  {
    id: "elegant",
    name: "Elegant Banner",
    description:
      "A sophisticated design with a full-width header. Stands out while maintaining readability.",
    category: "Elegant",
    gradient: "bg-linear-to-br from-slate-800 to-slate-900",
    image: "/images/elegant_template.jpg",
    features: [
      "Header Banner",
      "Visual Impact",
      "Clean Structure",
      "Modern Feel",
    ],
    tags: ["Header Banner", "Elegant", "Sophisticated"],
    colors: ["#2c3e50"],
    popularity: 80,
    date: "2025-01-31",
  },
  {
    id: "developer",
    name: "Developer",
    beta: true,
    description:
      "Clean 2-column layout with sidebar. Perfect for highlighting skills and education alongside experience.",
    category: ["Modern", "Creative"],
    gradient: "bg-linear-to-br from-blue-50 to-sky-100",
    image: "/images/developer_template.jpg",
    features: [
      "Two Column Layout",
      "Sidebar Design",
      "Clean Hierarchy",
      "Customizable",
    ],
    tags: ["Two Columns", "Tech", "Developer"],
    colors: ["#38bdf8", "#0f172a", "#1e293b"],
    popularity: 70,
    date: "2025-01-31",
  },
  {
    id: "developer2",
    name: "Developer 2",
    beta: true,
    description:
      "Dark theme with numbered sections and vertical typography. Distinctive and modern.",
    category: ["Modern", "Creative"],
    gradient: "bg-linear-to-br from-green-900 to-black",
    image: "/images/developer2_template.jpg",
    features: [
      "Dark Theme",
      "Numbered Sections",
      "Vertical Text",
      "Modern Layout",
    ],
    tags: ["Dark Mode", "Developer", "Unique"],
    colors: ["#3b82f6", "#1C1C1C", "#222222"],
    popularity: 60,
    date: "2025-01-31",
  },
];
