export function ReadingTime({ content }: { content: string }) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
      <span>📖</span>
      {minutes} min read
    </span>
  );
}
