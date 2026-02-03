import { v4 as uuidv4 } from 'uuid';
import type { Resume } from '@/db';
import type { 
  ImportResult, 
  FileTypeResult,
  ParsedResumeData 
} from './types';
import { pdfParser } from './pdf-parser';
import { docxParser } from './docx-parser';

/**
 * Import Service
 * Orchestrates the import process for different file formats
 */
export class ImportService {
  /**
   * Detect file type from file object
   */
  detectFileType(file: File): FileTypeResult {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    // Check by extension first
    if (extension === 'pdf' || mimeType === 'application/pdf') {
      return { format: 'pdf', mimeType: 'application/pdf', isValid: true };
    }
    
    if (
      extension === 'docx' || 
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return { 
        format: 'docx', 
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        isValid: true 
      };
    }
    
    if (extension === 'json' || mimeType === 'application/json') {
      return { format: 'json', mimeType: 'application/json', isValid: true };
    }
    
    return { format: 'json', mimeType: '', isValid: false };
  }

  /**
   * Import resume from file
   */
  async importFromFile(file: File): Promise<ImportResult> {
    const fileType = this.detectFileType(file);
    
    if (!fileType.isValid) {
      return {
        success: false,
        data: {},
        confidence: { overall: 0, sections: {} },
        warnings: [],
        errors: [`Unsupported file format: ${file.name}. Please use PDF, DOCX, or JSON files.`]
      };
    }
    
    switch (fileType.format) {
      case 'pdf':
        return pdfParser.parse(file);
        
      case 'docx':
        return docxParser.parse(file);
        
      case 'json':
        return this.parseJSON(file);
        
      default:
        return {
          success: false,
          data: {},
          confidence: { overall: 0, sections: {} },
          warnings: [],
          errors: ['Unknown file format']
        };
    }
  }

  /**
   * Parse JSON resume file
   */
  private async parseJSON(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      
      // Validate basic structure
      if (!parsed.basics && !parsed.work && !parsed.education) {
        return {
          success: false,
          data: {},
          confidence: { overall: 0, sections: {} },
          warnings: [],
          errors: ['Invalid resume JSON format. Expected JSON Resume format with basics, work, or education fields.']
        };
      }
      
      // Map to our data structure
      const data: ParsedResumeData = {
        basics: parsed.basics || {},
        work: (parsed.work || []).map((w: Record<string, unknown>) => ({
          ...w,
          id: (w.id as string) || uuidv4()
        })),
        education: (parsed.education || []).map((e: Record<string, unknown>) => ({
          ...e,
          id: (e.id as string) || uuidv4()
        })),
        skills: (parsed.skills || []).map((s: Record<string, unknown>) => ({
          ...s,
          id: (s.id as string) || uuidv4()
        })),
        projects: (parsed.projects || []).map((p: Record<string, unknown>) => ({
          ...p,
          id: (p.id as string) || uuidv4()
        })),
        certificates: (parsed.certificates || []).map((c: Record<string, unknown>) => ({
          ...c,
          id: (c.id as string) || uuidv4()
        })),
        languages: (parsed.languages || []).map((l: Record<string, unknown>) => ({
          ...l,
          id: (l.id as string) || uuidv4()
        })),
        interests: (parsed.interests || []).map((i: Record<string, unknown>) => ({
          ...i,
          id: (i.id as string) || uuidv4()
        })),
        publications: (parsed.publications || []).map((p: Record<string, unknown>) => ({
          ...p,
          id: (p.id as string) || uuidv4()
        })),
        awards: (parsed.awards || []).map((a: Record<string, unknown>) => ({
          ...a,
          id: (a.id as string) || uuidv4()
        })),
        references: (parsed.references || []).map((r: Record<string, unknown>) => ({
          ...r,
          id: (r.id as string) || uuidv4()
        })),
        custom: parsed.custom || []
      };
      
      return {
        success: true,
        data,
        confidence: { overall: 100, sections: { basics: 100, work: 100, education: 100 } },
        warnings: [],
        errors: [],
        rawText: text
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        confidence: { overall: 0, sections: {} },
        warnings: [],
        errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`]
      };
    }
  }

  /**
   * Merge parsed data with existing resume
   */
  mergeWithResume(
    existingResume: Resume,
    parsedData: ParsedResumeData,
    options: {
      replaceBasics?: boolean;
      replaceWork?: boolean;
      replaceEducation?: boolean;
      replaceSkills?: boolean;
      replaceProjects?: boolean;
      replaceCertificates?: boolean;
      replaceLanguages?: boolean;
      replaceInterests?: boolean;
      replacePublications?: boolean;
      replaceAwards?: boolean;
      replaceReferences?: boolean;
      replaceCustom?: boolean;
    } = {}
  ): Resume {
    // Default to replacing all sections
    const mergeOptions = {
      replaceBasics: true,
      replaceWork: true,
      replaceEducation: true,
      replaceSkills: true,
      replaceProjects: true,
      replaceCertificates: true,
      replaceLanguages: true,
      replaceInterests: true,
      replacePublications: true,
      replaceAwards: true,
      replaceReferences: true,
      replaceCustom: true,
      ...options
    };

    const updated: Resume = {
      ...existingResume,
      meta: {
        ...existingResume.meta,
        lastModified: new Date().toISOString()
      }
    };

    // Merge basics
    if (mergeOptions.replaceBasics && parsedData.basics) {
      updated.basics = {
        ...existingResume.basics,
        ...parsedData.basics,
        location: {
          ...existingResume.basics.location,
          ...(parsedData.basics.location || {})
        },
        profiles: parsedData.basics.profiles && parsedData.basics.profiles.length > 0
          ? parsedData.basics.profiles as Resume['basics']['profiles']
          : existingResume.basics.profiles
      };
    }

    // Merge arrays - ensure IDs are present
    if (mergeOptions.replaceWork && parsedData.work && parsedData.work.length > 0) {
      updated.work = parsedData.work.map(w => ({
        id: w.id || uuidv4(),
        name: w.name || '',
        location: w.location || '',
        company: w.company || '',
        position: w.position || '',
        url: w.url || '',
        startDate: w.startDate || '',
        endDate: w.endDate || '',
        summary: w.summary || '',
        highlights: w.highlights || []
      }));
    }

    if (mergeOptions.replaceEducation && parsedData.education && parsedData.education.length > 0) {
      updated.education = parsedData.education.map(e => ({
        id: e.id || uuidv4(),
        institution: e.institution || '',
        url: e.url || '',
        area: e.area || '',
        studyType: e.studyType || '',
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        score: e.score || '',
        summary: e.summary,
        courses: e.courses || []
      }));
    }

    if (mergeOptions.replaceSkills && parsedData.skills && parsedData.skills.length > 0) {
      updated.skills = parsedData.skills.map(s => ({
        id: s.id || uuidv4(),
        name: s.name || '',
        level: s.level || '',
        keywords: s.keywords || []
      }));
    }

    if (mergeOptions.replaceProjects && parsedData.projects && parsedData.projects.length > 0) {
      updated.projects = parsedData.projects.map(p => ({
        id: p.id || uuidv4(),
        name: p.name || '',
        description: p.description || '',
        highlights: p.highlights || [],
        keywords: p.keywords || [],
        startDate: p.startDate || '',
        endDate: p.endDate || '',
        url: p.url || ''
      }));
    }

    if (mergeOptions.replaceCertificates && parsedData.certificates && parsedData.certificates.length > 0) {
      updated.certificates = parsedData.certificates.map(c => ({
        id: c.id || uuidv4(),
        name: c.name || '',
        issuer: c.issuer || '',
        date: c.date || '',
        url: c.url || '',
        summary: c.summary || ''
      }));
    }

    if (mergeOptions.replaceLanguages && parsedData.languages && parsedData.languages.length > 0) {
      updated.languages = parsedData.languages.map(l => ({
        id: l.id || uuidv4(),
        language: l.language || '',
        fluency: l.fluency || ''
      }));
    }

    if (mergeOptions.replaceInterests && parsedData.interests && parsedData.interests.length > 0) {
      updated.interests = parsedData.interests.map(i => ({
        id: i.id || uuidv4(),
        name: i.name || '',
        keywords: i.keywords || []
      }));
    }

    if (mergeOptions.replacePublications && parsedData.publications && parsedData.publications.length > 0) {
      updated.publications = parsedData.publications.map(p => ({
        id: p.id || uuidv4(),
        name: p.name || '',
        publisher: p.publisher || '',
        releaseDate: p.releaseDate || '',
        url: p.url || '',
        summary: p.summary || ''
      }));
    }

    if (mergeOptions.replaceAwards && parsedData.awards && parsedData.awards.length > 0) {
      updated.awards = parsedData.awards.map(a => ({
        id: a.id || uuidv4(),
        title: a.title || '',
        date: a.date || '',
        awarder: a.awarder || '',
        summary: a.summary || ''
      }));
    }

    if (mergeOptions.replaceReferences && parsedData.references && parsedData.references.length > 0) {
      updated.references = parsedData.references.map(r => ({
        id: r.id || uuidv4(),
        name: r.name || '',
        position: r.position || '',
        reference: r.reference || ''
      }));
    }

    if (mergeOptions.replaceCustom && parsedData.custom && parsedData.custom.length > 0) {
      updated.custom = parsedData.custom.map(c => ({
        id: c.id || uuidv4(),
        name: c.name || '',
        items: c.items || []
      }));
    }

    return updated;
  }
}

// Export singleton instance
export const importService = new ImportService();

// Re-export types
export type { ImportResult, ImportFormat, ParsedResumeData } from './types';
