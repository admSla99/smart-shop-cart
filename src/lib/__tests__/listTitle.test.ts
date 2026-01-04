import { formatListDisplayTitle } from '../listTitle';

describe('formatListDisplayTitle', () => {
  const originalDateTimeFormat = Intl.DateTimeFormat;

  beforeEach(() => {
    (Intl as { DateTimeFormat: unknown }).DateTimeFormat = jest.fn(() => ({
      format: () => 'Sep 14',
    })) as unknown as typeof Intl.DateTimeFormat;
  });

  afterEach(() => {
    Intl.DateTimeFormat = originalDateTimeFormat;
  });

  it('appends a localized month/day when createdAt is valid', () => {
    expect(
      formatListDisplayTitle('Weekly Groceries', '2026-01-04T10:00:00Z'),
    ).toBe('Weekly Groceries - Sep 14');
  });

  it('returns the base title when createdAt is missing or invalid', () => {
    expect(formatListDisplayTitle('Weekly Groceries')).toBe('Weekly Groceries');
    expect(formatListDisplayTitle('Weekly Groceries', 'not-a-date')).toBe('Weekly Groceries');
  });
});
