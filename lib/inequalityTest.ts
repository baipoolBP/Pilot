// Inequality-reasoning test: given A r1 B r2 C, decide whether a proposed
// A-vs-C conclusion is necessarily True, necessarily False, or indeterminate ("?").

export type Relation = "<" | ">" | "=";
export type Verdict = "True" | "False" | "?";

export interface InequalityQuestion {
  a: Relation; // relation between A and B
  b: Relation; // relation between B and C
  conclusion: Relation; // proposed relation between A and C
  answer: Verdict;
}

export const TOTAL_QUESTIONS = 30;
export const TOTAL_TIME = 600; // seconds (10 minutes)

const RELATIONS: Relation[] = ["<", ">", "="];

// The A-vs-C relation forced by A r1 B r2 C, or null if it can't be determined
// (only happens when r1 and r2 are opposite strict inequalities).
function actualRelation(r1: Relation, r2: Relation): Relation | null {
  if (r1 === "<" && r2 === ">") return null;
  if (r1 === ">" && r2 === "<") return null;
  if (r1 === "=") return r2;
  if (r2 === "=") return r1;
  return r1; // r1 === r2, both "<" or both ">"
}

export function generateQuestion(): InequalityQuestion {
  const r1 = RELATIONS[Math.floor(Math.random() * 3)];
  const r2 = RELATIONS[Math.floor(Math.random() * 3)];
  const actual = actualRelation(r1, r2);

  let conclusion: Relation;
  let answer: Verdict;

  if (actual === null) {
    conclusion = RELATIONS[Math.floor(Math.random() * 3)];
    answer = "?";
  } else if (Math.random() < 0.5) {
    conclusion = actual;
    answer = "True";
  } else {
    const wrongOptions = RELATIONS.filter((r) => r !== actual);
    conclusion = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    answer = "False";
  }

  return { a: r1, b: r2, conclusion, answer };
}

export function generateSet(): InequalityQuestion[] {
  return Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion());
}
