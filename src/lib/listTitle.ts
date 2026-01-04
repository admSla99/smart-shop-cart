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
