import type { Resume } from "@/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a realistic mock resume for testing purposes.
 * This allows developers to quickly fill the editor with sample data.
 */
export function generateMockResume(): Omit<Resume, "id" | "meta"> {
  return {
    basics: {
      name: "Alex Johnson",
      label: "Senior Full-Stack Developer",
      image: "",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 123-4567",
      url: "https://alexjohnson.dev",
      summary:
        "Passionate full-stack developer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Strong advocate for clean code, testing, and developer experience. Led teams of 5-10 engineers and delivered products used by millions.",
      location: {
        address: "",
        city: "San Francisco",
        region: "",
        postalCode: "",
        country: "USA",
      },
      profiles: [
        { network: "GitHub", username: "alexjdev", url: "https://github.com/alexjdev" },
        { network: "LinkedIn", username: "alexjohnsondev", url: "https://linkedin.com/in/alexjohnsondev" },
      ],
    },
    work: [
      {
        id: uuidv4(),
        company: "TechCorp Inc.",
        position: "Senior Full-Stack Developer",
        url: "https://techcorp.example.com",
        startDate: "2021-03",
        endDate: "",
        summary: "Leading development of the company's flagship SaaS platform.",
        highlights: [
          "Architected and led migration from monolith to microservices, reducing deployment time by 70%",
          "Built real-time collaboration features using WebSockets, serving 50,000+ concurrent users",
          "Mentored 5 junior developers through pair programming and code reviews",
          "Implemented CI/CD pipeline reducing release cycle from 2 weeks to daily deployments",
        ],
        location: "San Francisco, CA",
        name: "TechCorp Inc.",
      },
      {
        id: uuidv4(),
        company: "StartupXYZ",
        position: "Full-Stack Developer",
        url: "https://startupxyz.example.com",
        startDate: "2018-06",
        endDate: "2021-02",
        summary: "Core member of a fast-paced startup team building innovative fintech solutions.",
        highlights: [
          "Developed payment processing system handling $10M+ monthly transactions",
          "Created responsive mobile-first UI increasing mobile conversion by 35%",
          "Integrated with 15+ third-party APIs including Stripe, Plaid, and Twilio",
        ],
        location: "Remote",
        name: "StartupXYZ",
      },
      {
        id: uuidv4(),
        company: "WebAgency Co.",
        position: "Junior Developer",
        url: "",
        startDate: "2016-01",
        endDate: "2018-05",
        summary: "Started career building websites and web applications for various clients.",
        highlights: [
          "Delivered 20+ client projects on time and within budget",
          "Learned agile methodologies and best practices for collaborative development",
        ],
        location: "New York, NY",
        name: "WebAgency Co.",
      },
    ],
    education: [
      {
        id: uuidv4(),
        institution: "University of California, Berkeley",
        url: "https://berkeley.edu",
        area: "Computer Science",
        studyType: "Bachelor of Science",
        startDate: "2012-09",
        endDate: "2016-05",
        score: "3.8 GPA",
        courses: [
          "Data Structures & Algorithms",
          "Operating Systems",
          "Database Systems",
          "Software Engineering",
        ],
      },
    ],
    skills: [
      {
        id: uuidv4(),
        name: "Frontend",
        level: "Expert",
        keywords: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux"],
      },
      {
        id: uuidv4(),
        name: "Backend",
        level: "Expert",
        keywords: ["Node.js", "Python", "PostgreSQL", "Redis", "GraphQL"],
      },
      {
        id: uuidv4(),
        name: "DevOps & Cloud",
        level: "Advanced",
        keywords: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions"],
      },
      {
        id: uuidv4(),
        name: "Tools & Practices",
        level: "Expert",
        keywords: ["Git", "Agile/Scrum", "TDD", "CI/CD", "Code Review"],
      },
    ],
    projects: [
      {
        id: uuidv4(),
        name: "Open Source Component Library",
        description:
          "Created and maintain a popular React component library with 2,000+ GitHub stars. Focuses on accessibility and developer experience.",
        highlights: [
          "Published to npm with 50,000+ weekly downloads",
          "Comprehensive documentation and Storybook examples",
        ],
        keywords: ["React", "TypeScript", "Storybook", "a11y"],
        startDate: "2020-01",
        endDate: "",
        url: "https://github.com/alexjdev/component-lib",
      },
      {
        id: uuidv4(),
        name: "Personal Finance Dashboard",
        description:
          "A privacy-focused personal finance tracker that runs entirely in the browser using IndexedDB.",
        highlights: [
          "Zero server dependencies, all data stored locally",
          "Interactive charts and budget tracking",
        ],
        keywords: ["Next.js", "IndexedDB", "Chart.js"],
        startDate: "2022-06",
        endDate: "2022-12",
        url: "https://finance.alexjohnson.dev",
      },
    ],
    certificates: [
      {
        id: uuidv4(),
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023-01",
        url: "https://aws.amazon.com",
        summary: "Validated expertise in designing distributed systems on AWS.",
      },
    ],
    languages: [
      {
        id: uuidv4(),
        language: "English",
        fluency: "Native speaker",
      },
      {
        id: uuidv4(),
        language: "Spanish",
        fluency: "Intermediate",
      },
    ],
    interests: [
      {
        id: uuidv4(),
        name: "Open Source",
        keywords: ["Contributing", "Mentoring"],
      },
    ],
    publications: [
      {
        id: uuidv4(),
        name: "The Future of Web Development",
        publisher: "Tech Magazine",
        releaseDate: "2022-06",
        url: "https://techmagazine.com",
        summary: "An in-depth look at the latest trends and technologies in web development.",
      },
    ],
    awards: [
      {
        id: uuidv4(),
        title: "Best Developer",
        awarder: "Tech Awards",
        date: "2022-06",
        summary: "Awarded for outstanding contributions to the tech industry.",
      },
    ],
    references: [
      {
        id: uuidv4(),
        name: "John Doe",
        position: "Senior Developer",
        reference: "John Doe is a senior developer with 10+ years of experience in software development. He has a proven track record of delivering high-quality software solutions and is a strong advocate for clean code and testing.",
      },
    ],
    custom: [
      {
        id: uuidv4(),
        name: "Custom Section",
        items: [
          {
            id: uuidv4(),
            name: "Custom Item",
            description:
              "This is a custom section that can be used to add any additional information to your resume.",
            date: "",
            url: "",
            summary: "",
          },
        ],
      },
    ],
  };
}
