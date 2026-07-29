export type OpType = "add" | "sub" | "mul" | "div" | "pow" | "root";

export interface Question {
  id: number;
  type: OpType;
  text: string;
  answer: number;
}

export const OP_LABEL: Record<OpType, string> = {
  add: "บวก",
  sub: "ลบ",
  mul: "คูณ",
  div: "หาร",
  pow: "ยกกำลัง",
  root: "ถอดราก",
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeAdd(): { text: string; answer: number } {
  const a = randInt(10, 999);
  const b = randInt(10, 999);
  return { text: `${a} + ${b} = ?`, answer: a + b };
}

function makeSub(): { text: string; answer: number } {
  const x = randInt(10, 999);
  const y = randInt(10, 999);
  const hi = Math.max(x, y);
  const lo = Math.min(x, y);
  return { text: `${hi} − ${lo} = ?`, answer: hi - lo };
}

function makeMul(): { text: string; answer: number } {
  let a: number, b: number;
  if (Math.random() < 0.5) {
    a = randInt(10, 99);
    b = randInt(10, 99);
  } else {
    a = randInt(100, 999);
    b = randInt(2, 9);
  }
  return { text: `${a} × ${b} = ?`, answer: a * b };
}

function makeDiv(): { text: string; answer: number } {
  const b = randInt(2, 25);
  const q = randInt(2, Math.max(2, Math.floor(999 / b)));
  const q2 = Math.min(q, 50);
  const a = b * q2;
  return { text: `${a} ÷ ${b} = ?`, answer: q2 };
}

const SUPERSCRIPT: Record<number, string> = { 2: "²", 3: "³" };

function makePow(): { text: string; answer: number } {
  const exp = Math.random() < 0.65 ? 2 : 3;
  const base = exp === 2 ? randInt(4, 31) : randInt(3, 12);
  return { text: `${base}${SUPERSCRIPT[exp]} = ?`, answer: base ** exp };
}

function makeRoot(): { text: string; answer: number } {
  if (Math.random() < 0.7) {
    const n = randInt(4, 31);
    return { text: `√${n * n} = ?`, answer: n };
  } else {
    const n = randInt(3, 12);
    return { text: `∛${n ** 3} = ?`, answer: n };
  }
}

const BUILDERS: Record<OpType, () => { text: string; answer: number }> = {
  add: makeAdd,
  sub: makeSub,
  mul: makeMul,
  div: makeDiv,
  pow: makePow,
  root: makeRoot,
};

export function generateQuestions(count = 50): Question[] {
  const types: OpType[] = ["add", "sub", "mul", "div", "pow", "root"];
  const plan: OpType[] = [];
  for (let i = 0; i < count; i++) {
    plan.push(types[i % types.length]);
  }
  const shuffledPlan = shuffle(plan);

  return shuffledPlan.map((type, i) => {
    const { text, answer } = BUILDERS[type]();
    return { id: i + 1, type, text, answer };
  });
}
