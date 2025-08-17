export function mean(values: number[]): number {
  if (values.length === 0)
    throw new Error("Cannot compute mean of empty array.");
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function variance(values: number[], sample: boolean = true): number {
  if (values.length < (sample ? 2 : 1)) {
    throw new Error("Not enough data points to compute variance.");
  }

  const avg = mean(values);
  const divisor = sample ? values.length - 1 : values.length;

  return values.reduce((acc, val) => acc + (val - avg) ** 2, 0) / divisor;
}

type HistogramBin = { value: number; count: number };

export function histogramMean(hist: HistogramBin[]): number {
  const totalCount = hist.reduce((sum, bin) => sum + bin.count, 0);
  if (totalCount === 0) throw new Error("Empty histogram.");
  return hist.reduce((sum, bin) => sum + bin.value * bin.count, 0) / totalCount;
}

export function histogramVariance(hist: HistogramBin[], sample = true): number {
  const totalCount = hist.reduce((sum, bin) => sum + bin.count, 0);
  if (totalCount < (sample ? 2 : 1)) throw new Error("Not enough data.");

  const mean = histogramMean(hist);
  const sumSquaredDiffs = hist.reduce((acc, bin) => {
    const diff = bin.value - mean;
    return acc + bin.count * diff * diff;
  }, 0);

  const divisor = sample ? totalCount - 1 : totalCount;
  return sumSquaredDiffs / divisor;
}

export function histogramStandardDeviation(
  hist: HistogramBin[],
  sample = true,
): number {
  return Math.sqrt(histogramVariance(hist, sample));
}

export function standardDeviation(
  values: number[],
  sample: boolean = true,
): number {
  return Math.sqrt(variance(values, sample));
}
