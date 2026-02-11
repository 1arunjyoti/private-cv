/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ImportResult, ResumeParser, ParsedResumeData } from './types';
import { pdfParser } from './pdf-parser';
import { 
  detectSections, 
  extractContactInfo, 
  extractLocation,
  extractDates,
} from './parse-utils';
import { v4 as uuidv4 } from 'uuid';

export class LinkedInPDFParser implements ResumeParser {
  
  async parse(file: File): Promise<ImportResult> {
    try {
      // Reuse existing PDF text extraction
      let rawText = await pdfParser.extractText(file);
      
      // Clean up "Page x of y" footers which are common in LinkedIn PDFs
      rawText = rawText.replace(/Page \d+ of \d+/g, '').replace(/Page \d+/g, '');

      const data: ParsedResumeData = {
        basics: {},
        work: [],
        education: [],
        skills: [],
        projects: [],
        certificates: [],
        languages: [],
      };

      const warnings: string[] = [];

      // Detect sections using the robust hybrid approach
      const sections = detectSections(rawText);
      
      // -- Basics --
      // LinkedIn PDFs usually have the name at the top.
      const lines = rawText.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 0) {
          data.basics = data.basics || {};
          // First line is often the name in LinkedIn PDFs
          data.basics.name = lines[0].trim();
          
          // Next few lines might be headline or location
          // This is a naive heuristic but works for standard LinkedIn PDFs
          if (lines.length > 1) {
            const secondLine = lines[1].trim();
            // Avoid capturing email or simple contact info as headline
            if (!secondLine.includes('@') && secondLine.length < 150 && !/^\+?\d+$/.test(secondLine)) {
               data.basics.label = secondLine;
            }
          }
      }

      // Contact Info
      const contact = extractContactInfo(rawText);
      data.basics = data.basics || {};
      if (contact.email) data.basics.email = contact.email;
      if (contact.phone) data.basics.phone = contact.phone;
      if (contact.linkedin) {
          data.basics.profiles = data.basics.profiles || [];
          data.basics.profiles.push({
              network: 'LinkedIn',
              username: contact.linkedin, 
              url: contact.linkedin
          });
      }
      
      // Location
      // Search in the top part of the resume or contact section
      const headerText = lines.slice(0, 30).join('\n');
      const location = extractLocation(headerText);
      if (location.city || location.country) {
          data.basics.location = {
              city: location.city || '',
              country: location.country || '',
              region: location.region || '',
              postalCode: '',
              address: ''
          };
      }


      // -- Process Sections --
      for (const section of sections) {
        const content = section.content;
        
        switch (section.name) {
          case 'summary':
            data.basics.summary = content.trim();
            break;

          case 'work':
            data.work = this.parseWorkSection(content);
            break;

          case 'education':
            data.education = this.parseEducationSection(content);
            break;
            
          case 'skills':
            data.skills = this.parseSkillsSection(content);
            break;

          case 'certificates':
              data.certificates = this.parseCertificatesSection(content);
              break;
              
           case 'languages':
               data.languages = this.parseLanguagesSection(content);
               break;
               
            case 'projects':
                data.projects = this.parseProjectsSection(content);
                break;
        }
      }

      return {
        success: true,
        data,
        confidence: { overall: 85, sections: {} }, // Good confidence but parsing is heuristic
        warnings,
        errors: [],
        rawText
      };

    } catch (error) {
       return {
          success: false,
          data: {},
          confidence: { overall: 0, sections: {} },
          warnings: [],
          errors: [`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`]
        };
    }
  }

  // --- Section Parsing Logic (Heuristic / Regex based) ---
  
  // LinkedIn PDF format for Work:
  // Position
  // Company Name
  // Dates (Duration)
  // Location
  // Description
  private parseWorkSection(content: string): any[] {
     // Strategy: Split by double newline first. 
     // If that yields few results, try identifying lines starting with Position/Company patterns?
     // Actually, LinkedIn PDFs strongly separate entries with spacing.
     
     const blocks = content.split(/\n\s*\n/);
     
     // Fallback: if blocks are huge, maybe they weren't split correctly.
     // But regex-based splitting on Date ranges is risky without layout info.
     // We will stick to the block approach but refine the processing of each block.

     return blocks.map(block => {
         const lines = block.split('\n').map(l => l.trim()).filter(l => l);
         if (lines.length < 2) return null;

         // Extract dates using helper
         const dates = extractDates(block);
         
         // Heuristic:
         // Line 1: Pattern? Possibly Position
         // Line 2: Company?
         // We check if line 2 is a date. If so, line 1 is likely Company + Position combined or just one?
         // Standard LinkedIn PDF:
         // Line 1: Title
         // Line 2: Company Name
         // Line 3: Date · Duration
         
         const position = lines[0];
         const company = lines[1]; 
         
         // If lines[1] looks like a date range, maybe lines[0] has "Title at Company"?
         // Typically LinkedIn PDF puts them on separate lines.

         // Description is everything after the date line (or line 3 if date not found there)
         // We'll remove the lines that we identified as metadata.
         
         let description = lines.slice(2).join('\n');
         
         // Filter out the date line from description if it made it in there
         // (extractDates finds the string, we should remove it)
         // But extracting exact lines is safer.
         
         if (dates.rawString) {
             description = description.replace(dates.rawString, '').trim();
             // Remove "Location" line if it exists right after date
             // e.g. "San Francisco Bay Area"
             // Hard to distinguish from description text without strict layout.
         }
         
         return {
             id: uuidv4(),
             position: position, 
             company: company,
             startDate: dates.startDate || '',
             endDate: dates.endDate || '',
             summary: description, 
             highlights: []
         };
     }).filter(Boolean);
  }

  private parseEducationSection(content: string): any[] {
      const blocks = content.split(/\n\s*\n/);
       return blocks.map(block => {
         const lines = block.split('\n').map(l => l.trim()).filter(l => l);
         if (lines.length < 1) return null;

         const dates = extractDates(block);
         
         return {
             id: uuidv4(),
             institution: lines[0],
             area: lines.length > 1 ? lines[1] : '',
             startDate: dates.startDate || '',
             endDate: dates.endDate || '',
             summary: lines.slice(2).join('\n'),
         };
     }).filter(Boolean);
  }

  private parseSkillsSection(content: string): any[] {
      // Often a comma-separated list or newlines
      // If it contains "Top Skills", remove it
      const cleanContent = content.replace(/Top Skills/gi, '');
      
      // Also remove category headers often found in LinkedIn PDFs like "Languages", "Certifications" if they leaked in
      // (Though detectSections should handle that)

      // Split by common delimiters
      const skills = cleanContent.split(/,|\n|•/).map(s => s.trim()).filter(s => s && s.length > 1);
      
      // Deduplicate
      const uniqueSkills = Array.from(new Set(skills));
      
      return uniqueSkills.map(name => ({
          id: uuidv4(),
          name,
          keywords: []
      }));
  }

  private parseCertificatesSection(content: string): any[] {
      const blocks = content.split(/\n\s*\n/);
      return blocks.map(block => {
          const lines = block.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length < 1) return null;
          
          const dates = extractDates(block);
          
          return {
              id: uuidv4(),
              name: lines[0],
              issuer: lines.length > 1 ? lines[1] : '',
              date: dates.startDate || '',
              url: '',
          };
      }).filter(Boolean);
  }
  
  private parseLanguagesSection(content: string): any[] {
       const lines = content.split('\n').map(l => l.trim()).filter(l => l);
       return lines.map(line => {
           // Format: "English (Native or Bilingual Proficiency)"
           const match = line.match(/^(.+?)\s*\((.+)\)/);
           if (match) {
               return {
                   id: uuidv4(),
                   language: match[1].trim(),
                   fluency: match[2].trim()
               };
           }
           return {
               id: uuidv4(),
               language: line,
               fluency: ''
           };
       });
  }

    private parseProjectsSection(content: string): any[] {
      const blocks = content.split(/\n\s*\n/);
      return blocks.map(block => {
          const lines = block.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length < 1) return null;
          
           const dates = extractDates(block);

          return {
              id: uuidv4(),
              name: lines[0],
              description: lines.slice(1).join('\n'),
              startDate: dates.startDate || '',
              endDate: dates.endDate || '',
              keywords: [],
              highlights: []
          };
      }).filter(Boolean);
  }
}

// Export singleton
export const linkedInPDFParser = new LinkedInPDFParser();
