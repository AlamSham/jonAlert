export function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      )}
    </div>
  );
}
