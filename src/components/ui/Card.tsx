export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow dark:bg-zinc-900 ${className}`}>
      {children}
    </div>
  );
}
