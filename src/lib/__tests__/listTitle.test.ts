import { formatListDisplayTitle } from '../listTitle';

describe('formatListDisplayTitle', () => {
  const originalDateTimeFormat = Intl.DateTimeFormat;
  let formatSpy: jest.Mock<string, [Date]>;

  beforeEach(() => {
    formatSpy = jest.fn((date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
    });
    (Intl as { DateTimeFormat: unknown }).DateTimeFormat = jest.fn(() => ({
      format: formatSpy,
    })) as unknown as typeof Intl.DateTimeFormat;
  });

  afterEach(() => {
    Intl.DateTimeFormat = originalDateTimeFormat;
  });

  it('appends a localized month/day when createdAt is valid', () => {
    const result = formatListDisplayTitle('Weekly Groceries', '2026-01-04T10:00:00Z');
    const dateTimeFormatMock = Intl.DateTimeFormat as unknown as jest.Mock;

    expect(result).toBe('Weekly Groceries - Jan 4');
    expect(dateTimeFormatMock).toHaveBeenCalledWith(undefined, {
      month: 'short',
      day: 'numeric',
    });
    expect(formatSpy).toHaveBeenCalledTimes(1);
    expect((formatSpy.mock.calls[0]?.[0] as Date).toISOString()).toBe('2026-01-04T10:00:00.000Z');
  });

  it('returns the base title when createdAt is missing or invalid', () => {
    expect(formatListDisplayTitle('Weekly Groceries')).toBe('Weekly Groceries');
    expect(formatListDisplayTitle('Weekly Groceries', 'not-a-date')).toBe('Weekly Groceries');
  });
});
