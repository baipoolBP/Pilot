export type SeriesType = "arithmetic" | "geometric" | "quadratic" | "power" | "fibonacci" | "alternating";

export interface SeriesQuestion {
  id: number;
  type: SeriesType;
  text: string;
  answer: number;
}

export const SERIES_TYPE_LABEL: Record<SeriesType, string> = {
  arithmetic: "บวก/ลบคงที่",
  geometric: "คูณ/หารคงที่",
  quadratic: "ผลต่างเพิ่มขึ้นเรื่อยๆ",
  power: "กำลังสอง/สาม",
  fibonacci: "ฟีโบนัชชี",
  alternating: "สลับ 2 กฎ",
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

interface Series {
  terms: number[];
  answer: number;
}

function genArithmetic(): Series {
  const diff = randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1);
  const start = diff < 0 ? randInt(60, 99) : randInt(1, 40);
  const terms = Array.from({ length: 5 }, (_, i) => start + diff * i);
  return { terms, answer: start + diff * 5 };
}

function genGeometric(): Series {
  const ratio = Math.random() < 0.5 ? 2 : 3;
  const base = randInt(1, 6);
  const ascending = Math.random() < 0.5;
  if (ascending) {
    const terms = Array.from({ length: 5 }, (_, i) => base * ratio ** i);
    return { terms, answer: base * ratio ** 5 };
  }
  const terms = Array.from({ length: 5 }, (_, i) => base * ratio ** (5 - i));
  return { terms, answer: base };
}

function genQuadratic(): Series {
  const a = randInt(1, 20);
  const d1 = randInt(1, 6);
  const e = randInt(1, 4);
  const terms = [a];
  let d = d1;
  for (let i = 1; i < 5; i++) {
    terms.push(terms[i - 1] + d);
    d += e;
  }
  return { terms, answer: terms[4] + d };
}

function genPower(): Series {
  const exp = Math.random() < 0.7 ? 2 : 3;
  const startN = exp === 2 ? randInt(1, 5) : randInt(1, 3);
  const terms = Array.from({ length: 5 }, (_, i) => (startN + i) ** exp);
  return { terms, answer: (startN + 5) ** exp };
}

function genFibonacci(): Series {
  const a = randInt(1, 10);
  const b = randInt(1, 10);
  const terms = [a, b];
  for (let i = 2; i < 5; i++) {
    terms.push(terms[i - 1] + terms[i - 2]);
  }
  return { terms, answer: terms[4] + terms[3] };
}

function genAlternating(): Series {
  const start = randInt(1, 10);
  const addK = randInt(1, 5);
  const mulK = randInt(2, 3);
  const terms = [start];
  for (let i = 1; i < 5; i++) {
    const prev = terms[i - 1];
    terms.push(i % 2 === 1 ? prev + addK : prev * mulK);
  }
  const answer = 5 % 2 === 1 ? terms[4] + addK : terms[4] * mulK;
  return { terms, answer };
}

const BUILDERS: Record<SeriesType, () => Series> = {
  arithmetic: genArithmetic,
  geometric: genGeometric,
  quadratic: genQuadratic,
  power: genPower,
  fibonacci: genFibonacci,
  alternating: genAlternating,
};

export function generateSeriesQuestions(count = 20): SeriesQuestion[] {
  const types: SeriesType[] = ["arithmetic", "geometric", "quadratic", "power", "fibonacci", "alternating"];
  const plan: SeriesType[] = [];
  for (let i = 0; i < count; i++) {
    plan.push(types[i % types.length]);
  }
  const shuffledPlan = shuffle(plan);

  return shuffledPlan.map((type, i) => {
    const { terms, answer } = BUILDERS[type]();
    return { id: i + 1, type, text: `${terms.join(", ")}, ?`, answer };
  });
}
