# List Title With Date Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Display list titles as “Name - Mon Day” (device locale, no year) everywhere titles appear, without changing stored titles or the database.

**Architecture:** Add a small formatter helper that combines the base title with `created_at` using `Intl.DateTimeFormat`. Use that helper in the Home screen to render list cards and to pass the display title into navigation, so the List Detail header and navigation title show the same string.

**Tech Stack:** React Native (Expo), TypeScript, Zustand, Jest (jest-expo).

### Task 1: Add display-title formatter helper + tests

**Files:**
- Create: `src/lib/listTitle.ts`
- Create: `src/lib/__tests__/listTitle.test.ts`

**Step 1: Write the failing test**

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/__tests__/listTitle.test.ts`  
Expected: FAIL (module/function missing).

**Step 3: Write minimal implementation**

```typescript
export const formatListDisplayTitle = (title: string, createdAt?: string) => {
  if (!createdAt) return title;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return title;
  try {
    const formatted = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(date);
    return `${title} - ${formatted}`;
  } catch {
    return title;
  }
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/__tests__/listTitle.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/listTitle.ts src/lib/__tests__/listTitle.test.ts
git commit -m "Add list title date formatter"
```

### Task 2: Use display titles in Home screen + navigation

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/screens/__tests__/HomeScreen.test.tsx`

**Step 1: Write the failing test**

Add a test in `src/screens/__tests__/HomeScreen.test.tsx`:

```typescript
it('renders list titles with creation date and uses them for navigation', () => {
  mockLists = [
    {
      id: 'list-1',
      title: 'Weekly Groceries',
      created_at: '2026-01-04T10:00:00Z',
      user_id: 'user-1',
    },
  ];

  const { getByText } = render(
    <HomeScreen
      navigation={{ navigate: mockNavigate } as never}
      route={{ key: 'Home', name: 'Home' } as never}
    />,
  );

  fireEvent.press(getByText('Weekly Groceries - Sep 14'));
  expect(mockNavigate).toHaveBeenCalledWith(
    'ListDetail',
    expect.objectContaining({ title: 'Weekly Groceries - Sep 14' }),
  );
});
```

Mock `Intl.DateTimeFormat` in the test file to return `Sep 14` and mock `ListCard` to render the `title` prop as a `Text` that triggers `onPress`.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/screens/__tests__/HomeScreen.test.tsx`  
Expected: FAIL (title not formatted).

**Step 3: Write minimal implementation**

In `src/screens/HomeScreen.tsx`:

```typescript
import { formatListDisplayTitle } from '../lib/listTitle';

const renderList = ({ item }) => {
  const displayTitle = formatListDisplayTitle(item.title, item.created_at);
  return (
    <ListCard
      title={displayTitle}
      ...
      onPress={() =>
        navigation.navigate('ListDetail', {
          listId: item.id,
          title: displayTitle,
          shopName: item.shop_name,
          shopColor: item.shop_color,
        })
      }
      ...
    />
  );
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/screens/__tests__/HomeScreen.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/__tests__/HomeScreen.test.tsx
git commit -m "Show list titles with creation date"
```

### Task 3: Full verification

**Step 1: Run full test suite**

Run: `npm test`  
Expected: PASS (all suites).

**Step 2: Commit (if needed)**

If any additional changes occurred:
```bash
git add .
git commit -m "Finalize list title date display"
```

**Step 3: Manual verification**

- Create a new list and confirm the title appears as `Name - Mon Day`:
  - Home list card
  - List detail header
  - Navigation header title

