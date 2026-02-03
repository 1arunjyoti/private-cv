import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EducationForm } from '@/components/forms/EducationForm';
import { renderWithProviders } from '@/tests/utils/render';
import type { Education } from '@/db';

// Mock uuid to return predictable IDs
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-edu'),
}));

const createEmptyEducation = (): Education => ({
  id: 'edu-1',
  institution: '',
  url: '',
  area: '',
  studyType: '',
  startDate: '',
  endDate: '',
  score: '',
  summary: '',
  courses: [],
});

const createFilledEducation = (): Education => ({
  id: 'edu-1',
  institution: 'MIT',
  url: 'https://mit.edu',
  area: 'Computer Science',
  studyType: "Bachelor's",
  startDate: '2016-09',
  endDate: '2020-05',
  score: 'GPA: 3.9/4.0',
  summary: 'Graduated with honors',
  courses: ['Data Structures', 'Algorithms', 'Machine Learning'],
});

const createMultipleEducation = (): Education[] => [
  {
    id: 'edu-1',
    institution: 'Stanford University',
    url: 'https://stanford.edu',
    area: 'Computer Science',
    studyType: "Master's",
    startDate: '2020-09',
    endDate: '2022-06',
    score: 'GPA: 4.0/4.0',
    summary: 'Focus on AI',
    courses: ['Deep Learning', 'NLP'],
  },
  {
    id: 'edu-2',
    institution: 'State University',
    url: 'https://state.edu',
    area: 'Mathematics',
    studyType: "Bachelor's",
    startDate: '2016-09',
    endDate: '2020-05',
    score: 'CGPA: 3.8/4.0',
    summary: 'Minor in CS',
    courses: ['Linear Algebra', 'Statistics'],
  },
];

describe('EducationForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render header and add button', () => {
      renderWithProviders(
        <EducationForm data={[]} onChange={mockOnChange} />
      );

      expect(screen.getByText('Education')).toBeDefined();
      expect(screen.getByRole('button', { name: /add education/i })).toBeDefined();
    });

    it('should render empty state when no education entries', () => {
      renderWithProviders(
        <EducationForm data={[]} onChange={mockOnChange} />
      );

      expect(screen.getByText(/no education added yet/i)).toBeDefined();
    });

    it('should render education entry with all fields', () => {
      const data = [createFilledEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('MIT')).toBeDefined();
      expect(screen.getByDisplayValue('Computer Science')).toBeDefined();
      expect(screen.getByDisplayValue("Bachelor's")).toBeDefined();
    });

    it('should render multiple education entries', () => {
      const data = createMultipleEducation();
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('Stanford University')).toBeDefined();
      expect(screen.getByDisplayValue('State University')).toBeDefined();
    });

    it('should show "New Education" for empty entry', () => {
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('New Education')).toBeDefined();
    });
  });

  describe('Adding Education', () => {
    it('should add new education when button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <EducationForm data={[]} onChange={mockOnChange} />
      );

      const addButton = screen.getByRole('button', { name: /add education/i });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'test-uuid-edu',
          institution: '',
          area: '',
        }),
      ]);
    });

    it('should append to existing education entries', async () => {
      const user = userEvent.setup();
      const existingData = [createFilledEducation()];
      renderWithProviders(
        <EducationForm data={existingData} onChange={mockOnChange} />
      );

      const addButton = screen.getByRole('button', { name: /add education/i });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        existingData[0],
        expect.objectContaining({ id: 'test-uuid-edu' }),
      ]);
    });
  });

  describe('Removing Education', () => {
    it('should remove education when delete clicked', async () => {
      const user = userEvent.setup();
      const data = [createFilledEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const deleteButton = screen.getByRole('button', { name: /remove education/i });
      await user.click(deleteButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should remove only the clicked education entry', async () => {
      const user = userEvent.setup();
      const data = createMultipleEducation();
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /remove education/i });
      await user.click(deleteButtons[0]); // Remove first

      expect(mockOnChange).toHaveBeenCalledWith([data[1]]);
    });
  });

  describe('Updating Fields', () => {
    it('should update institution field', async () => {
      const user = userEvent.setup();
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const institutionInput = screen.getByLabelText(/institution/i);
      await user.type(institutionInput, 'Harvard');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update website field', async () => {
      const user = userEvent.setup();
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const urlInput = screen.getByLabelText(/website/i);
      await user.type(urlInput, 'https://harvard.edu');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update degree type field', async () => {
      const user = userEvent.setup();
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const degreeInput = screen.getByLabelText(/degree type/i);
      await user.type(degreeInput, 'PhD');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update field of study', async () => {
      const user = userEvent.setup();
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const areaInput = screen.getByLabelText(/field of study/i);
      await user.type(areaInput, 'Physics');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update start date', async () => {
      const user = userEvent.setup();
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2020-09');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update end date', async () => {
      const user = userEvent.setup();
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, '2024-05');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Score Field', () => {
    it('should render score type dropdown', () => {
      const data = [createFilledEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByRole('combobox')).toBeDefined();
    });

    it('should extract score value from formatted score', () => {
      const data = [{ ...createEmptyEducation(), score: 'GPA: 3.9/4.0' }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('3.9/4.0')).toBeDefined();
    });

    it('should update score value', async () => {
      const user = userEvent.setup();
      const data = [{ ...createEmptyEducation(), score: 'GPA: ' }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const scoreInput = screen.getByPlaceholderText(/e.g. 3.8\/4.0/i);
      await user.type(scoreInput, '3.5/4.0');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should support different score types', () => {
      const data = [{ ...createEmptyEducation(), score: 'CGPA: 8.5/10' }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('8.5/10')).toBeDefined();
    });

    it('should support percentage score', () => {
      const data = [{ ...createEmptyEducation(), score: 'Percentage: 95%' }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('95%')).toBeDefined();
    });
  });

  describe('Courses', () => {
    it('should add course when Add button clicked', async () => {
      const user = userEvent.setup();
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const addCourseButton = screen.getByRole('button', { name: /add$/i });
      await user.click(addCourseButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          courses: [''],
        }),
      ]);
    });

    it('should render existing courses', () => {
      const data = [createFilledEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('Data Structures')).toBeDefined();
      expect(screen.getByDisplayValue('Algorithms')).toBeDefined();
      expect(screen.getByDisplayValue('Machine Learning')).toBeDefined();
    });

    it('should update course text', async () => {
      const user = userEvent.setup();
      const data = [{
        ...createEmptyEducation(),
        courses: ['Original Course'],
      }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const courseInput = screen.getByLabelText(/course 1/i);
      await user.clear(courseInput);
      await user.type(courseInput, 'Updated Course');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should remove course when delete clicked', async () => {
      const user = userEvent.setup();
      const data = [{
        ...createEmptyEducation(),
        courses: ['First', 'Second', 'Third'],
      }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const removeButtons = screen.getAllByRole('button', { name: /remove course/i });
      await user.click(removeButtons[1]); // Remove second

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          courses: ['First', 'Third'],
        }),
      ]);
    });

    it('should show bullet points for courses', () => {
      const data = [{
        ...createEmptyEducation(),
        courses: ['Course One'],
      }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('•')).toBeDefined();
    });
  });

  describe('Section Title Generation', () => {
    it('should show degree and area in title', () => {
      const data = [{
        ...createEmptyEducation(),
        studyType: "Master's",
        area: 'Data Science',
        institution: 'Stanford',
      }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText("Master's in Data Science - Stanford")).toBeDefined();
    });

    it('should show only area and institution if no degree', () => {
      const data = [{
        ...createEmptyEducation(),
        studyType: '',
        area: 'Engineering',
        institution: 'MIT',
      }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('Engineering - MIT')).toBeDefined();
    });

    it('should show only institution if no area', () => {
      const data = [{
        ...createEmptyEducation(),
        studyType: '',
        area: '',
        institution: 'Harvard',
      }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('Harvard')).toBeDefined();
    });
  });

  describe('Section Numbering', () => {
    it('should show correct numbering for multiple entries', () => {
      const data = createMultipleEducation();
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('#1')).toBeDefined();
      expect(screen.getByText('#2')).toBeDefined();
    });
  });

  describe('Input Attributes', () => {
    it('should have correct autocomplete attributes', () => {
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByLabelText(/institution/i)).toHaveProperty('autocomplete', 'organization');
      expect(screen.getByLabelText(/website/i)).toHaveProperty('autocomplete', 'url');
    });

    it('should use month input type for dates', () => {
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByLabelText(/start date/i)).toHaveProperty('type', 'month');
      expect(screen.getByLabelText(/end date/i)).toHaveProperty('type', 'month');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty education data', () => {
      expect(() => {
        renderWithProviders(
          <EducationForm data={[]} onChange={mockOnChange} />
        );
      }).not.toThrow();
    });

    it('should handle special characters in institution name', async () => {
      const user = userEvent.setup();
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const institutionInput = screen.getByLabelText(/institution/i);
      await user.type(institutionInput, 'École Polytechnique Fédérale');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle very long institution names', () => {
      const data = [{
        ...createEmptyEducation(),
        institution: 'A'.repeat(200),
      }];
      
      expect(() => {
        renderWithProviders(
          <EducationForm data={data} onChange={mockOnChange} />
        );
      }).not.toThrow();
    });

    it('should handle many courses', () => {
      const data = [{
        ...createEmptyEducation(),
        courses: Array(15).fill('Course Name'),
      }];
      
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const inputs = screen.getAllByPlaceholderText(/data structures/i);
      expect(inputs.length).toBe(15);
    });

    it('should handle ongoing education (empty end date)', () => {
      const data = [{
        ...createFilledEducation(),
        endDate: '',
      }];
      
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const endDateInput = screen.getByLabelText(/end date/i);
      expect(endDateInput).toHaveProperty('value', '');
    });

    it('should handle score without prefix', () => {
      const data = [{ ...createEmptyEducation(), score: '3.8' }];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      // Should default to Score type
      expect(screen.getByDisplayValue('3.8')).toBeDefined();
    });

    it('should preserve other education data when updating one', async () => {
      const user = userEvent.setup();
      const data = createMultipleEducation();
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      const institutionInputs = screen.getAllByLabelText(/institution/i);
      await user.type(institutionInputs[0], ' Updated');

      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      expect(lastCall[1]).toEqual(data[1]); // Second entry unchanged
    });

    it('should handle undefined summary', () => {
      const data = [{
        ...createEmptyEducation(),
        summary: undefined as unknown as string,
      }];
      
      expect(() => {
        renderWithProviders(
          <EducationForm data={data} onChange={mockOnChange} />
        );
      }).not.toThrow();
    });
  });

  describe('Description Field', () => {
    it('should render description editor', () => {
      const data = [createEmptyEducation()];
      renderWithProviders(
        <EducationForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByLabelText(/description/i)).toBeDefined();
    });
  });
});
