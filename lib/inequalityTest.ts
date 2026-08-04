// Inequality-reasoning test: given A r1 B r2 C, decide whether a proposed
// A-vs-C conclusion is necessarily True, necessarily False, or indeterminate ("?").
//
// Each relation symbol maps to the set of primitive orderings (<, =, >) it
// allows — e.g. "≥" allows {=, >}. The achievable A-vs-C orderings for a chain
// are the union, over every allowed (a1, a2) primitive pair, of what that pair
// forces on A-vs-C. The conclusion is judged True/False/? by comparing its own
// allowed set against that achievable set (subset => True, disjoint => False,
// otherwise partial overlap => indeterminate).

export type Relation = "<" | ">" | "=" | "≠" | "≥" | "≤";
type Primitive = "<" | "=" | ">";
export type Verdict = "True" | "False" | "?";

export interface InequalityQuestion {
  a: Relation; // relation between A and B
  b: Relation; // relation between B and C
  conclusion: Relation; // proposed relation between A and C
  answer: Verdict;
}

export const TOTAL_QUESTIONS = 30;
export const TOTAL_TIME = 600; // seconds (10 minutes)

export const RELATIONS: Relation[] = ["<", ">", "=", "≠", "≥", "≤"];

const RELATION_PRIMITIVES: Record<Relation, Primitive[]> = {
  "<": ["<"],
  ">": [">"],
  "=": ["="],
  "≠": ["<", ">"],
  "≥": ["=", ">"],
  "≤": ["=", "<"],
};

// Achievable A-vs-C primitive orderings given A a1 B a2 C, for primitive a1, a2.
function chainPrimitives(a1: Primitive, a2: Primitive): Primitive[] {
  if (a1 === "<" && a2 === "<") return ["<"];
  if (a1 === ">" && a2 === ">") return [">"];
  if (a1 === "=") return [a2];
  if (a2 === "=") return [a1];
  return ["<", "=", ">"]; // opposite strict inequalities: fully indeterminate
}

function achievableSet(r1: Relation, r2: Relation): Set<Primitive> {
  const result = new Set<Primitive>();
  for (const a1 of RELATION_PRIMITIVES[r1]) {
    for (const a2 of RELATION_PRIMITIVES[r2]) {
      for (const p of chainPrimitives(a1, a2)) result.add(p);
    }
  }
  return result;
}

function judge(possible: Set<Primitive>, conclusion: Relation): Verdict {
  const concSet = RELATION_PRIMITIVES[conclusion];
  const possibleArr = [...possible];
  if (possibleArr.every((p) => concSet.includes(p))) return "True";
  if (possibleArr.some((p) => concSet.includes(p))) return "?";
  return "False";
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Samples TOTAL_QUESTIONS unique (r1, r2, conclusion) triples out of all
// RELATIONS.length^3 possibilities, drawing an even split across True/False/?
// so the test can't be gamed by favoring whichever verdict is most common.
export function generateSet(): InequalityQuestion[] {
  const byAnswer: Record<Verdict, InequalityQuestion[]> = { True: [], False: [], "?": [] };

  for (const r1 of RELATIONS) {
    for (const r2 of RELATIONS) {
      const possible = achievableSet(r1, r2);
      for (const conclusion of RELATIONS) {
        const answer = judge(possible, conclusion);
        byAnswer[answer].push({ a: r1, b: r2, conclusion, answer });
      }
    }
  }

  const perCategory = TOTAL_QUESTIONS / 3;
  const picked = [
    ...shuffle(byAnswer.True).slice(0, perCategory),
    ...shuffle(byAnswer.False).slice(0, perCategory),
    ...shuffle(byAnswer["?"]).slice(0, perCategory),
  ];

  return shuffle(picked);
}
