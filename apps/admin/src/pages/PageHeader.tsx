export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-slate-500">{description}</p>
    </header>
  );
}
