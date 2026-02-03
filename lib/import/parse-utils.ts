import { v4 as uuidv4 } from 'uuid';
import type { 
  WorkExperience,
  Education,
  Skill,
  Project,
  Certificate,
  Language,
} from '@/db';
import type { 
  ParsedResumeData, 
  DetectedSection 
} from './types';
import { 
  SECTION_HEADINGS, 
  CONTACT_PATTERNS} from './types';

/**
 * Detects and extracts sections from resume text
 */
export function detectSections(text: string): DetectedSection[] {
  const sections: DetectedSection[] = [];
  const lines = text.split('\n');
  
  // Build a map of all possible section headings
  const allHeadings: { pattern: RegExp; name: string }[] = [];
  for (const [sectionName, headings] of Object.entries(SECTION_HEADINGS)) {
    for (const heading of headings) {
      // Escape special regex characters in the heading
      const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Create regex that matches the heading at the start of a line
      // Allow for various formatting: ALL CAPS, Title Case, with or without colon
      // Also allow for some trailing content like a horizontal line
      const pattern = new RegExp(`^\\s*${escapedHeading}\\s*:?\\s*[-–—_]*\\s*$`, 'i');
      allHeadings.push({ pattern, name: sectionName });
    }
  }
  
  let currentSection: DetectedSection | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines for heading detection
    if (!line) continue;
    
    // Check if this line is a section heading
    for (const { pattern, name } of allHeadings) {
      if (pattern.test(line)) {
        // Save previous section
        if (currentSection) {
          currentSection.endIndex = i - 1;
          currentSection.content = lines
            .slice(currentSection.startIndex + 1, currentSection.endIndex + 1)
            .join('\n')
            .trim();
          if (currentSection.content) {
            sections.push(currentSection);
          }
        }
        
        // Start new section
        currentSection = {
          name,
          startIndex: i,
          endIndex: lines.length - 1,
          content: '',
          confidence: 0.8
        };
        break;
      }
    }
  }
  
  // Don't forget the last section
  if (currentSection) {
    currentSection.content = lines
      .slice(currentSection.startIndex + 1)
      .join('\n')
      .trim();
    if (currentSection.content) {
      sections.push(currentSection);
    }
  }
  
  return sections;
}

/**
 * Extracts contact information from text
 */
export function extractContactInfo(text: string): {
  email?: string;
  phone?: string;
  url?: string;
  linkedin?: string;
  github?: string;
} {
  const result: {
    email?: string;
    phone?: string;
    url?: string;
    linkedin?: string;
    github?: string;
  } = {};
  
  // Extract email
  const emailMatch = text.match(CONTACT_PATTERNS.email);
  if (emailMatch) {
    result.email = emailMatch[0];
  }
  
  // Extract phone
  const phoneMatch = text.match(CONTACT_PATTERNS.phone);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }
  
  // Extract LinkedIn
  const linkedinMatch = text.match(CONTACT_PATTERNS.linkedin);
  if (linkedinMatch) {
    result.linkedin = linkedinMatch[0];
  }
  
  // Extract GitHub
  const githubMatch = text.match(CONTACT_PATTERNS.github);
  if (githubMatch) {
    result.github = githubMatch[0];
  }
  
  // Extract other URLs (not LinkedIn/GitHub)
  const urlMatches = text.match(CONTACT_PATTERNS.url);
  if (urlMatches) {
    for (const url of urlMatches) {
      if (!url.includes('linkedin.com') && !url.includes('github.com')) {
        result.url = url.startsWith('http') ? url : `https://${url}`;
        break;
      }
    }
  }
  
  return result;
}

/**
 * Extracts name from the beginning of resume text
 */
export function extractName(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  // The name is usually in the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines that look like section headings or contain contact info
    if (CONTACT_PATTERNS.email.test(line)) continue;
    if (CONTACT_PATTERNS.phone.test(line)) continue;
    if (line.length > 60) continue; // Names are usually short
    if (line.toLowerCase().includes('@')) continue;
    // Skip lines that are likely addresses or locations
    if (/\d{5}/.test(line)) continue; // ZIP code
    if (/,\s*[A-Z]{2}\s*\d{5}/.test(line)) continue; // City, ST ZIP
    
    // Check if it looks like a name (2-4 words, capitalized)
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 5) {
      // Check if words are capitalized or ALL CAPS (common in PDFs)
      const isName = words.every(word => 
        /^[A-Z]/.test(word) || // First letter capitalized
        /^[A-Z]+$/.test(word) || // ALL CAPS
        word.length <= 2 // Allow short words like "de", "Jr"
      );
      // Also check it's not just numbers or single chars
      const hasRealWords = words.filter(w => w.length >= 2 && /[a-zA-Z]/.test(w)).length >= 2;
      if (isName && hasRealWords) {
        // Normalize ALL CAPS to Title Case
        const normalizedName = words.map(word => {
          if (/^[A-Z]+$/.test(word) && word.length > 2) {
            return word.charAt(0) + word.slice(1).toLowerCase();
          }
          return word;
        }).join(' ');
        return normalizedName;
      }
    }
  }
  
  return undefined;
}

/**
 * Extracts job title/label from resume text
 */
export function extractTitle(text: string): string | undefined {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  // Title usually comes after name, in first 10 lines
  for (let i = 1; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    // Skip contact info
    if (CONTACT_PATTERNS.email.test(line)) continue;
    if (CONTACT_PATTERNS.phone.test(line)) continue;
    if (line.includes('@')) continue;
    
    // Skip section headings
    let isSectionHeading = false;
    for (const headings of Object.values(SECTION_HEADINGS)) {
      if (headings.some(h => line.toLowerCase() === h.toLowerCase())) {
        isSectionHeading = true;
        break;
      }
    }
    if (isSectionHeading) continue;
    
    // Common job title patterns
    const titlePatterns = [
      /developer/i, /engineer/i, /designer/i, /manager/i,
      /analyst/i, /consultant/i, /specialist/i, /architect/i,
      /director/i, /lead/i, /senior/i, /junior/i, /associate/i,
      /coordinator/i, /administrator/i, /executive/i, /officer/i,
      /scientist/i, /researcher/i, /professor/i, /teacher/i,
      /accountant/i, /attorney/i, /lawyer/i, /nurse/i, /technician/i
    ];
    
    if (titlePatterns.some(p => p.test(line)) && line.length < 80) {
      return line;
    }
  }
  
  return undefined;
}

/**
 * Extracts location from text
 */
export function extractLocation(text: string): {
  city?: string;
  country?: string;
  region?: string;
} {
  const result: { city?: string; country?: string; region?: string } = {};
  
  // Common location patterns
  const locationPattern = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*,\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g;
  const match = text.match(locationPattern);
  
  if (match) {
    const parts = match[0].split(',').map(p => p.trim());
    result.city = parts[0];
    if (parts[1]) {
      // Could be state abbreviation or country
      if (parts[1].length === 2) {
        result.region = parts[1];
      } else {
        result.country = parts[1];
      }
    }
  }
  
  return result;
}

/**
 * Parses work experience section
 */
export function parseWorkExperience(content: string): Partial<WorkExperience>[] {
  const experiences: Partial<WorkExperience>[] = [];
  
  // Split by potential job entries (look for date patterns as separators)
  const blocks = splitByDatePatterns(content);
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) continue;
    
    const experience: Partial<WorkExperience> = {
      id: uuidv4(),
      highlights: []
    };
    
    // First line usually contains position/company
    const firstLine = lines[0];
    
    // Try to extract position and company
    if (firstLine.includes(' at ')) {
      const parts = firstLine.split(' at ');
      experience.position = parts[0].trim();
      experience.company = parts[1].trim();
    } else if (firstLine.includes(' - ')) {
      const parts = firstLine.split(' - ');
      experience.position = parts[0].trim();
      if (parts[1]) {
        experience.company = parts[1].trim();
      }
    } else if (firstLine.includes(' | ')) {
      const parts = firstLine.split(' | ');
      experience.position = parts[0].trim();
      if (parts[1]) {
        experience.company = parts[1].trim();
      }
    } else {
      experience.position = firstLine;
    }
    
    // Extract dates
    const dates = extractDates(block);
    if (dates.startDate) experience.startDate = dates.startDate;
    if (dates.endDate) experience.endDate = dates.endDate;
    
    // Extract highlights (bullet points)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Check if it looks like a bullet point
      if (/^[•\-\*\u2022\u2023\u25E6]\s*/.test(line) || /^\d+[.)]\s*/.test(line)) {
        const highlight = line.replace(/^[•\-\*\u2022\u2023\u25E6\d.)\s]+/, '').trim();
        if (highlight) {
          experience.highlights!.push(highlight);
        }
      } else if (i === 1 && !experience.company) {
        // Second line might be company name
        experience.company = line;
      }
    }
    
    // Build summary from remaining content
    if (!experience.highlights || experience.highlights.length === 0) {
      const summaryLines = lines.slice(experience.company ? 2 : 1);
      if (summaryLines.length > 0) {
        experience.summary = summaryLines.join(' ').substring(0, 500);
      }
    }
    
    if (experience.position || experience.company) {
      experiences.push(experience);
    }
  }
  
  return experiences;
}

/**
 * Parses education section
 */
export function parseEducation(content: string): Partial<Education>[] {
  const educations: Partial<Education>[] = [];
  
  const blocks = splitByDatePatterns(content);
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) continue;
    
    const education: Partial<Education> = {
      id: uuidv4(),
      courses: []
    };
    
    // Look for degree patterns
    const degreePatterns = [
      /(?:Bachelor|Master|PhD|Ph\.D|Doctor|Associate|MBA|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?)/i,
    ];
    
    for (const line of lines) {
      // Check for degree
      for (const pattern of degreePatterns) {
        if (pattern.test(line)) {
          // Extract degree type and area
          if (line.toLowerCase().includes(' in ')) {
            const parts = line.split(/ in /i);
            education.studyType = parts[0].trim();
            education.area = parts.slice(1).join(' in ').trim();
          } else if (line.toLowerCase().includes(' of ')) {
            const parts = line.split(/ of /i);
            education.studyType = line.trim();
            education.area = parts.slice(1).join(' of ').trim();
          } else {
            education.studyType = line.trim();
          }
          break;
        }
      }
      
      // Check for institution (usually contains University, College, Institute)
      if (/university|college|institute|school/i.test(line) && !education.institution) {
        education.institution = line.trim();
      }
      
      // Check for GPA
      const gpaMatch = line.match(/GPA:?\s*([\d.]+)/i);
      if (gpaMatch) {
        education.score = gpaMatch[1];
      }
    }
    
    // Extract dates
    const dates = extractDates(block);
    if (dates.startDate) education.startDate = dates.startDate;
    if (dates.endDate) education.endDate = dates.endDate;
    
    if (education.institution || education.studyType) {
      educations.push(education);
    }
  }
  
  return educations;
}

/**
 * Parses skills section
 */
export function parseSkills(content: string): Partial<Skill>[] {
  const skills: Partial<Skill>[] = [];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  // Track skill categories
  let currentCategory = '';
  
  for (const line of lines) {
    // Check if this is a category header
    if (line.endsWith(':')) {
      currentCategory = line.replace(':', '').trim();
      continue;
    }
    
    // Split by common delimiters
    const skillItems = line.split(/[,;•\|]/).map(s => s.trim()).filter(s => s);
    
    if (skillItems.length > 1) {
      // Multiple skills on one line - likely a list
      for (const skill of skillItems) {
        if (skill && skill.length < 50) {
          skills.push({
            id: uuidv4(),
            name: currentCategory || skill,
            level: '',
            keywords: currentCategory ? [skill] : []
          });
        }
      }
    } else if (skillItems.length === 1 && skillItems[0].length < 50) {
      // Single skill per line
      const cleanSkill = skillItems[0].replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '');
      skills.push({
        id: uuidv4(),
        name: cleanSkill,
        level: '',
        keywords: []
      });
    }
  }
  
  // Deduplicate and consolidate skills
  const consolidatedSkills = consolidateSkills(skills);
  
  return consolidatedSkills;
}

/**
 * Consolidate skills by grouping similar ones
 */
function consolidateSkills(skills: Partial<Skill>[]): Partial<Skill>[] {
  const seen = new Set<string>();
  return skills.filter(skill => {
    const key = skill.name?.toLowerCase() || '';
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Parses projects section
 */
export function parseProjects(content: string): Partial<Project>[] {
  const projects: Partial<Project>[] = [];
  
  const blocks = splitByDatePatterns(content);
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) continue;
    
    const project: Partial<Project> = {
      id: uuidv4(),
      highlights: [],
      keywords: []
    };
    
    // First line is usually the project name
    project.name = lines[0].replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
    
    // Extract dates
    const dates = extractDates(block);
    if (dates.startDate) project.startDate = dates.startDate;
    if (dates.endDate) project.endDate = dates.endDate;
    
    // Extract description and highlights
    const descriptionParts: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^[•\-\*\u2022\u2023\u25E6]\s*/.test(line)) {
        const highlight = line.replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
        if (highlight) {
          project.highlights!.push(highlight);
        }
      } else {
        descriptionParts.push(line);
      }
    }
    
    if (descriptionParts.length > 0) {
      project.description = descriptionParts.join(' ').substring(0, 500);
    }

    // Extract URLs
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&\/=]*)/gi;
    urlPattern.lastIndex = 0; // Reset regex state
    const urlMatch = block.match(urlPattern);
    if (urlMatch && urlMatch.length > 0) {
      project.url = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
    }

    if (project.name) {
      projects.push(project);
    }
  }
  
  return projects;
}

/**
 * Parses certificates section
 */
export function parseCertificates(content: string): Partial<Certificate>[] {
  const certificates: Partial<Certificate>[] = [];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
    if (!cleanLine) continue;
    
    const certificate: Partial<Certificate> = {
      id: uuidv4()
    };
    
    // Check for issuer pattern "Certificate Name - Issuer" or "Certificate Name, Issuer"
    if (cleanLine.includes(' - ')) {
      const parts = cleanLine.split(' - ');
      certificate.name = parts[0].trim();
      certificate.issuer = parts.slice(1).join(' - ').trim();
    } else if (cleanLine.includes(', ')) {
      const parts = cleanLine.split(', ');
      certificate.name = parts[0].trim();
      certificate.issuer = parts.slice(1).join(', ').trim();
    } else {
      certificate.name = cleanLine;
    }
    
    // Extract date
    const dates = extractDates(cleanLine);
    if (dates.startDate) certificate.date = dates.startDate;
    
    if (certificate.name) {
      certificates.push(certificate);
    }
  }
  
  return certificates;
}

/**
 * Parses languages section
 */
export function parseLanguages(content: string): Partial<Language>[] {
  const languages: Partial<Language>[] = [];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const fluencyPatterns = [
    /native|fluent|professional|intermediate|beginner|basic|advanced|proficient/gi
  ];
  
  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-\*\u2022\u2023\u25E6]\s*/, '').trim();
    if (!cleanLine) continue;
    
    const language: Partial<Language> = {
      id: uuidv4()
    };
    
    // Check for fluency level
    for (const pattern of fluencyPatterns) {
      const match = cleanLine.match(pattern);
      if (match) {
        language.fluency = match[0];
        language.language = cleanLine.replace(pattern, '').replace(/[():\-,]/g, '').trim();
        break;
      }
    }
    
    if (!language.language) {
      // Try splitting by common delimiters
      if (cleanLine.includes(' - ')) {
        const parts = cleanLine.split(' - ');
        language.language = parts[0].trim();
        language.fluency = parts[1]?.trim() || '';
      } else if (cleanLine.includes(':')) {
        const parts = cleanLine.split(':');
        language.language = parts[0].trim();
        language.fluency = parts[1]?.trim() || '';
      } else {
        language.language = cleanLine;
      }
    }
    
    if (language.language) {
      languages.push(language);
    }
  }
  
  return languages;
}

/**
 * Helper: Split content by date patterns to separate entries
 */
function splitByDatePatterns(content: string): string[] {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let hasSeenDate = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines for analysis but keep them in the block
    if (!trimmedLine) {
      currentBlock.push(line);
      continue;
    }
    
    // Check if this line contains a date range
    // Match both full month names and just years (e.g., "2020 - Present" or "January 2020 - December 2023")
    const dateRangePattern = /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}\s*[-–—]\s*(?:(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}|Present|Current)/gi;
    dateRangePattern.lastIndex = 0;
    const hasDateRange = dateRangePattern.test(trimmedLine);
    
    // Track if we've seen a date in the current block
    if (hasDateRange) {
      hasSeenDate = true;
    }
    
    // Check if this looks like the start of a new entry
    // A new entry typically starts with a title line AFTER we've already processed a complete entry (with dates)
    const looksLikeNewEntry = 
      trimmedLine.length < 100 && 
      /^[A-Z]/.test(trimmedLine) &&
      !trimmedLine.includes('•') &&
      !trimmedLine.startsWith('-') &&
      !hasDateRange &&
      currentBlock.length > 0 &&
      hasSeenDate; // Only split if we've already seen a date in the previous entry
    
    if (looksLikeNewEntry) {
      // Save the current block and start a new one
      const blockContent = currentBlock.join('\n').trim();
      if (blockContent) {
        blocks.push(blockContent);
      }
      currentBlock = [line];
      hasSeenDate = false;
    } else {
      currentBlock.push(line);
    }
  }
  
  // Don't forget the last block
  if (currentBlock.length > 0) {
    const blockContent = currentBlock.join('\n').trim();
    if (blockContent) {
      blocks.push(blockContent);
    }
  }
  
  return blocks;
}

/**
 * Helper: Extract dates from text
 */
function extractDates(text: string): { startDate?: string; endDate?: string } {
  const result: { startDate?: string; endDate?: string } = {};
  
  // Look for date range first
  const dateRangePattern = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}\s*[-–—]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|Present|Current)/gi;
  dateRangePattern.lastIndex = 0;
  const rangeMatch = text.match(dateRangePattern);
  if (rangeMatch && rangeMatch.length > 0) {
    const range = rangeMatch[0];
    const parts = range.split(/[-–—]/);
    if (parts.length >= 2) {
      result.startDate = formatDate(parts[0].trim());
      const endPart = parts[1].trim();
      if (/present|current|ongoing|now/gi.test(endPart)) {
        result.endDate = '';
      } else {
        result.endDate = formatDate(endPart);
      }
    }
    return result;
  }
  
  // Look for individual month-year patterns
  const monthYearPattern = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*[,.]?\s*\d{4}/gi;
  monthYearPattern.lastIndex = 0;
  const monthYearMatches = text.match(monthYearPattern);
  if (monthYearMatches) {
    if (monthYearMatches.length >= 2) {
      result.startDate = formatDate(monthYearMatches[0]);
      result.endDate = formatDate(monthYearMatches[1]);
    } else if (monthYearMatches.length === 1) {
      result.startDate = formatDate(monthYearMatches[0]);
    }
  }
  
  // Check for "Present" or "Current"
  if (/present|current|ongoing|now/gi.test(text)) {
    result.endDate = '';
  }
  
  return result;
}

/**
 * Helper: Format date to ISO-like string (YYYY-MM or YYYY)
 */
function formatDate(dateStr: string): string {
  const months: Record<string, string> = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02',
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12'
  };
  
  const cleaned = dateStr.toLowerCase().trim();
  
  // Extract month
  let month = '';
  for (const [key, value] of Object.entries(months)) {
    if (cleaned.includes(key)) {
      month = value;
      break;
    }
  }
  
  // Extract year
  const yearMatch = cleaned.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : '';
  
  if (year && month) {
    return `${year}-${month}`;
  } else if (year) {
    return year;
  }
  
  return dateStr;
}

/**
 * Calculate confidence score for parsed data
 */
export function calculateConfidence(data: ParsedResumeData): {
  overall: number;
  sections: Record<string, number>;
} {
  const sections: Record<string, number> = {};
  let total = 0;
  let count = 0;
  
  // Basics confidence
  if (data.basics) {
    let basicsScore = 0;
    if (data.basics.name) basicsScore += 30;
    if (data.basics.email) basicsScore += 25;
    if (data.basics.phone) basicsScore += 15;
    if (data.basics.label) basicsScore += 15;
    if (data.basics.summary) basicsScore += 15;
    sections.basics = Math.min(100, basicsScore);
    total += sections.basics;
    count++;
  }
  
  // Work confidence
  if (data.work && data.work.length > 0) {
    let workScore = 0;
    for (const exp of data.work) {
      if (exp.position) workScore += 25;
      if (exp.company) workScore += 25;
      if (exp.startDate) workScore += 20;
      if (exp.highlights && exp.highlights.length > 0) workScore += 30;
    }
    sections.work = Math.min(100, workScore / data.work.length);
    total += sections.work;
    count++;
  }
  
  // Education confidence
  if (data.education && data.education.length > 0) {
    let eduScore = 0;
    for (const edu of data.education) {
      if (edu.institution) eduScore += 30;
      if (edu.studyType) eduScore += 25;
      if (edu.area) eduScore += 25;
      if (edu.startDate || edu.endDate) eduScore += 20;
    }
    sections.education = Math.min(100, eduScore / data.education.length);
    total += sections.education;
    count++;
  }
  
  // Skills confidence
  if (data.skills && data.skills.length > 0) {
    sections.skills = Math.min(100, 50 + data.skills.length * 5);
    total += sections.skills;
    count++;
  }
  
  const overall = count > 0 ? Math.round(total / count) : 0;
  
  return { overall, sections };
}
