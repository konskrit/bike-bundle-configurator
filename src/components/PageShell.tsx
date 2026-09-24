type Props = {
  title?: string;
  children: React.ReactNode;
};

export function PageShell({ title, children }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {title ? (
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      ) : null}
      {children}
    </main>
  );
}
