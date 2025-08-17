/**
 * Generates an array of numbers forming a range.
 *
 * The range starts at the specified `start` value and increments by `step` until it reaches (but does not include) the `end` value.
 * If `step` is negative, the range decrements from `start` until it is greater than `end`.
 *
 * @param start - The beginning of the range.
 * @param end - The end of the range (exclusive).
 * @param step - The value to increment (or decrement) by on each iteration. Defaults to 1.
 * @returns An array of numbers starting from `start` and ending before `end`, incremented (or decremented) by `step`.
 * @throws Error if `step` is zero.
 */
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

export /**
 * Updates the statistics for a given key in the provided record.
 *
 * If the key exists in the object, it adds the given number to its total.
 * If the key does not exist, it creates a new entry with the given number as its total
 * and initializes an empty labels array.
 *
 * If a non-null label is provided, it is appended to the labels array for that key.
 *
 * @param d - The record mapping keys to their associated statistics objects.
 * @param k - The key corresponding to the statistics object to update.
 * @param n - The number to add to the total for the given key.
 * @param label - An optional label to save with the statistics, appended if not null.
 */
function updateStats<K extends string>(
  d: Record<K, { total: number; labels: unknown[] }>,
  k: K,
  n: number,
  label: unknown | null = null,
) {
  if (k in d) {
    d[k].total += n;
  } else {
    d[k] = { total: n, labels: [] };
  }

  if (label !== null) {
    d[k].labels.push(label);
  }
}
