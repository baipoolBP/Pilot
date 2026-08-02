import Link from "next/link";
import { TESTS } from "@/lib/tests";

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">ศูนย์รวมแบบฝึกหัด</h1>
          <p className="text-slate-400">เตรียมสอบนักบิน กองทัพเรือ — เลือกแบบทดสอบที่ต้องการฝึก</p>
        </div>

        <div className="grid gap-5">
          {TESTS.map((test) => (
            <Link
              key={test.slug}
              href={`/tests/${test.slug}`}
              className="group block bg-slate-800/70 border border-slate-700 hover:border-sky-500 rounded-2xl p-6 shadow-xl transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-sky-400 transition-colors">
                    {test.title}
                  </h2>
                  <p className="text-sm text-slate-400 mb-3">{test.description}</p>
                  <span className="inline-block text-xs uppercase tracking-wide bg-slate-900/60 text-slate-300 px-2 py-1 rounded">
                    {test.tag}
                  </span>
                </div>
                <span className="text-sky-400 font-semibold whitespace-nowrap mt-1">
                  เริ่มทำ →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
