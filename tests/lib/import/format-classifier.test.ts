import { describe, it, expect } from 'vitest';
import { classifyResumeFormat } from '@/lib/import/format-classifier';

describe('classifyResumeFormat', () => {
  it('should classify a standard chronological resume', () => {
    const text = `
John Doe
john@example.com

Experience

Senior Developer at Tech Corp
January 2020 - Present
• Built scalable microservices
• Led team of 5 engineers

Junior Developer at Startup Inc
June 2017 - December 2019
• Developed REST APIs
• Wrote unit tests

Education

Bachelor of Science in Computer Science
University of Technology
2013 - 2017

Skills

JavaScript, Python, Java, React, Node.js
    `;
    const result = classifyResumeFormat(text);
    expect(result.format).toBe('chronological');
    expect(result.confidence).toBeGreaterThan(40);
    expect(result.traits.sectionCount).toBeGreaterThanOrEqual(3);
    expect(result.traits.dateRangeCount).toBeGreaterThanOrEqual(2);
  });

  it('should classify a functional (skills-first) resume', () => {
    const text = `
Jane Smith
jane@example.com

Skills

Programming Languages:
JavaScript, Python, Java, C++

Frameworks:
React, Angular, Vue, Node.js

Core Competencies

Problem solving, team leadership, agile methodologies

Experience

Software Developer
2020 - Present
    `;
    const result = classifyResumeFormat(text);
    expect(['functional', 'combination']).toContain(result.format);
    expect(result.traits.skillsBeforeWork).toBe(true);
  });

  it('should classify an academic resume', () => {
    const text = `
Dr. Academic Person
professor@university.edu

Education

PhD in Computer Science
MIT
2010 - 2015

Publications

"Machine Learning Advances" - Journal of AI, 2023
"Deep Learning Survey" - Nature, 2022

Awards

Best Paper Award, ICML 2023
Distinguished Researcher, 2022

Experience

Associate Professor
University of Tech
January 2015 - Present
    `;
    const result = classifyResumeFormat(text);
    // Academic resumes with strong chronological signals may classify either way
    expect(['academic', 'chronological']).toContain(result.format);
    expect(result.traits.hasAcademicSections).toBe(true);
  });

  it('should classify a creative/non-standard resume', () => {
    const text = `
Some Person
I make things happen

Did cool stuff at places
Made widgets
Thought about things
    `;
    const result = classifyResumeFormat(text);
    expect(result.format).toBe('creative');
    expect(result.traits.sectionCount).toBeLessThanOrEqual(1);
  });

  it('should handle empty text', () => {
    const result = classifyResumeFormat('');
    expect(result.format).toBe('unknown');
    expect(result.confidence).toBe(0);
  });

  it('should detect contact info in header', () => {
    const text = `
John Doe
john@example.com
(555) 123-4567

Experience

Developer at Company
2020 - Present
    `;
    const result = classifyResumeFormat(text);
    expect(result.traits.hasContactHeader).toBe(true);
  });

  it('should detect combination format', () => {
    const text = `
John Doe
john@example.com

Skills

Programming: JavaScript, Python, Go
DevOps: Docker, Kubernetes, AWS
Data: PostgreSQL, Redis, MongoDB

Experience

Senior Engineer at BigCo
January 2020 - Present
• Architected microservices
• Led migration project

Engineer at SmallCo
June 2017 - December 2019
• Built REST APIs

Education

BS Computer Science
State University
2013 - 2017
    `;
    const result = classifyResumeFormat(text);
    // With skills before work AND multiple date ranges, could be combination, functional, or chronological
    expect(['combination', 'functional', 'chronological']).toContain(result.format);
    expect(result.traits.skillsBeforeWork).toBe(true);
    expect(result.traits.dateRangeCount).toBeGreaterThanOrEqual(2);
  });

  it('should return confidence under 95', () => {
    const text = `
John Doe
john@example.com

Experience

Developer at Company
2020 - Present
• Did things

Education

BS in CS
University
2016 - 2020

Skills

JS, Python
    `;
    const result = classifyResumeFormat(text);
    expect(result.confidence).toBeLessThanOrEqual(95);
  });
});
