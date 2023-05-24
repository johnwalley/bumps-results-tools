export function calculateDivisionBreaks(divisions: string[][]) {
  const divisionSizes = divisions.map((d) => d.length);

  const divisionBreaks = divisionSizes.reduce((r: number[], a: number) => {
    if (r.length > 0) {
      a += r[r.length - 1];
    }

    r.push(a);
    return r;
  }, []);

  return divisionBreaks;
}
