import { Resume } from '@/db';

export interface ATSCheck {
  id: string;
  name: string;
  category: 'content' | 'formatting' | 'impact';
  passed: boolean;
  score: number; // 0-100 impact of this check
  maxScore: number;
  message: string;
  details?: string[];
}

export interface ATSScoreResult {
  totalScore: number;
  checks: ATSCheck[];
  feedback: string[];
}

const ACTION_VERBS = new Set([
  'achieved', 'accelerated', 'awarded', 'advanced', 'amplified', 'boosted', 'built',
  'created', 'coordinated', 'collaborated', 'completed', 'controlled', 'converted',
  'decreased', 'delivered', 'developed', 'designed', 'driven', 'doubled', 'directed',
  'established', 'expanded', 'enhanced', 'exceeded', 'executed', 'engineered',
  'founded', 'focused', 'generated', 'guided', 'grew', 'headed', 'improved',
  'increased', 'initiated', 'implemented', 'innovated', 'integrated', 'introduced',
  'led', 'managed', 'maximized', 'mentored', 'minimized', 'modernized', 'negotiated',
  'optimized', 'orchestrated', 'organized', 'outperformed', 'planned', 'produced',
  'promoted', 'pioneered', 'reduced', 'resolved', 'restructured', 'revitalized',
  'saved', 'secured', 'spearheaded', 'streamlined', 'strengthened', 'supervised',
  'surpassed', 'targeted', 'transformed', 'trained', 'upgraded', 'utilized', 'won'
]);

const CLICHES = new Set([
  'hard worker', 'team player', 'motivated', 'self-starter', 'detail-oriented',
  'results-oriented', 'think outside the box', 'go-getter', 'thought leader',
  'visionary', 'guru', 'ninja', 'rockstar', 'synergy', 'value-add',
  'best of breed', 'bottom line', 'strategic thinker', 'proven track record',
  'dynamic', 'proactive', 'perfectionist', 'people person'
]);

export const calculateATSScore = (resume: Resume, jobDescription?: string): ATSScoreResult => {
  const checks: ATSCheck[] = [];
  const feedback: string[] = [];

  // 1. IMPACT: Contact Information (10 pts)
  const hasEmail = !!resume.basics.email;
  const hasPhone = !!resume.basics.phone;
  const hasLocation = !!resume.basics.location?.city || !!resume.basics.location?.country;

  checks.push({
    id: 'contact-info',
    name: 'Contact Information',
    category: 'impact',
    passed: hasEmail && hasPhone && hasLocation,
    score: (hasEmail ? 4 : 0) + (hasPhone ? 3 : 0) + (hasLocation ? 3 : 0),
    maxScore: 10,
    message: hasEmail && hasPhone && hasLocation 
      ? 'Contact info is complete.' 
      : 'Missing essential contact information.',
    details: [
      !hasEmail && 'Missing email', 
      !hasPhone && 'Missing phone', 
      !hasLocation && 'Missing location'
    ].filter(Boolean) as string[],
  });

  // 2. CONTENT: Professional Summary (10 pts)
  const summaryLength = resume.basics.summary?.length || 0;
  const hasGoodSummary = summaryLength > 150 && summaryLength < 600; // stricter range
  const hasSummary = summaryLength > 0;

  checks.push({
    id: 'summary-quality',
    name: 'Professional Summary',
    category: 'content',
    passed: hasGoodSummary,
    score: hasGoodSummary ? 10 : (hasSummary ? 5 : 0),
    maxScore: 10,
    message: hasGoodSummary 
      ? 'Summary length is optimal.' 
      : (hasSummary ? 'Summary should be 3-5 sentences long.' : 'Missing professional summary.'),
  });

  // 3. IMPACT: Work Experience & Action Verbs (25 pts)
  const experienceCount = resume.work.length;
  const hasExperience = experienceCount > 0;
  let actionVerbCount = 0;
  let totalBullets = 0;
  const weakBullets: string[] = [];

  if (hasExperience) {
    resume.work.forEach(job => {
      if (job.highlights) {
        job.highlights.forEach(bullet => {
          totalBullets++;
          const firstWord = bullet.trim().split(' ')[0]?.toLowerCase().replace(/[^a-z]/g, '');
          if (firstWord && ACTION_VERBS.has(firstWord)) {
            actionVerbCount++;
          } else {
             // Keep a few examples of weak bullets
             if (weakBullets.length < 3) weakBullets.push(bullet.substring(0, 30) + '...');
          }
        });
      }
    });
  }
  
  const actionVerbRatio = totalBullets > 0 ? actionVerbCount / totalBullets : 0;
  const goodActionVerbUsage = actionVerbRatio > 0.6; // 60% of bullets should start with action verbs

  checks.push({
    id: 'action-verbs',
    name: 'Action Verbs',
    category: 'impact',
    passed: goodActionVerbUsage,
    score: goodActionVerbUsage ? 25 : (actionVerbRatio > 0.3 ? 15 : 5),
    maxScore: 25,
    message: goodActionVerbUsage 
      ? 'Strong use of action verbs.' 
      : 'Start more bullet points with strong action verbs (e.g., Led, Developed, Created).',
    details: !goodActionVerbUsage && weakBullets.length > 0 
      ? [`Weak openers found: "${weakBullets.join('", "')}"`] 
      : undefined
  });

  // 4. IMPACT: Quantifiable Results (20 pts)
  let metricsCount = 0;
  const metricRegex = /(\d+%|\$\d+|\d+\+? (users|clients|customers|revenue|sales|people|staff|team|budget))/i;
  
  if (hasExperience) {
    resume.work.forEach(job => {
      const text = (job.summary || '') + ' ' + (job.highlights?.join(' ') || '');
      const matches = text.match(new RegExp(metricRegex, 'gi'));
      if (matches) metricsCount += matches.length;
    });
  }

  const hasGoodMetrics = metricsCount >= 3; // At least 3 quantifiable achievements

  checks.push({
    id: 'quantifiable-results',
    name: 'Quantifiable Results',
    category: 'impact',
    passed: hasGoodMetrics,
    score: hasGoodMetrics ? 20 : (metricsCount > 0 ? 10 : 0),
    maxScore: 20,
    message: hasGoodMetrics 
      ? 'Great use of specific metrics and numbers.' 
      : 'Add more numbers to quantify your impact (e.g., "Increased revenue by 20%").',
  });

  // 5. CONTENT: Clichés & Buzzwords (Negatives)
  let clicheCount = 0;
  const foundCliches: string[] = [];
  
  // Scan entire resume text
  const fullText = JSON.stringify(resume).toLowerCase();
  CLICHES.forEach(cliche => {
    if (fullText.includes(cliche)) {
      clicheCount++;
      if (foundCliches.length < 5) foundCliches.push(cliche);
    }
  });

  const noCliches = clicheCount === 0;

  checks.push({
    id: 'cliches',
    name: 'Clichés & Buzzwords',
    category: 'content',
    passed: noCliches,
    score: noCliches ? 15 : Math.max(0, 15 - (clicheCount * 3)),
    maxScore: 15,
    message: noCliches 
      ? 'No overused buzzwords found.' 
      : `Avoid using vague buzzwords. Found: ${foundCliches.join(', ')}.`,
  });

  // 6. FORMATTING: Consistency (10 pts)
  // Check for punctuation consistency in bullets
  let endsWithPeriod = 0;
  let noPeriod = 0;

  if (hasExperience) {
    resume.work.forEach(job => {
      job.highlights?.forEach(bullet => {
        if (bullet.trim().endsWith('.')) endsWithPeriod++;
        else noPeriod++;
      });
    });
  }

  const isConsistent = (endsWithPeriod === 0 && noPeriod > 0) || (endsWithPeriod > 0 && noPeriod === 0);
  
  checks.push({
    id: 'consistency',
    name: 'Formatting Consistency',
    category: 'formatting',
    passed: isConsistent,
    score: isConsistent ? 10 : 5, // partial points even if inconsistent
    maxScore: 10,
    message: isConsistent 
      ? 'Consistent punctuation formatting.' 
      : 'Inconsistent usage of periods at the end of bullet points.',
  });

  // 7. CONTENT: Skills & Core Check (10 pts)
  const skillsCount = resume.skills.length + resume.skills.reduce((acc, s) => acc + (s.keywords?.length || 0), 0);
  const hasSkills = skillsCount >= 5;

  checks.push({
    id: 'skills-section',
    name: 'Skills Section',
    category: 'content',
    passed: hasSkills,
    score: hasSkills ? 10 : 0,
    maxScore: 10,
    message: hasSkills 
      ? 'Skills section is well-populated.' 
      : 'List at least 5 relevant skills.',
  });
  
  // 8. KEYWORD MATCHING (Optional, 20 pts bonus/incorporation)
  if (jobDescription) {
    const commonStopWords = new Set(['and', 'the', 'is', 'in', 'at', 'of', 'to', 'for', 'with', 'a', 'an', 'on', 'by']);
    const jdWords = jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const significantJdWords = jdWords.filter(w => !commonStopWords.has(w));
    
    // Count frequencies
    const keywordCounts: Record<string, number> = {};
    significantJdWords.forEach(w => keywordCounts[w] = (keywordCounts[w] || 0) + 1);
    
    // Get top 20 keywords
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
      
    // Check overlap
    const resumeText = JSON.stringify(resume).toLowerCase();
    const matchedKeywords = topKeywords.filter(w => resumeText.includes(w));
    const matchRatio = topKeywords.length > 0 ? matchedKeywords.length / topKeywords.length : 0;
    
    // Add logic for score
    const keywordMatchPassed = matchRatio >= 0.5; // Match 50% of top keywords
    const matchScore = Math.min(20, Math.ceil(matchRatio * 20));
    
    checks.push({
        id: 'keyword-match',
        name: 'Job Description Match',
        category: 'content',
        passed: keywordMatchPassed,
        score: matchScore,
        maxScore: 20,
        message: keywordMatchPassed
           ? 'Good keyword overlap with the job description.'
           : 'Try to include more keywords from the job description.',
        details: [`Matched: ${matchedKeywords.length}/${topKeywords.length} top keywords.`]
    });
  }

  // 9. PARSING: Section Headings (5 pts)
  // Check if standard sections exist (e.g. Work Experience, Education, Skills)
  // In our builder, these are fixed keys, but user might leave them empty.
  // We can check if populated sections have some content.
  // Actually, let's check if the user has renamed sections improperly?
  // Our db/resume model doesn't easily support custom section renaming in a way that breaks ATS 
  // unless they use the "custom" array.
  
  // Let's verify standard sections are present if they have data
  const hasWork = resume.work.length > 0;
  const hasEducation = resume.education.length > 0;
  const hasSkillsData = resume.skills.length > 0;
  
  // A simple heuristic: A good resume usually has all three.
  const allStandardSections = hasWork && hasEducation && hasSkillsData;
  
  checks.push({
      id: 'parsing-standard-sections',
      name: 'Standard Sections',
      category: 'formatting',
      passed: allStandardSections,
      score: allStandardSections ? 5 : 0,
      maxScore: 5,
      message: allStandardSections
          ? 'Standard sections (Work, Education, Skills) are present.'
          : 'Ensure you have Work, Education, and Skills sections for better ATS parsing.',
  });


  // Calculate Totals
  const currentScore = checks.reduce((acc, check) => acc + check.score, 0);
  const maxPossibleScore = checks.reduce((acc, check) => acc + check.maxScore, 0);
  const normalizedScore = Math.round((currentScore / maxPossibleScore) * 100);

  // Generate Feedback
  checks.filter(c => !c.passed || c.score < c.maxScore).forEach(c => {
      if (c.id === 'cliches' && !c.passed) {
          feedback.push(`Remove clichés like "${foundCliches[0]}" to be more specific.`);
      } else if (c.id === 'action-verbs' && !c.passed) {
          feedback.push('Start bullets with strong action verbs (Achieved, Created, Led).');
      } else {
          feedback.push(c.message);
      }
  });

  if (feedback.length === 0) {
    feedback.push('Excellent! Your resume is optimized for ATS.');
  }

  return {
    totalScore: normalizedScore,
    checks,
    feedback,
  };
};
