import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkForm } from '@/components/forms/WorkForm';
import { renderWithProviders } from '@/tests/utils/render';
import type { WorkExperience } from '@/db';

// Mock uuid to return predictable IDs
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-work'),
}));

const createEmptyWorkExperience = (): WorkExperience => ({
  id: 'work-1',
  company: '',
  position: '',
  url: '',
  startDate: '',
  endDate: '',
  summary: '',
  highlights: [],
  location: '',
  name: '',
});

const createFilledWorkExperience = (): WorkExperience => ({
  id: 'work-1',
  company: 'Tech Corp',
  position: 'Senior Software Engineer',
  url: 'https://techcorp.com',
  startDate: '2020-01',
  endDate: '2023-06',
  summary: 'Led development of microservices architecture',
  highlights: [
    'Increased system performance by 40%',
    'Mentored team of 5 junior developers',
  ],
  location: 'San Francisco, CA',
  name: 'Tech Corp',
});

const createMultipleWorkExperiences = (): WorkExperience[] => [
  {
    id: 'work-1',
    company: 'Current Company',
    position: 'Staff Engineer',
    url: 'https://current.com',
    startDate: '2023-07',
    endDate: '',
    summary: 'Current role',
    highlights: ['Leading architecture'],
    location: 'Remote',
    name: 'Current Company',
  },
  {
    id: 'work-2',
    company: 'Previous Company',
    position: 'Senior Engineer',
    url: 'https://previous.com',
    startDate: '2020-01',
    endDate: '2023-06',
    summary: 'Previous role',
    highlights: ['Built features'],
    location: 'NYC',
    name: 'Previous Company',
  },
];

describe('WorkForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render header and add button', () => {
      renderWithProviders(
        <WorkForm data={[]} onChange={mockOnChange} />
      );

      expect(screen.getByText('Professional Experience')).toBeDefined();
      expect(screen.getByRole('button', { name: /add experience/i })).toBeDefined();
    });

    it('should render empty state when no experiences', () => {
      renderWithProviders(
        <WorkForm data={[]} onChange={mockOnChange} />
      );

      expect(screen.getByText(/no professional experience added/i)).toBeDefined();
    });

    it('should render experience entry with all fields', () => {
      const data = [createFilledWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('Tech Corp')).toBeDefined();
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeDefined();
      expect(screen.getByDisplayValue('https://techcorp.com')).toBeDefined();
    });

    it('should render multiple experiences', () => {
      const data = createMultipleWorkExperiences();
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('Current Company')).toBeDefined();
      expect(screen.getByDisplayValue('Previous Company')).toBeDefined();
    });

    it('should show experience title in section header', () => {
      const data = [createFilledWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText(/senior software engineer at tech corp/i)).toBeDefined();
    });

    it('should show "New Experience" for empty entry', () => {
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('New Experience')).toBeDefined();
    });
  });

  describe('Adding Experience', () => {
    it('should add new experience when button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <WorkForm data={[]} onChange={mockOnChange} />
      );

      const addButton = screen.getByRole('button', { name: /add experience/i });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'test-uuid-work',
          company: '',
          position: '',
        }),
      ]);
    });

    it('should append to existing experiences', async () => {
      const user = userEvent.setup();
      const existingData = [createFilledWorkExperience()];
      renderWithProviders(
        <WorkForm data={existingData} onChange={mockOnChange} />
      );

      const addButton = screen.getByRole('button', { name: /add experience/i });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        existingData[0],
        expect.objectContaining({ id: 'test-uuid-work' }),
      ]);
    });
  });

  describe('Removing Experience', () => {
    it('should remove experience when delete clicked', async () => {
      const user = userEvent.setup();
      const data = [createFilledWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const deleteButton = screen.getByRole('button', { name: /remove experience/i });
      await user.click(deleteButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should remove only the clicked experience', async () => {
      const user = userEvent.setup();
      const data = createMultipleWorkExperiences();
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /remove experience/i });
      await user.click(deleteButtons[0]); // Remove first

      expect(mockOnChange).toHaveBeenCalledWith([data[1]]);
    });
  });

  describe('Updating Fields', () => {
    it('should update company field', async () => {
      const user = userEvent.setup();
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const companyInput = screen.getByLabelText('Company');
      await user.type(companyInput, 'New Company');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update position field', async () => {
      const user = userEvent.setup();
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const positionInput = screen.getByLabelText(/position/i);
      await user.type(positionInput, 'Developer');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update company URL field', async () => {
      const user = userEvent.setup();
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const urlInput = screen.getByLabelText(/company website/i);
      await user.type(urlInput, 'https://example.com');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update start date', async () => {
      const user = userEvent.setup();
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2020-01');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should update end date', async () => {
      const user = userEvent.setup();
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, '2023-06');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Highlights/Achievements', () => {
    it('should add highlight when Add button clicked', async () => {
      const user = userEvent.setup();
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const addHighlightButton = screen.getByRole('button', { name: /add$/i });
      await user.click(addHighlightButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          highlights: [''],
        }),
      ]);
    });

    it('should render existing highlights', () => {
      const data = [createFilledWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('Increased system performance by 40%')).toBeDefined();
      expect(screen.getByDisplayValue('Mentored team of 5 junior developers')).toBeDefined();
    });

    it('should update highlight text', async () => {
      const user = userEvent.setup();
      const data = [{
        ...createEmptyWorkExperience(),
        highlights: ['Original highlight'],
      }];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const highlightInput = screen.getByLabelText(/achievement 1/i);
      await user.clear(highlightInput);
      await user.type(highlightInput, 'Updated highlight');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should remove highlight when delete clicked', async () => {
      const user = userEvent.setup();
      const data = [{
        ...createEmptyWorkExperience(),
        highlights: ['First', 'Second'],
      }];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const removeButtons = screen.getAllByRole('button', { name: /remove achievement/i });
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([
        expect.objectContaining({
          highlights: ['Second'],
        }),
      ]);
    });

    it('should show bullet points for highlights', () => {
      const data = [{
        ...createEmptyWorkExperience(),
        highlights: ['Achievement one'],
      }];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('•')).toBeDefined();
    });
  });

  describe('Input Attributes', () => {
    it('should have correct autocomplete attributes', () => {
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const companyInput = screen.getByLabelText('Company');
      const positionInput = screen.getByLabelText(/position/i);
      const urlInput = screen.getByLabelText(/company website/i);

      expect(companyInput).toHaveProperty('autocomplete', 'organization');
      expect(positionInput).toHaveProperty('autocomplete', 'organization-title');
      expect(urlInput).toHaveProperty('autocomplete', 'url');
    });

    it('should use month input type for dates', () => {
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      expect(startDateInput).toHaveProperty('type', 'month');
      expect(endDateInput).toHaveProperty('type', 'month');
    });
  });

  describe('Section Numbering', () => {
    it('should show correct numbering for multiple experiences', () => {
      const data = createMultipleWorkExperiences();
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('#1')).toBeDefined();
      expect(screen.getByText('#2')).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty experience data', () => {
      expect(() => {
        renderWithProviders(
          <WorkForm data={[]} onChange={mockOnChange} />
        );
      }).not.toThrow();
    });

    it('should handle special characters in company name', async () => {
      const user = userEvent.setup();
      const data = [createEmptyWorkExperience()];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const companyInput = screen.getByLabelText('Company');
      await user.type(companyInput, 'Société Générale & Co.');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle very long company names', () => {
      const data = [{
        ...createEmptyWorkExperience(),
        company: 'A'.repeat(200),
        position: 'B'.repeat(100),
      }];
      
      expect(() => {
        renderWithProviders(
          <WorkForm data={data} onChange={mockOnChange} />
        );
      }).not.toThrow();
    });

    it('should handle many highlights', () => {
      const data = [{
        ...createEmptyWorkExperience(),
        highlights: Array(20).fill('Achievement'),
      }];
      
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const inputs = screen.getAllByPlaceholderText(/increased revenue/i);
      expect(inputs.length).toBe(20);
    });

    it('should handle current position (empty end date)', () => {
      const data = [{
        ...createFilledWorkExperience(),
        endDate: '',
      }];
      
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const endDateInput = screen.getByLabelText(/end date/i);
      expect(endDateInput).toHaveProperty('value', '');
    });

    it('should preserve other experience data when updating one', async () => {
      const user = userEvent.setup();
      const data = createMultipleWorkExperiences();
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      const companyInputs = screen.getAllByLabelText(/company/i);
      await user.type(companyInputs[0], ' Updated');

      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      expect(lastCall[1]).toEqual(data[1]); // Second experience unchanged
    });
  });

  describe('Section Title Generation', () => {
    it('should show only position if company is empty', () => {
      const data = [{
        ...createEmptyWorkExperience(),
        position: 'Developer',
        company: '',
      }];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('Developer')).toBeDefined();
    });

    it('should show only company if position is empty', () => {
      const data = [{
        ...createEmptyWorkExperience(),
        position: '',
        company: 'Acme Inc',
      }];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('Acme Inc')).toBeDefined();
    });

    it('should show both with "at" when both present', () => {
      const data = [{
        ...createEmptyWorkExperience(),
        position: 'Developer',
        company: 'Acme Inc',
      }];
      renderWithProviders(
        <WorkForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText('Developer at Acme Inc')).toBeDefined();
    });
  });
});
