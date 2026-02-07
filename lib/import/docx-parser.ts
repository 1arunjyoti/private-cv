import mammoth from 'mammoth';
import type { ImportResult, ResumeParser, ParsedResumeData } from './types';
import { preprocessResumeText } from './preprocess';
import { classifyResumeFormat } from './format-classifier';
import type { FormatClassification } from './format-classifier';
import {
  detectSections,
  extractContactInfo,
  extractName,
  extractTitle,
  extractLocation,
  parseWorkExperience,
  parseEducation,
  parseSkills,
  parseProjects,
  parseCertificates,
  parseLanguages,
  calculateConfidence
} from './parse-utils';

/**
 * DOCX Resume Parser
 * Extracts text from DOCX files and parses resume data
 * DOCX files typically have better structure preservation than PDFs
 */
export class DOCXParser implements ResumeParser {
  /**
   * Extract text content from a DOCX file
   */
  async extractText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth to extract text
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return result.value;
  }

  /**
   * Extract HTML content from a DOCX file (preserves more structure)
   */
  async extractHtml(file: File): Promise<{ html: string; messages: string[] }> {
    const arrayBuffer = await file.arrayBuffer();
    
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      styleMap: [
        "b => strong",
        "i => em",
        "u => u",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ]
    });
    
    return {
      html: result.value,
      messages: result.messages.map(m => m.message)
    };
  }

  /**
   * Parse a DOCX file and extract resume data
   */
  async parse(file: File): Promise<ImportResult> {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    try {
      // Extract both text and HTML for better parsing
      const rawText = await this.extractText(file);
      const { html, messages } = await this.extractHtml(file);
      
      // Add mammoth warnings
      for (const msg of messages) {
        if (msg.toLowerCase().includes('warning')) {
          warnings.push(msg);
        }
      }
      
      if (!rawText.trim()) {
        return {
          success: false,
          data: {},
          confidence: { overall: 0, sections: {} },
          warnings: [],
          errors: ['Could not extract text from DOCX file. The file may be corrupted or empty.'],
          rawText: ''
        };
      }
      
      // Parse the extracted text (DOCX - no multi-column reorder needed)
      const processedText = preprocessResumeText(rawText, { multiColumn: false });
      const formatInfo = classifyResumeFormat(processedText);
      
      if (formatInfo.format === 'creative' && formatInfo.confidence < 40) {
        warnings.push('This resume uses a non-standard layout. Some sections may not be detected correctly.');
      }

      const data = this.parseText(processedText, html, warnings, formatInfo);
      
      // Calculate confidence scores
      const confidence = calculateConfidence(data);
      
      // DOCX files typically parse better
      if (confidence.overall < 30) {
        warnings.push('Low confidence in parsed data. Please review carefully.');
      }
      
      return {
        success: true,
        data,
        confidence,
        warnings,
        errors,
        rawText
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        confidence: { overall: 0, sections: {} },
        warnings,
        errors: [`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`],
        rawText: ''
      };
    }
  }

  /**
   * Parse extracted text into resume data structure
   */
  private parseText(text: string, html: string, warnings: string[], formatInfo?: FormatClassification): ParsedResumeData {
    const data: ParsedResumeData = {
      basics: {
        profiles: []
      },
      work: [],
      education: [],
      skills: [],
      projects: [],
      certificates: [],
      languages: [],
      interests: [],
      publications: [],
      awards: [],
      references: [],
      custom: []
    };
    
    // Get the header section (text before any section heading)
    const lines = text.split('\n');
    let headerEndIndex = lines.length;
    
    // Find where the first section starts
    const sections = detectSections(text);
    if (sections.length > 0) {
      headerEndIndex = sections[0].startIndex;
    }
    
    const headerText = lines.slice(0, Math.min(headerEndIndex, 15)).join('\n');
    
    // Extract basic info from header
    const name = extractName(headerText);
    if (name) {
      data.basics!.name = name;
    } else {
      warnings.push('Could not detect name. Please enter manually.');
    }
    
    const title = extractTitle(headerText);
    if (title) {
      data.basics!.label = title;
    }
    
    // Look for contact info in entire document (sometimes at bottom)
    const contactInfo = extractContactInfo(text);
    if (contactInfo.email) {
      data.basics!.email = contactInfo.email;
    }
    if (contactInfo.phone) {
      data.basics!.phone = contactInfo.phone;
    }
    if (contactInfo.url) {
      data.basics!.url = contactInfo.url;
    }
    
    // Add social profiles
    if (contactInfo.linkedin) {
      data.basics!.profiles!.push({
        network: 'LinkedIn',
        username: contactInfo.linkedin.replace(/.*linkedin\.com\/in\//i, '').replace(/\/$/, ''),
        url: contactInfo.linkedin
      });
    }
    if (contactInfo.github) {
      data.basics!.profiles!.push({
        network: 'GitHub',
        username: contactInfo.github.replace(/.*github\.com\//i, '').replace(/\/$/, ''),
        url: contactInfo.github
      });
    }
    
    const location = extractLocation(headerText);
    if (location.city || location.country || location.region) {
      data.basics!.location = {
        city: location.city || '',
        country: location.country || '',
        region: location.region || '',
        postalCode: '',
        address: ''
      };
    }
    
    // Try to extract additional structure from HTML
    
    // Parse each detected section
    for (const section of sections) {
      switch (section.name) {
        case 'summary':
          data.basics!.summary = section.content.substring(0, 1000);
          break;
          
        case 'work':
          data.work = parseWorkExperience(section.content);
          if (!data.work || data.work.length === 0) {
            warnings.push('Could not parse work experience entries.');
          }
          break;
          
        case 'education':
          data.education = parseEducation(section.content);
          if (!data.education || data.education.length === 0) {
            warnings.push('Could not parse education entries.');
          }
          break;
          
        case 'skills':
          data.skills = parseSkills(section.content);
          break;
          
        case 'projects':
          data.projects = parseProjects(section.content);
          break;
          
        case 'certificates':
          data.certificates = parseCertificates(section.content);
          break;
          
        case 'languages':
          data.languages = parseLanguages(section.content);
          break;
          
        default:
          break;
      }
    }
    
    return data;
  }

  /**
   * Extract section headings from HTML for better structure detection
   */
  private extractHeadingsFromHtml(html: string): string[] {
    const headings: string[] = [];
    
    // Match h1, h2, h3 tags
    const headingRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi;
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      // Strip HTML tags from heading content
      const heading = match[1].replace(/<[^>]*>/g, '').trim();
      if (heading) {
        headings.push(heading);
      }
    }
    
    // Also look for bold text that might be headings
    const strongRegex = /<strong>(.*?)<\/strong>/gi;
    while ((match = strongRegex.exec(html)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      // Only add if it looks like a heading (short, capitalized)
      if (text && text.length < 50 && /^[A-Z]/.test(text)) {
        headings.push(text);
      }
    }
    
    return headings;
  }
}

// Export singleton instance
export const docxParser = new DOCXParser();
