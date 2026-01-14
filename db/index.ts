import Dexie, { type EntityTable } from 'dexie';

// Resume data model based on JSON Resume standard
export interface ResumeBasics {
  name: string;
  label: string;
  image?: Blob;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: {
    city: string;
    country: string;
  };
  profiles: {
    network: string;
    username: string;
    url: string;
  }[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  url: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  score: string;
  courses: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: string;
  keywords: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  highlights: string[];
  keywords: string[];
  startDate: string;
  endDate: string;
  url: string;
}

export interface Resume {
  id: string;
  meta: {
    title: string;
    templateId: string;
    themeColor: string;
    lastModified: string;
  };
  basics: ResumeBasics;
  work: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  defaultTemplateId: string;
}

// Dexie database definition
const db = new Dexie('ResumeBuilderDB') as Dexie & {
  resumes: EntityTable<Resume, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

// Schema version 1
db.version(1).stores({
  resumes: 'id, meta.title, meta.lastModified',
  settings: 'id',
});

export { db };
