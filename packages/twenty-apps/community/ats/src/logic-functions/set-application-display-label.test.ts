import { describe, expect, it } from 'vitest';
import { composeLabel } from './set-application-display-label';

describe('composeLabel', () => {
  it('composes a full label when candidate and position are present', () => {
    expect(
      composeLabel(
        { name: { firstName: 'Sarah', lastName: 'Chen' } },
        { name: 'Staff Engineer' },
      ),
    ).toBe('Sarah Chen — Staff Engineer');
  });

  it('handles first-name-only candidates', () => {
    expect(
      composeLabel(
        { name: { firstName: 'Sarah', lastName: null } },
        { name: 'Staff Engineer' },
      ),
    ).toBe('Sarah — Staff Engineer');
  });

  it('falls back to "?" when the candidate is missing', () => {
    expect(composeLabel(null, { name: 'Staff Engineer' })).toBe(
      '? — Staff Engineer',
    );
  });

  it('falls back to "?" when the position is missing', () => {
    expect(
      composeLabel({ name: { firstName: 'Sarah', lastName: 'Chen' } }, null),
    ).toBe('Sarah Chen — ?');
  });

  it('falls back to "? — ?" when both are missing', () => {
    expect(composeLabel(null, null)).toBe('? — ?');
  });

  it('trims whitespace on name fragments', () => {
    expect(
      composeLabel(
        { name: { firstName: '  Sarah ', lastName: ' Chen  ' } },
        { name: '  Staff Engineer  ' },
      ),
    ).toBe('Sarah Chen — Staff Engineer');
  });

  it('handles empty name object gracefully', () => {
    expect(composeLabel({ name: null }, { name: 'Staff Engineer' })).toBe(
      '? — Staff Engineer',
    );
  });
});
