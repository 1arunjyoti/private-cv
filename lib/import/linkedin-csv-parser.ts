
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import type { ImportResult, ResumeParser, ParsedResumeData } from './types';

export class LinkedInCSVParser implements ResumeParser {
  
  async parse(file: File): Promise<ImportResult> {
    const isZip = file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
    
    if (isZip) {
      return this.parseZip(file);
    } else if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
      return this.parseSingleCSV(file);
    }

    return {
      success: false,
      data: {},
      confidence: { overall: 0, sections: {} },
      warnings: [],
      errors: [`Unsupported file format: ${file.name}. Please upload a ZIP export or CSV file from LinkedIn.`]
    };
  }

  private async parseZip(file: File): Promise<ImportResult> {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
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
      let foundAny = false;

      // Helper to find file case-insensitively
      const findFile = (name: string) => {
        const regex = new RegExp(`^${name}$`, 'i');
        return Object.keys(contents.files).find(key => regex.test(key));
      };

      // Profile (Basics)
      const profileFile = findFile('Profile.csv');
      if (profileFile) {
        const text = await contents.files[profileFile].async('text');
        this.parseProfileCSV(text, data);
        foundAny = true;
      }

      // Positions (Work)
      const positionsFile = findFile('Positions.csv');
      if (positionsFile) {
        const text = await contents.files[positionsFile].async('text');
        this.parsePositionsCSV(text, data);
        foundAny = true;
      }

      // Education
      const educationFile = findFile('Education.csv');
      if (educationFile) {
        const text = await contents.files[educationFile].async('text');
        this.parseEducationCSV(text, data);
        foundAny = true;
      }

      // Skills
      const skillsFile = findFile('Skills.csv');
      if (skillsFile) {
        const text = await contents.files[skillsFile].async('text');
        this.parseSkillsCSV(text, data);
        foundAny = true;
      }

      // Projects
      const projectsFile = findFile('Projects.csv');
      if (projectsFile) {
        const text = await contents.files[projectsFile].async('text');
        this.parseProjectsCSV(text, data);
        foundAny = true;
      }

      // Certifications
      const certsFile = findFile('Certifications.csv');
      if (certsFile) {
        const text = await contents.files[certsFile].async('text');
        this.parseCertificationsCSV(text, data);
        foundAny = true;
      }
      
      // Languages
      const languagesFile = findFile('Languages.csv');
      if (languagesFile) {
        const text = await contents.files[languagesFile].async('text');
        this.parseLanguagesCSV(text, data);
        foundAny = true;
      }

      if (!foundAny) {
        return {
          success: false,
          data: {},
          confidence: { overall: 0, sections: {} },
          warnings: [],
          errors: ['No recognized LinkedIn CSV files found in the ZIP archive.']
        };
      }

      return {
        success: true,
        data,
        confidence: { overall: 100, sections: {} }, // High confidence for structured data
        warnings,
        errors: []
      };

    } catch (error) {
       return {
          success: false,
          data: {},
          confidence: { overall: 0, sections: {} },
          warnings: [],
          errors: [`Failed to parse ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`]
        };
    }
  }

  private async parseSingleCSV(file: File): Promise<ImportResult> {
     const text = await file.text();
     const data: ParsedResumeData = {};
     const lowerName = file.name.toLowerCase();

     if (lowerName.includes('profile')) {
         this.parseProfileCSV(text, data);
     } else if (lowerName.includes('position')) {
         this.parsePositionsCSV(text, data);
     } else if (lowerName.includes('education')) {
         this.parseEducationCSV(text, data);
     } else if (lowerName.includes('skill')) {
         this.parseSkillsCSV(text, data);
     } else if (lowerName.includes('project')) {
         this.parseProjectsCSV(text, data);
     } else if (lowerName.includes('certification')) {
         this.parseCertificationsCSV(text, data);
     } else if (lowerName.includes('language')) {
         this.parseLanguagesCSV(text, data);
     } else {
         return {
            success: false,
            data: {},
            confidence: { overall: 0, sections: {} },
            warnings: [],
            errors: [`Could not identify the type of LinkedIn CSV file: ${file.name}`]
         };
     }

     return {
        success: true,
        data,
        confidence: { overall: 100, sections: {} },
        warnings: [],
        errors: []
     };
  }

  // --- CSV Parsing Helpers ---

  private parseCSV(text: string): Record<string, string>[] {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const results: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === 0) continue;
        
        const entry: Record<string, string> = {};
        headers.forEach((header, index) => {
            entry[header] = values[index] ? this.decodeHtml(values[index]) : '';
        });
        results.push(entry);
    }
    return results;
  }

  private parseCSVLine(line: string): string[] {
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
              if (insideQuotes && line[i + 1] === '"') {
                  currentValue += '"';
                  i++; // iterate one extra
              } else {
                  insideQuotes = !insideQuotes;
              }
          } else if (char === ',' && !insideQuotes) {
              values.push(currentValue);
              currentValue = '';
          } else {
              currentValue += char;
          }
      }
      values.push(currentValue);
      return values;
  }
  
  private decodeHtml(html: string): string {
      return html
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'");
  }

  // Use fuzzy matching for column headers as LinkedIn changes them
  private findColumn(record: Record<string, string>, possibleNames: string[]): string {
      const keys = Object.keys(record);
      for (const name of possibleNames) {
          // Exact match
          if (record[name] !== undefined) return record[name];
          
          // Case insensitive match
          const key = keys.find(k => k.toLowerCase() === name.toLowerCase());
          if (key) return record[key];
      }
      return '';
  }

  // --- Section Parsers ---

  private parseProfileCSV(text: string, data: ParsedResumeData) {
      const records = this.parseCSV(text);
      if (records.length === 0) return;
      const profile = records[0];

      data.basics = data.basics || {};
      const firstName = this.findColumn(profile, ['First Name']);
      const lastName = this.findColumn(profile, ['Last Name']);
      
      data.basics.name = `${firstName} ${lastName}`.trim();
      data.basics.label = this.findColumn(profile, ['Headline']);
      data.basics.location = {
          city: '',
          country: this.findColumn(profile, ['Country/Region', 'Country']),
          region: '', 
          address: '',
          postalCode: this.findColumn(profile, ['Postal Code', 'Zip Code'])
      };
      data.basics.summary = this.findColumn(profile, ['Summary']);
      
      // Approximate location parsing
      const locationStr = this.findColumn(profile, ['Location']);
      if (locationStr) {
          const parts = locationStr.split(',').map(s => s.trim());
          if (parts.length > 0) data.basics.location.city = parts[0];
          if (parts.length > 1) data.basics.location.region = parts[1];
      }
      
      // Extract email/phone/websites if available in Profile (sometimes they are)
       const email = this.findColumn(profile, ['Email Address', 'Email']);
       if (email) data.basics.email = email;
       
       const phone = this.findColumn(profile, ['Phone Number', 'Phone']);
       if (phone) data.basics.phone = phone;
       
       const websites = this.findColumn(profile, ['Websites', 'Website']);
       if (websites) {
           const urls = websites.split(',').map(u => u.trim());
           if (urls.length > 0) data.basics.url = urls[0];
       }
  }

  private parsePositionsCSV(text: string, data: ParsedResumeData) {
      const records = this.parseCSV(text);
      data.work = records.map(r => ({
          id: uuidv4(),
          company: this.findColumn(r, ['Company Name', 'Company']),
          position: this.findColumn(r, ['Title']),
          summary: this.findColumn(r, ['Description', 'Summary']),
          location: this.findColumn(r, ['Location']),
          startDate: this.formatDate(this.findColumn(r, ['Started On', 'Start Date'])),
          endDate: this.formatDate(this.findColumn(r, ['Finished On', 'End Date'])),
          highlights: [],
          url: ''
      }));
  }

  private parseEducationCSV(text: string, data: ParsedResumeData) {
      const records = this.parseCSV(text);
      data.education = records.map(r => ({
          id: uuidv4(),
          institution: this.findColumn(r, ['School Name', 'School']),
          area: this.findColumn(r, ['Degree Name', 'Degree']),
          studyType: '', 
          startDate: this.formatDate(this.findColumn(r, ['Start Date', 'Started On'])),
          endDate: this.formatDate(this.findColumn(r, ['End Date', 'Finished On'])),
          summary: this.findColumn(r, ['Notes']),
          courses: [],
          url: '',
          score: ''
      }));
  }

  private parseSkillsCSV(text: string, data: ParsedResumeData) {
      const records = this.parseCSV(text);
      data.skills = records.map(r => ({
          id: uuidv4(),
          name: this.findColumn(r, ['Name']),
          keywords: []
      }));
  }

  private parseProjectsCSV(text: string, data: ParsedResumeData) {
      const records = this.parseCSV(text);
      data.projects = records.map(r => ({
          id: uuidv4(),
          name: this.findColumn(r, ['Title']),
          description: this.findColumn(r, ['Description']),
          startDate: this.formatDate(this.findColumn(r, ['Start Date'])),
          endDate: this.formatDate(this.findColumn(r, ['End Date'])),
          url: this.findColumn(r, ['Url']),
          highlights: [],
          keywords: []
      }));
  }
  
  private parseCertificationsCSV(text: string, data: ParsedResumeData) {
      const records = this.parseCSV(text);
      data.certificates = records.map(r => ({
          id: uuidv4(),
          name: this.findColumn(r, ['Name']),
          issuer: this.findColumn(r, ['Authority']),
          date: this.formatDate(this.findColumn(r, ['Started On', 'Start Date'])),
          url: this.findColumn(r, ['Url']),
          summary: this.findColumn(r, ['License Number']) ? `License: ${this.findColumn(r, ['License Number'])}` : ''
      }));
  }

  private parseLanguagesCSV(text: string, data: ParsedResumeData) {
      const records = this.parseCSV(text);
      data.languages = records.map(r => ({
          id: uuidv4(),
          language: this.findColumn(r, ['Name']),
          fluency: this.findColumn(r, ['Proficiency'])
      }));
  }

  private formatDate(dateStr: string): string {
      if (!dateStr) return '';
      
      // Try to parse "Jan 2020" to "2020-01"
      try {
          // If it's already YYYY-MM or YYYY-MM-DD, leave it
          if (/^\d{4}-\d{2}/.test(dateStr)) return dateStr;

          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
             const year = date.getFullYear();
             const month = (date.getMonth() + 1).toString().padStart(2, '0');
             return `${year}-${month}`;
          }
      } catch (e) {
          // ignore
      }
      
      return dateStr;
  }
}

export const linkedInCSVParser = new LinkedInCSVParser();
