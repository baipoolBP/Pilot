import Link from "next/link";

export default function TestShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3 text-sm">
        <Link href="/" className="text-slate-300 hover:text-white transition-colors">
          ← กลับหน้ารวมแบบทดสอบ
        </Link>
        <span className="text-slate-600">/</span>
        <span className="font-semibold text-slate-100">{title}</span>
      </header>
      {children}
    </div>
  );
}
