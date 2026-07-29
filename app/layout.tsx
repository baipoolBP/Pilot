import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "ฝึกคิดเลขในใจ | เตรียมสอบนักบินทหารเรือ",
  description:
    "แบบฝึกคำนวณเลขในใจ 50 ข้อ จับเวลาข้อละ 30 วินาที โจทย์สุ่มใหม่ทุกครั้ง สำหรับเตรียมสอบนักบินกองทัพเรือ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body className="font-sarabun min-h-screen">{children}</body>
    </html>
  );
}
