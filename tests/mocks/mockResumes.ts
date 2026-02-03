import { Resume } from '@/db';
import { createMockResume, createMinimalResume, createMaximalResume } from '../utils/factories';

/**
 * Standard mock resume for general testing
 */
export const mockStandardResume: Resume = createMockResume();

/**
 * Minimal resume with only required fields
 */
export const mockMinimalResume: Resume = createMinimalResume();

/**
 * Maximal resume with lots of data
 */
export const mockMaximalResume: Resume = createMaximalResume();

/**
 * Resume with special characters and unicode
 */
export const mockResumeWithSpecialCharacters: Resume = createMockResume({
  basics: {
    name: 'José García',
    label: 'Développeur & Engineer™',
    image: '',
    email: 'josé@example.com',
    phone: '+33 1 23 45 67 89',
    url: 'https://example.com',
    summary: 'Expert in C++ & Python 🐍. Specializes in AI/ML solutions with 10+ years of experience.',
    location: {
      address: 'Rue de l\'Université',
      city: 'Paris',
      region: 'Île-de-France',
      postalCode: '75007',
      country: 'France',
    },
    profiles: [],
  },
});

/**
 * Resume with empty sections
 */
export const mockResumeWithEmptySections: Resume = createMockResume({
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
  custom: [],
});

/**
 * Resume with very long text fields (testing overflow)
 */
export const mockResumeWithLongText: Resume = createMockResume({
  basics: {
    name: 'John Doe',
    label: 'Software Engineer',
    image: '',
    email: 'john@example.com',
    phone: '+1-555-123-4567',
    url: 'https://example.com',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50) +
      'This is an extremely long summary that tests how the application handles overflow text in various contexts.',
    location: {
      address: '',
      city: 'San Francisco',
      region: 'CA',
      postalCode: '94105',
      country: 'USA',
    },
    profiles: [],
  },
});

/**
 * Resume with invalid date formats (for error testing)
 */
export const mockResumeWithInvalidDates: Resume = createMockResume({
  work: [
    {
      id: '1',
      company: 'Test Company',
      position: 'Developer',
      location: '',
      url: '',
      startDate: 'invalid-date',
      endDate: 'also-invalid',
      summary: '',
      highlights: [],
      name: '',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Test University',
      url: '',
      area: 'Computer Science',
      studyType: 'Bachelor',
      startDate: '99/99/9999',
      endDate: '00/00/0000',
      score: '',
      summary: '',
      courses: [],
    },
  ],
});

/**
 * Array of diverse resumes for batch testing
 */
export const mockResumeCollection: Resume[] = [
  mockStandardResume,
  mockMinimalResume,
  mockResumeWithEmptySections,
  createMockResume({ meta: { ...mockStandardResume.meta, templateId: 'modern' } }),
  createMockResume({ meta: { ...mockStandardResume.meta, templateId: 'creative' } }),
];

/**
 * Resume with all section types populated
 */
export const mockCompleteResume: Resume = createMockResume({
  work: [
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Engineer',
      location: 'San Francisco, CA',
      url: 'https://techcorp.com',
      startDate: '2020-01-01',
      endDate: 'Present',
      summary: 'Leading backend development team',
      highlights: ['Led team of 5', 'Increased performance by 50%'],
      name: '',
    },
  ],
  education: [
    {
      id: '1',
      institution: 'MIT',
      url: 'https://mit.edu',
      area: 'Computer Science',
      studyType: 'Master of Science',
      startDate: '2015-09-01',
      endDate: '2017-05-31',
      score: '4.0 GPA',
      summary: 'Thesis on distributed systems',
      courses: ['Advanced Algorithms', 'Distributed Systems'],
    },
  ],
  skills: [
    {
      id: '1',
      name: 'JavaScript',
      level: 'Expert',
      keywords: ['React', 'Node.js', 'TypeScript'],
    },
  ],
  projects: [
    {
      id: '1',
      name: 'Open Source Project',
      description: 'Popular npm package',
      highlights: ['10K+ stars on GitHub', '1M+ downloads'],
      keywords: ['TypeScript', 'Open Source'],
      startDate: '2019-01-01',
      endDate: 'Present',
      url: 'https://github.com/example/project',
    },
  ],
  certificates: [
    {
      id: '1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon',
      date: '2021-06-01',
      url: 'https://aws.amazon.com',
      summary: 'Professional level certification',
    },
  ],
  languages: [
    {
      id: '1',
      language: 'English',
      fluency: 'Native',
    },
    {
      id: '2',
      language: 'Spanish',
      fluency: 'Professional',
    },
  ],
  interests: [
    {
      id: '1',
      name: 'Open Source',
      keywords: ['GitHub', 'Contributions'],
    },
  ],
  publications: [
    {
      id: '1',
      name: 'Research Paper on Scalability',
      publisher: 'ACM',
      releaseDate: '2022-03-15',
      url: 'https://acm.org/paper/123',
      summary: 'Published research on distributed systems',
    },
  ],
  awards: [
    {
      id: '1',
      title: 'Best Paper Award',
      date: '2022-03-20',
      awarder: 'ACM Conference',
      summary: 'Recognized for outstanding research contribution',
    },
  ],
  references: [
    {
      id: '1',
      name: 'Dr. Jane Smith',
      position: 'Professor',
      reference: 'Excellent researcher and team player',
    },
  ],
  custom: [
    {
      id: '1',
      name: 'Volunteer Work',
      items: [
        {
          id: '1-1',
          name: 'Code Teaching',
          description: 'Teaching coding',
          date: '2022-01-01',
          url: '',
          summary: 'Teaching coding to underprivileged youth',
        },
      ],
    },
  ],
});
