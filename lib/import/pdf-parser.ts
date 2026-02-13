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
 * PDF Resume Parser
 * Uses server-side API route for PDF parsing to avoid browser compatibility issues.
 */
export class PDFParser implements ResumeParser {
  private apiWarning: string | null = null;
  private readonly requestTimeoutMs = 30000;
  private readonly maxRetries = 2;

  private async parseApiResponse(response: Response): Promise<Record<string, unknown>> {
    try {
      const json = await response.json();
      if (json && typeof json === 'object') {
        return json as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }

  private buildApiErrorMessage(
    result: Record<string, unknown>,
    fallback: string,
  ): string {
    const error = typeof result.error === 'string' ? result.error : fallback;
    const details = typeof result.details === 'string' ? ` ${result.details}` : '';
    const suggestion = typeof result.suggestion === 'string' ? ` ${result.suggestion}` : '';
    return `${error}${details}${suggestion}`.trim();
  }

  private isRetryableStatus(status: number): boolean {
    return status === 408 || status === 425 || status === 429 || status >= 500;
  }

  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    if (error.name === 'AbortError') return true;

    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch failed') ||
      message.includes('failed to fetch')
    );
  }

  private async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Extract text content from a PDF file using server-side API
   */
  async extractText(file: File): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const formData = new FormData();
      formData.append('file', file);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

      try {
        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        const result = await this.parseApiResponse(response);

        if (!response.ok) {
          const error = new Error(
            this.buildApiErrorMessage(result, `Failed to parse PDF: ${response.statusText}`),
          );

          if (attempt < this.maxRetries && this.isRetryableStatus(response.status)) {
            lastError = error;
            await this.wait(250 * (attempt + 1));
            continue;
          }

          throw error;
        }

        if (result.success !== true) {
          throw new Error(
            this.buildApiErrorMessage(result, 'Failed to extract text from PDF'),
          );
        }

        // Store any warnings from the API
        if (typeof result.warning === 'string' && result.warning.trim()) {
          this.apiWarning = result.warning;
        }

        return typeof result.text === 'string' ? result.text : '';
      } catch (error) {
        const normalizedError =
          error instanceof Error ? error : new Error('Unexpected PDF parsing error');

        if (attempt < this.maxRetries && this.isRetryableError(normalizedError)) {
          lastError = normalizedError;
          await this.wait(250 * (attempt + 1));
          continue;
        }

        throw normalizedError;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError || new Error('Failed to extract text from PDF');
  }

  /**
   * Parse a PDF file and extract resume data
   */
  async parse(file: File): Promise<ImportResult> {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Reset API warning
    this.apiWarning = null;
    
    try {
      // Extract text from PDF
      const rawText = await this.extractText(file);
      
      // Add any API warnings
      if (this.apiWarning) {
        warnings.push(this.apiWarning);
      }
      
      if (!rawText.trim()) {
        return {
          success: false,
          data: {},
          confidence: { overall: 0, sections: {} },
          warnings: [],
          errors: ['Could not extract text from PDF. The file may be image-based or encrypted.'],
          rawText: ''
        };
      }
      
      // Parse the extracted text (with preprocessing for PDFs)
      const processedText = preprocessResumeText(rawText, { multiColumn: true });
      const formatInfo = classifyResumeFormat(processedText);
      
      if (formatInfo.format === 'creative' && formatInfo.confidence < 40) {
        warnings.push('This resume uses a non-standard layout. Some sections may not be detected correctly.');
      }
      
      const data = this.parseText(processedText, warnings, formatInfo);
      
      // Calculate confidence scores
      const confidence = calculateConfidence(data);
      
      if (confidence.overall < 20) {
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
        errors: [`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`],
        rawText: ''
      };
    }
  }

  /**
   * Parse extracted text into resume data structure
   */
  private parseText(text: string, warnings: string[], formatInfo?: FormatClassification): ParsedResumeData {
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
    
    // Get the header section (first ~20 lines before any section heading)
    const lines = text.split('\n');
    let headerEndIndex = lines.length;
    
    // Find where the first section starts
    const sections = detectSections(text);
    if (sections.length > 0) {
      headerEndIndex = sections[0].startIndex;
    }
    
    const headerText = lines.slice(0, Math.min(headerEndIndex, 20)).join('\n');
    
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
    
    const contactInfo = extractContactInfo(headerText);
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
          
        // For other sections, add as custom sections
        default:
          // Could add support for awards, publications, etc.
          break;
      }
    }
    
    return data;
  }
}

// Export singleton instance
export const pdfParser = new PDFParser();
