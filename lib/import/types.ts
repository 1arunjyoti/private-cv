import type { ResumeBasics, WorkExperience, Education, Skill, Project, Certificate, Language, Interest, Publication, Award, Reference, CustomSection } from '@/db';

// Parsed resume data before validation/mapping
export interface ParsedResumeData {
  basics?: Partial<ResumeBasics>;
  work?: Partial<WorkExperience>[];
  education?: Partial<Education>[];
  skills?: Partial<Skill>[];
  projects?: Partial<Project>[];
  certificates?: Partial<Certificate>[];
  languages?: Partial<Language>[];
  interests?: Partial<Interest>[];
  publications?: Partial<Publication>[];
  awards?: Partial<Award>[];
  references?: Partial<Reference>[];
  custom?: Partial<CustomSection>[];
}

// Import result with confidence scores
export interface ImportResult {
  success: boolean;
  data: ParsedResumeData;
  confidence: {
    overall: number; // 0-100
    sections: Record<string, number>; // Per-section confidence
  };
  warnings: string[];
  errors: string[];
  rawText?: string; // Original extracted text for debugging
}

// Section detection result
export interface DetectedSection {
  name: string;
  startIndex: number;
  endIndex: number;
  content: string;
  confidence: number;
}

// Supported import formats
export type ImportFormat = 'json' | 'pdf' | 'docx' | 'zip' | 'csv';

// File type detection result
export interface FileTypeResult {
  format: ImportFormat;
  mimeType: string;
  isValid: boolean;
}

// Parser interface that all parsers must implement
export interface ResumeParser {
  parse(file: File): Promise<ImportResult>;
  extractText?(file: File): Promise<string>;
}

// Common section headings for detection
export const SECTION_HEADINGS = {
  summary: [
    'summary', 'professional summary', 'career summary', 'profile', 
    'about me', 'about', 'objective', 'career objective', 'overview',
    'executive summary', 'personal statement', 'introduction', 'bio',
    'professional profile', 'career profile', 'personal profile'
  ],
  work: [
    'experience', 'work experience', 'professional experience', 'employment',
    'work history', 'employment history', 'career history', 'positions held',
    'relevant experience', 'professional background', 'career experience',
    'job history', 'professional history', 'work background', 'positions'
  ],
  education: [
    'education', 'educational background', 'academic background', 
    'qualifications', 'academic qualifications', 'degrees', 'academics',
    'educational qualifications', 'academic history', 'schooling',
    'academic credentials', 'training', 'formal education'
  ],
  skills: [
    'skills', 'technical skills', 'core competencies', 'competencies',
    'expertise', 'abilities', 'proficiencies', 'technologies',
    'professional skills', 'key skills', 'areas of expertise',
    'technical expertise', 'core skills', 'skill set', 'skillset',
    'technical proficiencies', 'tools', 'tools & technologies'
  ],
  projects: [
    'projects', 'personal projects', 'key projects', 'notable projects',
    'portfolio', 'work samples', 'selected projects', 'project experience',
    'project work', 'relevant projects', 'major projects'
  ],
  certificates: [
    'certifications', 'certificates', 'credentials', 'professional certifications',
    'licenses', 'accreditations', 'professional credentials',
    'licenses & certifications', 'certifications & licenses',
    'professional licenses', 'training & certifications'
  ],
  languages: [
    'languages', 'language skills', 'language proficiency',
    'linguistic skills', 'language abilities', 'spoken languages'
  ],
  interests: [
    'interests', 'hobbies', 'activities', 'personal interests',
    'hobbies & interests', 'extracurricular activities', 'leisure activities'
  ],
  publications: [
    'publications', 'papers', 'research', 'published works',
    'research publications', 'academic publications', 'scholarly works'
  ],
  awards: [
    'awards', 'honors', 'achievements', 'recognition', 'accomplishments',
    'awards & honors', 'honors & awards', 'distinctions',
    'accolades', 'achievements & awards'
  ],
  references: [
    'references', 'professional references', 'referees',
    'references available upon request', 'reference contacts'
  ]
} as const;

// Contact patterns for parsing
export const CONTACT_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  url: /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g,
  linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/gi,
  github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/gi
};

// Date patterns for parsing
export const DATE_PATTERNS = {
  monthYear: /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*[,.]?\s*\d{4}/gi,
  yearOnly: /\b(19|20)\d{2}\b/g,
  dateRange: /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}\s*[-–—]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|Present|Current)/gi,
  present: /present|current|ongoing|now/gi
};

// Re-export preprocessing and classification utilities
export { preprocessResumeText, reorderMultiColumnText } from './preprocess';
export type { PreprocessOptions } from './preprocess';
export { classifyResumeFormat } from './format-classifier';
export type { ResumeFormat, FormatClassification, FormatTraits } from './format-classifier';
