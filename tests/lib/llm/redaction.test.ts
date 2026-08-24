import { describe, it, expect } from 'vitest';
import { redactContactInfo } from '@/lib/llm/redaction';

describe('redactContactInfo', () => {
  it('redacts plain email addresses', () => {
    expect(redactContactInfo('contact me at john.doe@example.com')).toBe(
      'contact me at [redacted-email]'
    );
  });

  it('redacts multiple emails', () => {
    const result = redactContactInfo('a@b.co and second.name+tag@mail.example.org');
    expect(result).not.toContain('@');
    expect(result.match(/\[redacted-email\]/g)).toHaveLength(2);
  });

  it('is case-insensitive for emails', () => {
    expect(redactContactInfo('EMAIL: USER@EXAMPLE.COM')).toBe('EMAIL: [redacted-email]');
  });

  it('redacts US-style phone numbers', () => {
    const input = 'Call +1 (555) 123-4567 today';
    const result = redactContactInfo(input);
    expect(result).toContain('[redacted-phone]');
    expect(result).not.toContain('555');
  });

  it('redacts international phone numbers', () => {
    expect(redactContactInfo('+44 20 7946 0958')).toBe('[redacted-phone]');
  });

  it('redacts dotted phone numbers', () => {
    expect(redactContactInfo('555.123.4568')).toBe('[redacted-phone]');
  });

  it('redacts http(s) URLs', () => {
    expect(redactContactInfo('see https://example.com/portfolio for work')).toBe(
      'see [redacted-url] for work'
    );
    expect(redactContactInfo('http://insecure.example.net')).toBe('[redacted-url]');
  });

  it('redacts all three contact types in one string', () => {
    const input = [
      'Jane Doe',
      'jane@example.com',
      '+1 415 555 0100',
      'https://janedoe.dev',
    ].join(' | ');

    const result = redactContactInfo(input);
    expect(result).toBe('Jane Doe | [redacted-email] | [redacted-phone] | [redacted-url]');
  });

  it('leaves ordinary text untouched', () => {
    const text = 'Senior software engineer with 10 years of experience in React.';
    expect(redactContactInfo(text)).toBe(text);
  });

  it('returns empty string unchanged', () => {
    expect(redactContactInfo('')).toBe('');
  });
});
