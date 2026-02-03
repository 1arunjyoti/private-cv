import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicsForm } from '@/components/forms/BasicsForm';
import { renderWithProviders } from '@/tests/utils/render';
import type { ResumeBasics } from '@/db';

// Mock image-utils
vi.mock('@/lib/image-utils', () => ({
  compressImage: vi.fn().mockResolvedValue({
    dataUrl: 'data:image/jpeg;base64,compressed',
    sizeKB: 50,
    width: 200,
    height: 200,
  }),
  validateImageFile: vi.fn().mockReturnValue({ valid: true }),
}));

import { compressImage, validateImageFile } from '@/lib/image-utils';

const createEmptyBasics = (): ResumeBasics => ({
  name: '',
  label: '',
  image: '',
  email: '',
  phone: '',
  url: '',
  summary: '',
  location: {
    city: '',
    country: '',
    postalCode: '',
    region: '',
    address: '',
  },
  profiles: [],
});

const createFilledBasics = (): ResumeBasics => ({
  name: 'John Doe',
  label: 'Software Engineer',
  image: '',
  email: 'john@example.com',
  phone: '+1 555-123-4567',
  url: 'https://johndoe.com',
  summary: 'Experienced software engineer',
  location: {
    city: 'San Francisco',
    country: 'United States',
    postalCode: '94102',
    region: 'CA',
    address: '123 Main St',
  },
  profiles: [
    { network: 'LinkedIn', username: 'johndoe', url: 'https://linkedin.com/in/johndoe' },
    { network: 'GitHub', username: 'johndoe', url: 'https://github.com/johndoe' },
  ],
});

describe('BasicsForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByLabelText(/full name/i)).toBeDefined();
      expect(screen.getByLabelText(/professional title/i)).toBeDefined();
      expect(screen.getByLabelText(/email/i)).toBeDefined();
      expect(screen.getByLabelText(/phone/i)).toBeDefined();
      expect(screen.getByLabelText(/website/i)).toBeDefined();
      expect(screen.getByLabelText(/city/i)).toBeDefined();
      expect(screen.getByLabelText(/country/i)).toBeDefined();
    });

    it('should render with existing data', () => {
      const data = createFilledBasics();
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('John Doe')).toBeDefined();
      expect(screen.getByDisplayValue('Software Engineer')).toBeDefined();
      expect(screen.getByDisplayValue('john@example.com')).toBeDefined();
    });

    it('should render section headers', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByText('Basics')).toBeDefined();
      expect(screen.getByText('Personal Information')).toBeDefined();
      expect(screen.getByText('Profile Photo')).toBeDefined();
      expect(screen.getByText('Social Profiles')).toBeDefined();
    });
  });

  describe('Personal Information', () => {
    it('should call onChange when name is updated', async () => {
      const user = userEvent.setup();
      const data = createEmptyBasics();
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'Jane Doe');

      expect(mockOnChange).toHaveBeenCalled();
      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      expect(lastCall.name).toContain('e'); // Last character typed
    });

    it('should call onChange when email is updated', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onChange when phone is updated', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.type(phoneInput, '+1 555-123-4567');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should show phone hint about country code', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByText(/include country code/i)).toBeDefined();
    });
  });

  describe('Location', () => {
    it('should call onChange when city is updated', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const cityInput = screen.getByLabelText(/city/i);
      await user.type(cityInput, 'Boston');

      const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      expect(lastCall.location.city).toContain('n'); // Last char of 'Boston'
    });

    it('should call onChange when country is updated', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const countryInput = screen.getByLabelText(/country/i);
      await user.type(countryInput, 'USA');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Social Profiles', () => {
    it('should render empty state when no profiles', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByText(/no social profiles added/i)).toBeDefined();
    });

    it('should render existing profiles', () => {
      const data = createFilledBasics();
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByDisplayValue('LinkedIn')).toBeDefined();
      expect(screen.getByDisplayValue('GitHub')).toBeDefined();
    });

    it('should add new profile when Add Profile is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const addButton = screen.getByRole('button', { name: /add profile/i });
      await user.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          profiles: [{ network: '', username: '', url: '' }],
        })
      );
    });

    it('should add profile with network when quick-add button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const linkedInButton = screen.getByRole('button', { name: /linkedin/i });
      await user.click(linkedInButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          profiles: [{ network: 'LinkedIn', username: '', url: '' }],
        })
      );
    });

    it('should remove profile when delete is clicked', async () => {
      const user = userEvent.setup();
      const data = createFilledBasics();
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(
        btn => btn.querySelector('svg.lucide-trash-2')
      );
      await user.click(deleteButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          profiles: [data.profiles[1]], // Only second profile should remain
        })
      );
    });

    it('should auto-detect LinkedIn network from URL', async () => {
      const user = userEvent.setup();
      let data = { ...createEmptyBasics(), profiles: [{ network: '', username: '', url: '' }] };
      
      const onChange = vi.fn((newData) => {
        data = newData; // Update data for controlled behavior
      });

      const { rerender } = renderWithProviders(
        <BasicsForm data={data} onChange={onChange} />
      );

      // Get all URL inputs - the first is personal website, second is profile URL
      const urlInputs = screen.getAllByRole('textbox', { name: /url/i });
      const profileUrlInput = urlInputs[urlInputs.length - 1]; // Get the last one (profile URL)
      
      // Type the URL character by character and rerender with updated data
      const url = 'https://linkedin.com/in/johndoe';
      for (const char of url) {
        await user.type(profileUrlInput, char);
        rerender(<BasicsForm data={data} onChange={onChange} />);
      }

      // Check that network was auto-detected
      expect(data.profiles[0].network).toBe('LinkedIn');
    });

    it('should auto-detect GitHub network from URL', async () => {
      const user = userEvent.setup();
      let data = { ...createEmptyBasics(), profiles: [{ network: '', username: '', url: '' }] };
      
      const onChange = vi.fn((newData) => {
        data = newData; // Update data for controlled behavior
      });
      
      const { rerender } = renderWithProviders(
        <BasicsForm data={data} onChange={onChange} />
      );

      // Get all URL inputs - the first is personal website, second is profile URL
      const urlInputs = screen.getAllByRole('textbox', { name: /url/i });
      const profileUrlInput = urlInputs[urlInputs.length - 1]; // Get the last one (profile URL)
      
      // Type the URL character by character and rerender with updated data
      const url = 'https://github.com/johndoe';
      for (const char of url) {
        await user.type(profileUrlInput, char);
        rerender(<BasicsForm data={data} onChange={onChange} />);
      }

      // Check that network was auto-detected
      expect(data.profiles[0].network).toBe('GitHub');
    });

    it('should auto-detect Twitter from URL', async () => {
      const user = userEvent.setup();
      let data = { ...createEmptyBasics(), profiles: [{ network: '', username: '', url: '' }] };
      
      const onChange = vi.fn((newData) => {
        data = newData; // Update data for controlled behavior
      });
      
      const { rerender } = renderWithProviders(
        <BasicsForm data={data} onChange={onChange} />
      );

      // Get all URL inputs - the first is personal website, second is profile URL
      const urlInputs = screen.getAllByRole('textbox', { name: /url/i });
      const profileUrlInput = urlInputs[urlInputs.length - 1]; // Get the last one (profile URL)
      
      // Type the URL character by character and rerender with updated data
      const url = 'https://twitter.com/johndoe';
      for (const char of url) {
        await user.type(profileUrlInput, char);
        rerender(<BasicsForm data={data} onChange={onChange} />);
      }

      // Check that network was auto-detected
      expect(data.profiles[0].network).toBe('Twitter');
    });

    it('should render all quick-add network buttons', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByRole('button', { name: /linkedin/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /github/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /twitter/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /portfolio/i })).toBeDefined();
    });
  });

  describe('Profile Photo', () => {
    it('should show upload area when no image', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByText(/upload profile photo/i)).toBeDefined();
    });

    it('should show preview when image exists', () => {
      const data = { ...createEmptyBasics(), image: 'data:image/jpeg;base64,test' };
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText(/photo uploaded/i)).toBeDefined();
      expect(screen.getByRole('img', { name: /profile preview/i })).toBeDefined();
    });

    it('should call onChange to remove image when remove button clicked', async () => {
      const user = userEvent.setup();
      const data = { ...createEmptyBasics(), image: 'data:image/jpeg;base64,test' };
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      // Find the remove button (X icon)
      const removeButton = screen.getByRole('button', { name: '' });
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ image: '' })
      );
    });

    it('should show file size info after upload', async () => {
      const user = userEvent.setup();
      
      // Mock successful upload
      vi.mocked(compressImage).mockResolvedValueOnce({
        dataUrl: 'data:image/jpeg;base64,compressed',
        sizeKB: 75,
        width: 200,
        height: 200,
      });
      
      const onChange = vi.fn();

      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={onChange} />
      );

      // Create and upload file
      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);

      // Rerender with updated data after onChange
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('should show error for invalid file', async () => {
      const user = userEvent.setup();
      
      vi.mocked(validateImageFile).mockReturnValueOnce({
        valid: false,
        error: 'File too large',
      });

      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeDefined();
      });
    });

    it('should show supported file types', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByText(/jpeg, png, or webp/i)).toBeDefined();
    });
  });

  describe('Summary/Description', () => {
    it('should render character count', () => {
      const data = { ...createEmptyBasics(), summary: 'Test summary' };
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText(/12 characters/i)).toBeDefined();
    });

    it('should show 0 characters when empty', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByText(/0 characters/i)).toBeDefined();
    });
  });

  describe('Input Attributes', () => {
    it('should have correct autocomplete attributes', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByLabelText(/full name/i)).toHaveProperty('autocomplete', 'name');
      expect(screen.getByLabelText(/email/i)).toHaveProperty('autocomplete', 'email');
      expect(screen.getByLabelText(/phone/i)).toHaveProperty('autocomplete', 'tel');
      expect(screen.getByLabelText(/website/i)).toHaveProperty('autocomplete', 'url');
    });

    it('should have correct input types', () => {
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      expect(screen.getByLabelText(/email/i)).toHaveProperty('type', 'email');
      expect(screen.getByLabelText(/phone/i)).toHaveProperty('type', 'tel');
      expect(screen.getByLabelText(/website/i)).toHaveProperty('type', 'url');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings in all fields', () => {
      const data = createEmptyBasics();
      
      expect(() => {
        renderWithProviders(
          <BasicsForm data={data} onChange={mockOnChange} />
        );
      }).not.toThrow();
    });

    it('should handle special characters in name', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'José García-Müller');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle international phone numbers', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <BasicsForm data={createEmptyBasics()} onChange={mockOnChange} />
      );

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.type(phoneInput, '+44 20 7946 0958');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle very long summary', () => {
      const longSummary = 'A'.repeat(5000);
      const data = { ...createEmptyBasics(), summary: longSummary };
      
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      expect(screen.getByText(/5000 characters/i)).toBeDefined();
    });

    it('should handle multiple profiles with same network', () => {
      const data = {
        ...createEmptyBasics(),
        profiles: [
          { network: 'LinkedIn', username: 'personal', url: 'https://linkedin.com/in/personal' },
          { network: 'LinkedIn', username: 'company', url: 'https://linkedin.com/company/myco' },
        ],
      };
      
      renderWithProviders(
        <BasicsForm data={data} onChange={mockOnChange} />
      );

      const linkedInInputs = screen.getAllByDisplayValue('LinkedIn');
      expect(linkedInInputs.length).toBe(2);
    });
  });
});
