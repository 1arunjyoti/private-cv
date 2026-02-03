import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock PDF parsing endpoint
  http.post('http://localhost:3000/api/parse-pdf', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size limits (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return HttpResponse.json(
        { error: 'File size exceeds maximum limit of 5MB' },
        { status: 400 }
      );
    }

    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return HttpResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    // Simulate corrupted file by checking file name
    if (file.name.includes('corrupted')) {
      return HttpResponse.json(
        { 
          error: 'Failed to read PDF content',
          details: 'The PDF may be corrupted, encrypted, or use unsupported features.',
          suggestion: 'Try opening the PDF in a viewer and saving it as a new PDF, or convert it to DOCX format.'
        },
        { status: 422 }
      );
    }

    // Simulate scanned PDF for small files
    if (file.size < 2000) {
      return HttpResponse.json({
        success: true,
        text: 'John Doe\nEmail: john@example.com',
        numPages: 1,
        warning: 'This PDF appears to be image-based or scanned. Text extraction may be incomplete. For better results, please use a text-based PDF or convert to DOCX format.'
      });
    }

    // Mock successful PDF parsing response
    return HttpResponse.json({
      success: true,
      text: `JOHN DOE
Senior Software Engineer
john.doe@email.com | +1-555-0123 | linkedin.com/in/johndoe

WORK EXPERIENCE

Senior Software Engineer
Tech Company Inc | Jan 2020 - Present
• Led development of microservices architecture
• Improved application performance by 40%
• Mentored team of 5 junior developers

Software Engineer
Startup Co | Jun 2017 - Dec 2019
• Built RESTful APIs using Node.js
• Implemented CI/CD pipeline
• Collaborated with cross-functional teams

EDUCATION

Bachelor of Science in Computer Science
University of Technology | 2013 - 2017
GPA: 3.8/4.0

SKILLS

Programming: JavaScript, TypeScript, Python, Java
Web Development: React, Node.js, Express, Next.js
Databases: PostgreSQL, MongoDB, Redis
Tools: Git, Docker, Kubernetes, AWS`,
      numPages: 1
    });
  }),

  // Mock DOCX parsing endpoint
  http.post('http://localhost:3000/api/parse-docx', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Mock successful DOCX parsing response
    return HttpResponse.json({
      success: true,
      text: `JANE SMITH
Product Manager
jane.smith@email.com | +1-555-9876

EXPERIENCE

Product Manager | Tech Corp | 2021 - Present
• Defined product roadmap and strategy
• Launched 3 major features
• Increased user engagement by 30%

EDUCATION

MBA | Business School | 2019 - 2021
Bachelor of Arts in Economics | State University | 2015 - 2019

SKILLS

Product Management, Agile, Scrum, Data Analysis`
    });
  })
];
