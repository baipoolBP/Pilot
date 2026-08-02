export interface TestMeta {
  slug: string;
  title: string;
  description: string;
  tag: string;
}

export const TESTS: TestMeta[] = [
  {
    slug: "mental-math",
    title: "คิดเลขในใจ (บวก ลบ คูณ หาร ยกกำลัง ถอดราก)",
    description:
      "โจทย์เลข 2-3 หลัก 50 ข้อ คละบวก ลบ คูณ หาร ยกกำลัง และถอดราก สุ่มใหม่ทุกครั้งที่เริ่มทำ",
    tag: "50 ข้อ • 30 วิ/ข้อ",
  },
  {
    slug: "symbol-addition",
    title: "บวกเลขสัญลักษณ์ (ความเร็วในการบวก)",
    description:
      "จำสัญลักษณ์แทนตัวเลข 10 ตัว แล้วบวกเลขสะสมจากลำดับสัญลักษณ์ที่สุ่มมา ฝึกความเร็วและความแม่นยำ 5 รอบ",
    tag: "5 รอบ • 30 วิ/รอบ",
  },
];
