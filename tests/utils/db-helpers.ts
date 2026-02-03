import { db, type Resume } from '@/db';

/**
 * Clear all data from the test database
 */
export async function clearTestDatabase(): Promise<void> {
  await db.resumes.clear();
}

/**
 * Seed the database with test data
 */
export async function seedTestData(resumes: Resume[]): Promise<void> {
  await db.resumes.bulkAdd(resumes);
}

/**
 * Get all resumes from the database
 */
export async function getAllResumes(): Promise<Resume[]> {
  return await db.resumes.toArray();
}

/**
 * Get a single resume by ID
 */
export async function getResumeById(id: string): Promise<Resume | undefined> {
  return await db.resumes.get(id);
}

/**
 * Check if a resume exists in the database
 */
export async function resumeExists(id: string): Promise<boolean> {
  const count = await db.resumes.where('id').equals(id).count();
  return count > 0;
}

/**
 * Delete a resume by ID
 */
export async function deleteResumeById(id: string): Promise<void> {
  await db.resumes.delete(id);
}

/**
 * Update a resume in the database
 */
export async function updateResume(id: string, updates: Partial<Resume>): Promise<void> {
  await db.resumes.update(id, updates);
}

/**
 * Count total resumes in database
 */
export async function countResumes(): Promise<number> {
  return await db.resumes.count();
}

/**
 * Setup database for testing - clears and optionally seeds
 */
export async function setupTestDatabase(seedData?: Resume[]): Promise<void> {
  await clearTestDatabase();
  if (seedData && seedData.length > 0) {
    await seedTestData(seedData);
  }
}

/**
 * Teardown database after testing
 */
export async function teardownTestDatabase(): Promise<void> {
  await clearTestDatabase();
}
