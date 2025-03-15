import { desc, table } from "arquero";

import type { Event } from "./types";

const clubMappings = new Map<string, string>([
  ["Osler-Green", "Osler House"],
  ["Cambridge Town Rowing Club", "City"],
]);

export function crewsEntered(events: Event[]) {
  const crewsEntered = new Map<string, Map<string, number>>();
  const clubs = new Set<string>();

  for (const event of events) {
    const map = new Map<string, number>();
    crewsEntered.set(event.year, map);

    for (const crew of event.crews) {
      const club = crew.club;

      clubs.add(club);

      map.set(club, (map.get(club) || 0) + 1);
    }
  }

  const cols = Object.fromEntries(
    Array.from(clubs)
      .sort((a, b) => a.localeCompare(b))
      .map((club) => [
        club,
        Array.from(crewsEntered.keys()).map(
          (year) => crewsEntered.get(year)?.get(club) ?? 0,
        ),
      ]),
  );

  const dt = table({
    year: Array.from(crewsEntered.keys()),
    ...cols,
  });

  return dt.orderby("year").objects();
}

export function headships(events: Event[]) {
  const headships = new Map<string, number>();
  const lastYear = new Map<string, number>();

  for (const event of events) {
    if (!event.full_set) {
      continue;
    }

    if (event.flags.includes("skip_headship")) {
      console.log("Skipping headship", event.year);
      continue;
    }

    let club = event.crews[0].club_end;

    if (club === null) {
      continue;
    }

    if (clubMappings.has(club)) {
      club = clubMappings.get(club)!;
    }

    if (headships.has(club)) {
      const hs = headships.get(club);

      headships.set(club, hs! + 1);

      let year = +event.year;
      let p = event.year.split(" ");

      if (p.length > 1) {
        year = +p[0];
      }

      if (year > lastYear.get(club)!) {
        lastYear.set(club, year);
      }
    } else {
      headships.set(club, 1);

      let year = +event.year;
      let p = event.year.split(" ");

      if (p.length > 1) {
        year = +p[0];
      }

      lastYear.set(club, year);
    }
  }

  const dt = table({
    club: Array.from(headships.keys()),
    headships: Array.from(headships.values()),
    lastYear: Array.from(lastYear.values()),
  });

  return dt.orderby(desc("headships"), desc("lastYear")).objects();
}
