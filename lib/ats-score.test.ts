/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { calculateATSScore } from './ats-score';
import { Resume } from '@/db';

const mockResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: '123',
  meta: {
    title: 'Test Resume',
    templateId: 'ats',
    themeColor: '#000000',
    lastModified: new Date().toISOString(),
    layoutSettings: {} as any,
  },
  basics: {
    name: 'John Doe',
    label: 'Developer',
    email: 'john@example.com',
    phone: '123-456-7890',
    url: '',
    summary: 'Experienced developer with a proven track record. Hard worker who thinks outside the box.', // Contains cliches
    location: { city: 'New York', country: 'USA' },
    profiles: [],
  },
  work: [
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Dev',
      startDate: '2020-01-01',
      endDate: 'Present',
      summary: 'Worked on stuff.',
      highlights: [
        'Developed a new feature.', // Weak verb "Developed" is ok, but let's test strong ones
        'Spearheaded the initiative.', // Strong
        'Responsible for managing the team.' // Weak start
      ],
      url: ''
    }
  ] as any[],
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
  ...overrides
});

describe('calculateATSScore', () => {
  it('detects cliches', () => {
    const result = calculateATSScore(mockResume());
    const clicheCheck = result.checks.find(c => c.id === 'cliches');
    expect(clicheCheck?.passed).toBe(false);
    expect(clicheCheck?.score).toBeLessThan(clicheCheck!.maxScore);
  });

  it('validates action verbs', () => {
    const resume = mockResume();
    // 'Spearheaded' is strong. 'Developed' is strong. 'Responsible' is weak.
    const result = calculateATSScore(resume);
    const actionVerbCheck = result.checks.find(c => c.id === 'action-verbs');
    // 2/3 strong verbs = 66% > 60% threshold?
    // Let's check my list. 'Developed' is in the set. 'Spearheaded' is in the set.
    // 'Responsible' is NOT.
    // So 2/3 = 0.66. Should pass.
    expect(actionVerbCheck?.passed).toBe(true);
  });

  it('checks for quantifiable results', () => {
    const resume = mockResume({
      work: [
        {
          id: '1',
          company: 'Tech Corp',
          position: 'Dev',
          url: '',
          startDate: '', endDate: '',
          summary: '',
          highlights: [
            'Increased revenue by 20%.',
            'Managed budget of $50000.',
            'Led a team of 10 people.'
          ]
        }
      ]
    });
    const result = calculateATSScore(resume);
    const metricsCheck = result.checks.find(c => c.id === 'quantifiable-results');
    expect(metricsCheck?.passed).toBe(true);
  });

  it('fails when contact info is missing', () => {
     const resume = mockResume({
         basics: { ...mockResume().basics, email: '' }
     });
     const result = calculateATSScore(resume);
     const contactCheck = result.checks.find(c => c.id === 'contact-info');
     expect(contactCheck?.passed).toBe(false);
  });
});
