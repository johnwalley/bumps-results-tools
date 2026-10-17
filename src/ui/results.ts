// TG files are imported straight from the canonical results/tg_format/
// directory so the UI can never drift from the source data. Each file is
// lazily loaded as its own chunk.
const loaders = import.meta.glob<string>("../../results/tg_format/*.txt", {
  query: "?raw",
  import: "default",
});

const SETS: Record<string, string> = {
  eights: "Eights",
  lents: "Lents",
  mays: "Mays",
  torpids: "Torpids",
  town: "Town",
};

export type ResultFile = {
  id: string;
  set: string;
  gender: "Men" | "Women";
  year: string;
  load: () => Promise<string>;
};

export const resultFiles: ResultFile[] = Object.entries(loaders)
  .flatMap(([path, load]) => {
    const m = path.match(/\/([a-z]+)([0-9]{4}(?:\.[0-9]+)?)_(men|women)\.txt$/);

    if (m === null || !(m[1] in SETS)) {
      return [];
    }

    return [
      {
        id: `${m[1]}${m[2]}_${m[3]}`,
        set: SETS[m[1]],
        gender: m[3] === "men" ? ("Men" as const) : ("Women" as const),
        year: m[2],
        load,
      },
    ];
  })
  .sort(
    (a, b) =>
      a.set.localeCompare(b.set) ||
      a.gender.localeCompare(b.gender) ||
      a.year.localeCompare(b.year, undefined, { numeric: true }),
  );
