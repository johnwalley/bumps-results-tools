export function range(start: number, end: number, step: number = 1): number[] {
  if (step === 0) {
    throw new Error("Step cannot be zero.");
  }

  const result: number[] = [];

  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }

  return result;
}
