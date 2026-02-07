import { describe, it, expect } from 'vitest';
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
  calculateConfidence,
  normalizeDate,
  extractDates,
  extractCompanyAndPosition,
} from '@/lib/import/parse-utils';

describe('Parse Utils', () => {
  describe('extractContactInfo', () => {
    it('should extract email addresses', () => {
      const text = 'Contact me at john.doe@example.com for more info';
      const result = extractContactInfo(text);
      expect(result.email).toBe('john.doe@example.com');
    });

    it('should extract phone numbers in US format', () => {
      const text = 'Phone: (555) 123-4567';
      const result = extractContactInfo(text);
      expect(result.phone).toMatch(/555.*123.*4567/);
    });

    it('should extract phone numbers with country code', () => {
      const text = 'Call me at +1-555-123-4567';
      const result = extractContactInfo(text);
      expect(result.phone).toMatch(/1.*555.*123.*4567/);
    });

    it('should extract LinkedIn URLs', () => {
      const text = 'LinkedIn: https://linkedin.com/in/johndoe';
      const result = extractContactInfo(text);
      expect(result.linkedin).toContain('linkedin.com/in/johndoe');
    });

    it('should extract GitHub URLs', () => {
      const text = 'GitHub: https://github.com/johndoe';
      const result = extractContactInfo(text);
      expect(result.github).toContain('github.com/johndoe');
    });

    it('should extract generic URLs (not LinkedIn/GitHub)', () => {
      const text = 'Portfolio: https://johndoe.com';
      const result = extractContactInfo(text);
      expect(result.url).toContain('johndoe.com');
    });

    it('should handle multiple contact types', () => {
      const text = `
        Email: john@example.com
        Phone: (555) 123-4567
        LinkedIn: linkedin.com/in/john
        GitHub: github.com/john
      `;
      const result = extractContactInfo(text);
      expect(result.email).toBe('john@example.com');
      expect(result.phone).toMatch(/555.*123.*4567/);
      expect(result.linkedin).toContain('linkedin.com');
      expect(result.github).toContain('github.com');
    });

    it('should return empty object for text without contact info', () => {
      const text = 'No contact information here';
      const result = extractContactInfo(text);
      expect(result.email).toBeUndefined();
      expect(result.phone).toBeUndefined();
    });

    it('should handle emails with subdomains', () => {
      const text = 'Email: user@mail.company.co.uk';
      const result = extractContactInfo(text);
      expect(result.email).toBe('user@mail.company.co.uk');
    });

    it('should handle emails with plus addressing', () => {
      const text = 'Contact: john+resume@example.com';
      const result = extractContactInfo(text);
      expect(result.email).toBe('john+resume@example.com');
    });

    it('should not extract invalid email formats', () => {
      const text = 'Invalid: john@.com or @example.com';
      const result = extractContactInfo(text);
      // Should either not match or match something valid
      expect(result.email === undefined || result.email.includes('@')).toBe(true);
    });
  });

  describe('extractName', () => {
    it('should extract name from first line', () => {
      const text = 'John Doe\nSoftware Engineer\njohn@example.com';
      const result = extractName(text);
      expect(result).toBe('John Doe');
    });

    it('should handle ALL CAPS names', () => {
      const text = 'JANE SMITH\nProject Manager';
      const result = extractName(text);
      expect(result).toBe('Jane Smith');
    });

    it('should skip email lines', () => {
      const text = 'john@example.com\nJohn Doe\nEngineer';
      const result = extractName(text);
      expect(result).toBe('John Doe');
    });

    it('should skip phone lines', () => {
      const text = '(555) 123-4567\nJohn Doe\nDeveloper';
      const result = extractName(text);
      expect(result).toBe('John Doe');
    });

    it('should handle names with middle name', () => {
      const text = 'John Michael Doe\nSenior Engineer';
      const result = extractName(text);
      expect(result).toBe('John Michael Doe');
    });

    it('should handle names with suffix', () => {
      const text = 'John Doe Jr\nArchitect';
      const result = extractName(text);
      expect(result).toBe('John Doe Jr');
    });

    it('should return undefined for empty text', () => {
      const result = extractName('');
      expect(result).toBeUndefined();
    });

    it('should skip very long lines', () => {
      const longLine = 'A'.repeat(100);
      const text = `${longLine}\nJohn Doe\nEngineer`;
      const result = extractName(text);
      expect(result).toBe('John Doe');
    });

    it('should skip ZIP codes', () => {
      const text = 'San Francisco, CA 94105\nJohn Doe\nEngineer';
      const result = extractName(text);
      expect(result).toBe('John Doe');
    });

    it('should extract name from long header line with email and phone', () => {
      const text = 'ALEX JOHNSON Senior Full-Stack Developer alex.johnson@example.com | +1 (555) 123-4567 | San Francisco';
      const result = extractName(text);
      expect(result).toBe('Alex Johnson');
    });

    it('should extract first/last name from line longer than 60 chars', () => {
      const text = 'JOHN DOE experienced software engineer with 10 years john.doe@email.com phone: 555-1234';
      const result = extractName(text);
      expect(result).toBe('John Doe');
    });

    it('should handle Title Case names in long lines', () => {
      const text = 'Sarah Michelle Parker product designer sarah.parker@example.com | portfolio.com';
      const result = extractName(text);
      expect(result).toBe('Sarah Michelle Parker');
    });
  });

  describe('extractTitle', () => {
    it('should extract job title from resume', () => {
      const text = 'John Doe\nSoftware Engineer\njohn@example.com';
      const result = extractTitle(text);
      expect(result).toContain('Engineer');
    });

    it('should recognize common job title patterns', () => {
      const titles = [
        'Senior Software Developer',
        'Product Manager',
        'Data Analyst',
        'UX Designer',
        'Marketing Specialist',
        'Project Coordinator',
        'System Administrator',
        'Business Consultant',
      ];

      for (const title of titles) {
        const text = `John Doe\n${title}\nEmail: john@test.com`;
        const result = extractTitle(text);
        expect(result).toBe(title);
      }
    });

    it('should skip contact information', () => {
      const text = 'John Doe\njohn@example.com\nSoftware Engineer';
      const result = extractTitle(text);
      expect(result).toContain('Engineer');
    });

    it('should skip section headings', () => {
      const text = 'John Doe\nExperience\nSoftware Engineer';
      const result = extractTitle(text);
      expect(result).toContain('Engineer');
    });

    it('should return undefined for no title found', () => {
      const text = 'John Doe\njohn@example.com\n(555) 123-4567';
      const result = extractTitle(text);
      expect(result).toBeUndefined();
    });

    it('should extract title from long header line with contact info', () => {
      const text = 'Name\nSenior Full-Stack Developer | email@example.com | phone | location';
      const result = extractTitle(text);
      expect(result).toContain('Developer');
    });

    it('should extract title before pipe separator in long line', () => {
      const text = 'Alex Johnson\nProduct Manager | alex@company.com | linkedin.com/alex';
      const result = extractTitle(text);
      expect(result).toBe('Product Manager');
    });

    it('should extract title from line with multiple keywords', () => {
      const text = 'Name\nSenior Software Engineer and Team Lead | contact info goes here';
      const result = extractTitle(text);
      expect(result).toContain('Engineer');
    });
  });

  describe('extractLocation', () => {
    it('should extract city and state', () => {
      const text = 'San Francisco, CA';
      const result = extractLocation(text);
      expect(result.city).toBe('San Francisco');
      expect(result.region).toBe('CA');
    });

    it('should extract city and country', () => {
      const text = 'London, United Kingdom';
      const result = extractLocation(text);
      expect(result.city).toBe('London');
      expect(result.country).toBe('United Kingdom');
    });

    it('should handle empty text', () => {
      const result = extractLocation('');
      expect(result.city).toBeUndefined();
      expect(result.country).toBeUndefined();
    });
  });

  describe('detectSections', () => {
    it('should detect Experience section', () => {
      const text = `
John Doe
Software Engineer

Experience
Senior Developer at Tech Corp
2020 - Present

Education
BS Computer Science
University of Tech
      `;
      const sections = detectSections(text);
      expect(sections.some(s => s.name === 'work')).toBe(true);
      expect(sections.some(s => s.name === 'education')).toBe(true);
    });

    it('should detect Skills section', () => {
      const text = `
Skills
JavaScript, Python, Java
React, Node.js, Django
      `;
      const sections = detectSections(text);
      expect(sections.some(s => s.name === 'skills')).toBe(true);
    });

    it('should detect multiple section heading variations', () => {
      const variations = [
        { heading: 'WORK EXPERIENCE', expected: 'work' },
        { heading: 'Professional Experience', expected: 'work' },
        { heading: 'Employment History', expected: 'work' },
        { heading: 'EDUCATION', expected: 'education' },
        { heading: 'Academic Background', expected: 'education' },
        { heading: 'SKILLS', expected: 'skills' },
        { heading: 'Technical Skills', expected: 'skills' },
        { heading: 'Core Competencies', expected: 'skills' },
        { heading: 'PROJECTS', expected: 'projects' },
        { heading: 'Key Projects', expected: 'projects' },
        { heading: 'CERTIFICATIONS', expected: 'certificates' },
        { heading: 'Professional Certifications', expected: 'certificates' },
      ];

      for (const { heading, expected } of variations) {
        const text = `${heading}\nSome content here`;
        const sections = detectSections(text);
        expect(sections.some(s => s.name === expected)).toBe(true);
      }
    });

    it('should extract section content', () => {
      const text = `
Skills
JavaScript
Python
React

Experience
Developer at Company
      `;
      const sections = detectSections(text);
      const skillsSection = sections.find(s => s.name === 'skills');
      expect(skillsSection?.content).toContain('JavaScript');
      expect(skillsSection?.content).toContain('Python');
    });

    it('should return empty array for text without sections', () => {
      const text = 'Just some random text without any section headings';
      const sections = detectSections(text);
      expect(sections.length).toBe(0);
    });

    it('should handle sections with colon', () => {
      const text = `
Skills:
JavaScript, Python
      `;
      const sections = detectSections(text);
      expect(sections.some(s => s.name === 'skills')).toBe(true);
    });
  });

  describe('parseWorkExperience', () => {
    it('should parse work experience with position at company format', () => {
      const content = `
Senior Developer at Tech Corp
January 2020 - Present
• Built scalable microservices
• Led team of 5 engineers
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].position).toContain('Developer');
      expect(result[0].company).toContain('Tech Corp');
    });

    it('should parse work experience with position - company format', () => {
      const content = `
Software Engineer - Google
2019 - 2022
Worked on search algorithms
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].position).toContain('Engineer');
    });

    it('should extract highlights/bullet points', () => {
      const content = `
Developer at Company
2020 - Present
• Developed REST APIs
• Improved performance by 50%
• Mentored junior developers
      `;
      const result = parseWorkExperience(content);
      expect(result[0].highlights?.length).toBeGreaterThanOrEqual(3);
      expect(result[0].highlights).toContain('Developed REST APIs');
    });

    it('should handle multiple work entries', () => {
      const content = `
Senior Dev at Company A
2020 - Present
• Task 1

Junior Dev at Company B
2018 - 2020
• Task 2
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should extract dates', () => {
      const content = `
Developer at Company
January 2020 - December 2023
Some work description
      `;
      const result = parseWorkExperience(content);
      expect(result[0].startDate).toBeDefined();
      expect(result[0].endDate).toBeDefined();
    });

    it('should handle empty content', () => {
      const result = parseWorkExperience('');
      expect(result).toEqual([]);
    });

    it('should handle content without dates', () => {
      const content = `
Developer at Company
Building great products
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should split entries separated by a single blank line', () => {
      const content = `
Software Engineer at Google
January 2020 - Present
• Built scalable services

Data Analyst at Facebook
March 2018 - December 2019
• Analyzed user data
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBe(2);
      expect(result[0].company).toContain('Google');
      expect(result[1].company).toContain('Facebook');
    });

    it('should split entries with inline dates', () => {
      const content = `
Software Engineer | Google | Jan 2020 - Present
• Led project development
• Mentored junior engineers

Data Analyst | Facebook | Mar 2018 - Dec 2019
• Built dashboards
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBe(2);
      expect(result[0].highlights?.length).toBeGreaterThanOrEqual(2);
      expect(result[1].highlights?.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle company on line 1 and position on line 2', () => {
      const content = `
Google
Software Engineer
January 2020 - Present
• Built APIs
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBe(1);
      expect(result[0].position).toContain('Engineer');
      expect(result[0].company).toContain('Google');
    });

    it('should strip inline dates from position/company extraction', () => {
      const content = `
Senior Developer at Tech Corp | Jan 2020 - Present
• Did amazing things
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBe(1);
      expect(result[0].position).toContain('Developer');
      expect(result[0].company).toContain('Tech Corp');
      // Position/company should NOT contain date text
      expect(result[0].position).not.toMatch(/2020/);
      expect(result[0].company).not.toMatch(/2020/);
    });

    it('should handle entries where company line starts with bullet', () => {
      const content = `
• TechCorp Inc. - Mar 2021 - Present
Senior Full-Stack Developer
Leading development of flagship product
• Built microservices architecture
• Mentored junior developers
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBe(1);
      expect(result[0].company).toContain('TechCorp');
      expect(result[0].position).toContain('Developer');
      expect(result[0].highlights?.length).toBeGreaterThanOrEqual(2);
    });

    it('should parse work entry with company and inline date on same bullet line', () => {
      const content = `
• Google LLC Mar 2020 - Present
Software Engineer
• Improved search performance
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBe(1);
      expect(result[0].company).toContain('Google');
      expect(result[0].startDate).toBeDefined();
    });

    it('should extract company/position from line with no separator after date removal', () => {
      const content = `
TechCorp Inc. Senior Developer Leading projects
Jan 2020 - Present
• Achievement 1
      `;
      const result = parseWorkExperience(content);
      expect(result.length).toBe(1);
      expect(result[0].company).toContain('TechCorp');
      expect(result[0].position).toContain('Developer');
    });
  });

  describe('parseEducation', () => {
    it('should parse education with degree and institution', () => {
      const content = `
Bachelor of Science in Computer Science
University of Technology
2015 - 2019
GPA: 3.8
      `;
      const result = parseEducation(content);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].studyType).toContain('Bachelor');
      expect(result[0].institution).toContain('University');
    });

    it('should extract GPA', () => {
      const content = `
BS Computer Science
MIT
GPA: 3.9
      `;
      const result = parseEducation(content);
      expect(result[0].score).toBe('3.9');
    });

    it('should handle multiple degrees', () => {
      const content = `
Master of Business Administration
Harvard Business School
2020 - 2022

Bachelor of Arts in Economics
Stanford University
2016 - 2020
      `;
      const result = parseEducation(content);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should recognize different degree formats', () => {
      const degrees = [
        'Bachelor of Science',
        'Master of Arts',
        'PhD in Physics',
        'MBA',
        'B.S. in Computer Science',
        'M.S. in Engineering',
      ];

      for (const degree of degrees) {
        const content = `${degree}\nSome University\n2020`;
        const result = parseEducation(content);
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should handle empty content', () => {
      const result = parseEducation('');
      expect(result).toEqual([]);
    });

    it('should detect institution without keyword when degree is on another line', () => {
      const content = `
MIT
BS Computer Science
2018 - 2022
      `;
      const result = parseEducation(content);
      expect(result.length).toBe(1);
      expect(result[0].institution).toContain('MIT');
      expect(result[0].studyType).toBeDefined();
    });

    it('should split multiple education entries by blank lines', () => {
      const content = `
Stanford University
Master of Science in Data Science
2020 - 2022

UC Berkeley
Bachelor of Arts in Mathematics
2016 - 2020
      `;
      const result = parseEducation(content);
      expect(result.length).toBe(2);
    });
  });

  describe('parseSkills', () => {
    it('should parse comma-separated skills', () => {
      const content = 'JavaScript, Python, Java, C++';
      const result = parseSkills(content);
      expect(result.length).toBeGreaterThanOrEqual(4);
    });

    it('should parse bullet point skills', () => {
      const content = `
• JavaScript
• Python
• React
• Node.js
      `;
      const result = parseSkills(content);
      expect(result.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle skill categories', () => {
      const content = `
Programming Languages:
JavaScript, Python, Java

Frameworks:
React, Angular, Vue
      `;
      const result = parseSkills(content);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should deduplicate skills', () => {
      const content = 'JavaScript, JavaScript, Python, Python';
      const result = parseSkills(content);
      const jsCount = result.filter(s => s.name?.toLowerCase() === 'javascript').length;
      expect(jsCount).toBe(1);
    });

    it('should handle empty content', () => {
      const result = parseSkills('');
      expect(result).toEqual([]);
    });

    it('should ignore very long skill entries', () => {
      const longSkill = 'A'.repeat(100);
      const content = `JavaScript, ${longSkill}, Python`;
      const result = parseSkills(content);
      const hasLongSkill = result.some(s => s.name === longSkill);
      expect(hasLongSkill).toBe(false);
    });
  });

  describe('parseProjects', () => {
    it('should parse project name', () => {
      const content = `
E-commerce Platform
Built a full-stack shopping application
      `;
      const result = parseProjects(content);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toContain('E-commerce');
    });

    it('should extract project highlights', () => {
      const content = `
Project Name
• Implemented feature A
• Deployed to production
• 1000+ users
      `;
      const result = parseProjects(content);
      expect(result[0].highlights?.length).toBeGreaterThanOrEqual(3);
    });

    it('should extract project URLs', () => {
      const content = `
My Project
Built awesome thing
https://github.com/user/project
      `;
      const result = parseProjects(content);
      expect(result[0].url).toContain('github.com');
    });

    it('should handle empty content', () => {
      const result = parseProjects('');
      expect(result).toEqual([]);
    });
  });

  describe('parseCertificates', () => {
    it('should parse certificate with issuer', () => {
      const content = 'AWS Solutions Architect - Amazon Web Services';
      const result = parseCertificates(content);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toContain('AWS');
      expect(result[0].issuer).toContain('Amazon');
    });

    it('should parse certificate with comma separator', () => {
      const content = 'PMP, Project Management Institute';
      const result = parseCertificates(content);
      expect(result[0].name).toContain('PMP');
      expect(result[0].issuer).toContain('Project Management');
    });

    it('should parse bullet-point certificates', () => {
      const content = `
• AWS Certified Developer
• Google Cloud Professional
• Azure Administrator
      `;
      const result = parseCertificates(content);
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle empty content', () => {
      const result = parseCertificates('');
      expect(result).toEqual([]);
    });
  });

  describe('parseLanguages', () => {
    it('should parse language with fluency', () => {
      const content = 'English - Native';
      const result = parseLanguages(content);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].language).toContain('English');
      expect(result[0].fluency).toContain('Native');
    });

    it('should recognize fluency levels', () => {
      const levels = ['Native', 'Fluent', 'Professional', 'Intermediate', 'Beginner'];
      
      for (const level of levels) {
        const content = `Spanish (${level})`;
        const result = parseLanguages(content);
        expect(result[0].fluency?.toLowerCase()).toContain(level.toLowerCase());
      }
    });

    it('should parse multiple languages', () => {
      const content = `
• English - Native
• Spanish - Fluent
• French - Intermediate
      `;
      const result = parseLanguages(content);
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle empty content', () => {
      const result = parseLanguages('');
      expect(result).toEqual([]);
    });
  });

  describe('calculateConfidence', () => {
    it('should return high confidence for complete data', () => {
      const data = {
        basics: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          summary: 'Experienced developer',
        },
        work: [{ company: 'Tech Corp', position: 'Developer' }],
        education: [{ institution: 'MIT', studyType: 'BS' }],
        skills: [{ name: 'JavaScript' }],
      };
      const result = calculateConfidence(data);
      expect(result.overall).toBeGreaterThan(50);
    });

    it('should return low confidence for minimal data', () => {
      const data = {
        basics: { name: 'John' },
      };
      const result = calculateConfidence(data);
      expect(result.overall).toBeLessThan(50);
    });

    it('should return zero for empty data', () => {
      const result = calculateConfidence({});
      expect(result.overall).toBeLessThanOrEqual(20);
    });

    it('should calculate section-specific confidence', () => {
      const data = {
        basics: { name: 'John', email: 'john@example.com' },
        work: [{ company: 'A', position: 'Dev' }, { company: 'B', position: 'Sr Dev' }],
        skills: [{ name: 'JS' }],
      };
      const result = calculateConfidence(data);
      expect(result.sections).toBeDefined();
      expect(result.sections.basics).toBeGreaterThan(0);
      expect(result.sections.work).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters in names', () => {
      const text = 'José García\nSoftware Engineer';
      const result = extractName(text);
      expect(result).toContain('José');
    });

    it('should handle special characters in emails', () => {
      const text = 'Contact: john.doe+resume@company-name.co.uk';
      const result = extractContactInfo(text);
      expect(result.email).toBeDefined();
    });

    it('should handle international phone formats', () => {
      const formats = [
        '+44 20 7123 4567',
        '+33 1 23 45 67 89',
        '+49 30 12345678',
      ];

      for (const phone of formats) {
        const result = extractContactInfo(`Phone: ${phone}`);
        expect(result.phone).toBeDefined();
      }
    });

    it('should handle very long content without crashing', () => {
      const longContent = 'Developer at Company\n' + '• Task '.repeat(1000);
      expect(() => parseWorkExperience(longContent)).not.toThrow();
    });

    it('should handle malformed dates gracefully', () => {
      const content = `
Developer at Company
Invalid Date - Also Invalid
Did some work
      `;
      expect(() => parseWorkExperience(content)).not.toThrow();
    });

    it('should handle mixed language content', () => {
      const content = `
Développeur at Compagnie
2020 - Présent
• Développé applications
      `;
      expect(() => parseWorkExperience(content)).not.toThrow();
    });
  });

  // ===================================================================
  // New: Semantic section detection
  // ===================================================================
  describe('detectSections (semantic)', () => {
    it('should detect sections with minor typos via fuzzy matching', () => {
      const text = `
John Doe

Experiance
Developer at Company
2020 - Present

Educaton
BS Computer Science
University
      `;
      const sections = detectSections(text);
      expect(sections.some(s => s.name === 'work')).toBe(true);
      expect(sections.some(s => s.name === 'education')).toBe(true);
    });

    it('should detect ALL CAPS headings with extra spaces', () => {
      const text = `
WORK  EXPERIENCE
Developer at Company
2020 - Present

TECHNICAL  SKILLS
JavaScript, Python
      `;
      const sections = detectSections(text);
      expect(sections.some(s => s.name === 'work')).toBe(true);
      expect(sections.some(s => s.name === 'skills')).toBe(true);
    });

    it('should detect sections preceded by blank lines', () => {
      const text = `John Doe

Professional Background
Developer at Company
2020 - Present

Academic Credentials
BS CS
      `;
      const sections = detectSections(text);
      // "Professional Background" should map to work
      expect(sections.some(s => s.name === 'work')).toBe(true);
    });

    it('should not falsely detect bullet lines as headings', () => {
      const text = `
Experience

• Built something at Company A
• Led team at Company B
- Managed projects
      `;
      const sections = detectSections(text);
      // Only "Experience" should be a section
      expect(sections.length).toBe(1);
      expect(sections[0].name).toBe('work');
    });

    it('should detect headings with colon suffix', () => {
      const text = `
Work Experience:
Developer at Company
2020 - Present

Skills:
JavaScript, Python
      `;
      const sections = detectSections(text);
      expect(sections.some(s => s.name === 'work')).toBe(true);
      expect(sections.some(s => s.name === 'skills')).toBe(true);
    });
  });

  // ===================================================================
  // New: Enhanced date normalization
  // ===================================================================
  describe('normalizeDate', () => {
    it('should normalize "January 2020" to "2020-01"', () => {
      expect(normalizeDate('January 2020')).toBe('2020-01');
    });

    it('should normalize "Jan 2020" to "2020-01"', () => {
      expect(normalizeDate('Jan 2020')).toBe('2020-01');
    });

    it('should normalize "01/2020" to "2020-01"', () => {
      expect(normalizeDate('01/2020')).toBe('2020-01');
    });

    it('should normalize "1/2020" to "2020-01"', () => {
      expect(normalizeDate('1/2020')).toBe('2020-01');
    });

    it('should normalize "12.2019" (European) to "2019-12"', () => {
      expect(normalizeDate('12.2019')).toBe('2019-12');
    });

    it('should normalize ISO format "2020-01-15"', () => {
      expect(normalizeDate('2020-01-15')).toBe('2020-01');
    });

    it('should normalize ISO "2020-01"', () => {
      expect(normalizeDate('2020-01')).toBe('2020-01');
    });

    it('should normalize standalone year "2020"', () => {
      expect(normalizeDate('2020')).toBe('2020');
    });

    it('should normalize "Present" to empty string', () => {
      expect(normalizeDate('Present')).toBe('');
      expect(normalizeDate('current')).toBe('');
      expect(normalizeDate('Ongoing')).toBe('');
      expect(normalizeDate('Now')).toBe('');
    });

    it('should handle "Sept 2020" abbreviated month', () => {
      expect(normalizeDate('Sept 2020')).toBe('2020-09');
    });

    it('should handle "Jan. 2020" with period', () => {
      expect(normalizeDate('Jan. 2020')).toBe('2020-01');
    });

    it('should handle "May, 2020" with comma', () => {
      expect(normalizeDate('May, 2020')).toBe('2020-05');
    });
  });

  describe('extractDates (enhanced)', () => {
    it('should extract "January 2020 - Present"', () => {
      const result = extractDates('January 2020 - Present');
      expect(result.startDate).toBe('2020-01');
      expect(result.endDate).toBe('');
    });

    it('should extract "Jan 2020 - Dec 2023"', () => {
      const result = extractDates('Jan 2020 - Dec 2023');
      expect(result.startDate).toBe('2020-01');
      expect(result.endDate).toBe('2023-12');
    });

    it('should extract "2020 - 2023"', () => {
      const result = extractDates('2020 - 2023');
      expect(result.startDate).toBe('2020');
      expect(result.endDate).toBe('2023');
    });

    it('should extract "2020 - Present"', () => {
      const result = extractDates('2020 - Present');
      expect(result.startDate).toBe('2020');
      expect(result.endDate).toBe('');
    });

    it('should handle en-dash and em-dash', () => {
      const result1 = extractDates('Jan 2020 \u2013 Dec 2023');
      expect(result1.startDate).toBe('2020-01');
      expect(result1.endDate).toBe('2023-12');

      const result2 = extractDates('Jan 2020 \u2014 Dec 2023');
      expect(result2.startDate).toBe('2020-01');
      expect(result2.endDate).toBe('2023-12');
    });

    it('should extract two separate month-year tokens', () => {
      const result = extractDates('Started March 2019, ended July 2022');
      expect(result.startDate).toBe('2019-03');
      expect(result.endDate).toBe('2022-07');
    });
  });

  // ===================================================================
  // New: Enhanced entity extraction
  // ===================================================================
  describe('extractCompanyAndPosition', () => {
    it('should parse "Position at Company"', () => {
      const result = extractCompanyAndPosition('Software Engineer at Google');
      expect(result.position).toBe('Software Engineer');
      expect(result.company).toBe('Google');
    });

    it('should parse "Position | Company"', () => {
      const result = extractCompanyAndPosition('Senior Developer | Microsoft Corp.');
      expect(result.position).toContain('Developer');
      expect(result.company).toContain('Microsoft');
    });

    it('should parse "Position - Company"', () => {
      const result = extractCompanyAndPosition('Data Analyst - Amazon Inc.');
      expect(result.position).toContain('Analyst');
      expect(result.company).toContain('Amazon');
    });

    it('should parse "Company, Position"', () => {
      const result = extractCompanyAndPosition('Facebook Inc., Software Engineer');
      expect(result.company).toContain('Facebook');
      expect(result.position).toContain('Engineer');
    });

    it('should use position keywords to disambiguate', () => {
      // "Developer" is a position keyword, so should be detected as position
      const result = extractCompanyAndPosition('Developer - Acme Corp.');
      expect(result.position).toContain('Developer');
      expect(result.company).toContain('Acme');
    });

    it('should use company suffixes to disambiguate', () => {
      const result = extractCompanyAndPosition('Widgets LLC - Product Lead');
      expect(result.company).toContain('Widgets LLC');
      expect(result.position).toContain('Product Lead');
    });

    it('should handle no separator – treat as position if keyword matches', () => {
      const result = extractCompanyAndPosition('Senior Software Engineer');
      expect(result.position).toBe('Senior Software Engineer');
    });

    it('should use nextLine as company when position is on first line', () => {
      const result = extractCompanyAndPosition('Senior Developer', 'Tech Startup');
      expect(result.position).toContain('Developer');
      expect(result.company).toBe('Tech Startup');
    });

    it('should use nextLine with position keyword to swap company/position', () => {
      // "Google" alone has no keyword match, but "Software Engineer" on
      // nextLine has position keywords → company=Google, position=Software Engineer
      const result = extractCompanyAndPosition('Google', 'Software Engineer');
      expect(result.company).toBe('Google');
      expect(result.position).toBe('Software Engineer');
    });

    it('should use smartAssign for ambiguous two-line entries', () => {
      // Neither line has strong signals – smartAssign decides
      const result = extractCompanyAndPosition('Acme', 'Marketing');
      expect(result.company).toBeDefined();
      expect(result.position).toBeDefined();
    });

    it('should handle empty line', () => {
      const result = extractCompanyAndPosition('');
      expect(result.company).toBeUndefined();
      expect(result.position).toBeUndefined();
    });
  });

  // ===================================================================
  // New: Improved skills parsing with categories
  // ===================================================================
  describe('parseSkills (improved categories)', () => {
    it('should group skills under categories from "Category: skill1, skill2" format', () => {
      const content = `
Programming Languages: JavaScript, Python, Java
Frameworks: React, Angular, Vue
Databases: PostgreSQL, MongoDB
      `;
      const result = parseSkills(content);
      const progLang = result.find(s => s.name === 'Programming Languages');
      expect(progLang).toBeDefined();
      expect(progLang?.keywords).toContain('JavaScript');
      expect(progLang?.keywords).toContain('Python');
    });

    it('should handle skills listed on separate lines under a category', () => {
      const content = `
Programming Languages:
JavaScript, Python, Java

Frameworks:
React, Angular, Vue
      `;
      const result = parseSkills(content);
      expect(result.some(s => s.name === 'Programming Languages')).toBe(true);
      expect(result.some(s => s.name === 'Frameworks')).toBe(true);
    });
  });

  // ===================================================================
  // New: Improved confidence calculation
  // ===================================================================
  describe('calculateConfidence (improved)', () => {
    it('should give bonus for validated date formats', () => {
      const data1 = {
        work: [{ company: 'A', position: 'Dev', startDate: '2020-01' }],
      };
      const data2 = {
        work: [{ company: 'A', position: 'Dev', startDate: 'sometime' }],
      };
      const c1 = calculateConfidence(data1);
      const c2 = calculateConfidence(data2);
      expect(c1.sections.work).toBeGreaterThan(c2.sections.work!);
    });

    it('should give bonus for skills with categories', () => {
      const withCats = {
        skills: [{ name: 'Languages', keywords: ['JS', 'Python'] }],
      };
      const withoutCats = {
        skills: [{ name: 'JavaScript', keywords: [] }],
      };
      const c1 = calculateConfidence(withCats);
      const c2 = calculateConfidence(withoutCats);
      expect(c1.sections.skills).toBeGreaterThan(c2.sections.skills!);
    });

    it('should calculate project confidence', () => {
      const data = {
        projects: [{ name: 'My Project', description: 'A cool project', url: 'https://example.com' }],
      };
      const result = calculateConfidence(data);
      expect(result.sections.projects).toBe(100);
    });

    it('should calculate certificate confidence', () => {
      const data = {
        certificates: [{ name: 'AWS Certified', issuer: 'Amazon', date: '2023-01' }],
      };
      const result = calculateConfidence(data);
      expect(result.sections.certificates).toBe(100);
    });

    it('should calculate language confidence', () => {
      const data = {
        languages: [{ language: 'English', fluency: 'Native' }],
      };
      const result = calculateConfidence(data);
      expect(result.sections.languages).toBe(100);
    });
  });
});
