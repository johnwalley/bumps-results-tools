import { range, updateStats } from "./utils";

import type { Event } from "./types";
import { clubMapping } from "./club-mappings";

const clubMappings = new Map<string, string>(Object.entries(clubMapping));

type StatCounter = { total: number; labels: string[] };

/**
 * Computes and aggregates statistics from an array of bumping events.
 *
 * @remarks
 * This function iterates through each event to process day-by-day performance data, crew movements,
 * withdrawals, and other race metrics. It aggregates the results overall (in the `all` property) and per club
 * (in the `club` property). For each event, the function tracks various details such as:
 * - Daily adjusted positions based on moves, withdrawals, and skipped days.
 * - Set gain values for crews.
 * - Attainment of blades.
 * - Crew counts per event and per club.
 * - Headship counts and the highest achieved positions with associated metadata.
 *
 * If the `combine` flag is set to true, club names are normalized using predefined club mappings.
 *
 * @param events - An array of Event objects containing bumping event data.
 * @param combine - A boolean flag indicating whether to combine or normalize club names using predefined mappings (default is false).
 *
 * @returns An object containing:
 * - An optional `set` representing the event set identifier.
 * - An optional `years` array reflecting the involved years.
 * - A `club` record that maps each club name to its detailed statistics, including:
 *   - `day`: A record of day-level performance counts.
 *   - `set`: A record of set-level gain counts.
 *   - `blades`: An array recording instances where blades were earned.
 *   - `crews`: A record of crew counts per event.
 *   - `headships`: A record of headship counts.
 *   - `highest`: A record mapping crew numbers to their best performance metrics.
 *   - `years`: An array of years the club participated.
 *   - `count`: The total number of events involving the club.
 *   - `withdrew`: An object capturing withdrawal statistics.
 * - An `all` object summarizing the overall statistics across all events, structured similarly to each club's statistics.
 *  */
export function getStats(events: Event[], combine = false) {
  const stats: {
    set?: string;
    years?: string[];
    club: Record<
      string,
      {
        day: Record<string, StatCounter>;
        set: Record<string, StatCounter>;
        blades: unknown[];
        crews: Record<string, StatCounter>;
        headships: Record<string, StatCounter>;
        highest: Record<
          number,
          {
            high: number;
            days: number;
            run: number;
            runStart: number;
            longest: number;
            start: number;
            end: number;
          }
        >;
        years: string[];
        count: number;
        withdrew: StatCounter;
      }
    >;
    all: {
      day: Record<string, StatCounter>;
      set: Record<string, StatCounter>;
      blades: unknown[];
      crews: Record<string, StatCounter>;
      clubs: Record<string, StatCounter>;
      headships: Record<string, StatCounter>;
      highest: Record<
        number,
        {
          high: number;
          days: number;
          run: number;
          runStart: number;
          longest: number;
          start: number;
          end: number;
        }
      >;
      years: string[];
      count: number;
      withdrew: StatCounter;
    };
  } = {
    club: {},
    all: {
      day: {},
      set: {},
      blades: [],
      crews: {},
      clubs: {},
      headships: {},
      highest: {},
      years: [],
      count: 0,
      withdrew: { total: 0, labels: [] },
    },
  };

  for (const event of events) {
    const eventInfo = { gender: event.gender, year: event.year };
    const overallStats = stats.all;
    const clubCount: Record<string, StatCounter> = {};
    const headships: Record<number, { club: string; num: number }> = {};

    if (!event.full_set) {
      console.log(
        `Ignoring set as not complete: ${event.set}, ${event.year}, ${event.gender}`,
      );
      continue;
    }

    if (!("set" in stats)) {
      stats.set = event.set;
    }

    if (!("years" in stats)) {
      stats.years = [];
    }

    const missing = [];
    let skip = 0;

    for (const day of range(0, event.days)) {
      const withdrawn = [];
      const virtual = [];

      for (const num of range(0, event.crews.length - skip)) {
        if (event.move?.[day][num] === null) {
          withdrawn.push(num);
          skip += 1;
        }

        if (event.skip?.[day][num]) {
          virtual.push([num, num - event.move![day][num]!]);
        }
      }

      missing.push({ withdrawn: withdrawn, virtual: virtual });
    }

    for (const num of range(0, event.crews.length)) {
      let pos = num;
      const crew = event.crews[num];

      let clubName = crew.club;

      if (combine && clubMappings.has(clubName)) {
        clubName = clubMappings.get(clubName)!;
      }

      if (clubName.length === 0) {
        continue;
      }

      if (!(clubName in stats.club)) {
        stats.club[clubName] = {
          day: {},
          set: {},
          blades: [],
          crews: {},
          headships: {},
          highest: {},
          years: [],
          count: 0,
          withdrew: { total: 0, labels: [] },
        };

        updateStats(stats.club[clubName], "withdrew", 0);
      }

      const club = stats.club[clubName];
      updateStats(clubCount, clubName, 1);
      club.count += 1;

      if (!club.years.includes(event.year)) {
        club.years.push(event.year);
      }

      let gained = 0;

      for (const day of range(0, event.days)) {
        const crewInfo = {
          club: clubName,
          number: crew.number,
          gender: event.gender,
          day: day,
          year: event.year,
        };

        let m = event.move![day][pos];

        if (m === null) {
          updateStats(overallStats, "withdrew", 1, crewInfo);
          updateStats(club, "withdrew", 1, crewInfo);
          break;
        }

        let divHead = 0;
        let div = 0;

        while (div < event.div_size![day].length - 1) {
          if (pos < divHead + event.div_size![day][div]) {
            break;
          }

          divHead += event.div_size![day][div];
          div += 1;
        }

        let divRaced = event.completed![day][div];

        if (!divRaced && div > 0 && pos === divHead) {
          divRaced = event.completed![day][div - 1];
        }

        // Add stats if the crew didn't skip this day
        if (!event.skip![day][num] && divRaced) {
          let adjust = 0;

          if (missing[day] === undefined) {
            console.log(missing);
          }

          for (const n of missing[day].withdrawn) {
            if (n < pos) {
              adjust -= 1;
            }
          }

          for (const [s, e] of missing[day].virtual) {
            if (s < pos && e > pos - m) {
              adjust -= 1;
            }

            if (s > pos - m && e < pos - m) {
              adjust += 1;
            }
          }

          updateStats(overallStats.day, String(m + adjust), 1, crewInfo);
          updateStats(club.day, String(m + adjust), 1, crewInfo);

          gained += m + adjust;
        }

        pos -= m;

        if (!event.skip![day][pos]) {
          if (divRaced) {
            if (!(crew.number in club.highest)) {
              club.highest[crew.number] = {
                high: pos,
                days: 1,
                run: 1,
                runStart: parseInt(event.year),
                longest: 1,
                start: parseInt(event.year),
                end: parseInt(event.year),
              };
            } else {
              const rec = club.highest[crew.number];

              if (pos < rec.high) {
                club.highest[crew.number] = {
                  high: pos,
                  days: 1,
                  run: 1,
                  runStart: parseInt(event.year),
                  longest: 1,
                  start: parseInt(event.year),
                  end: parseInt(event.year),
                };
              } else if (pos === rec.high) {
                if (rec.run === 0) {
                  rec.runStart = parseInt(event.year);
                }

                rec.days += 1;
                rec.run += 1;

                if (rec.run > rec.longest) {
                  rec.longest = rec.run;
                  rec.start = rec.runStart;
                  rec.end = parseInt(event.year);
                }
              } else {
                rec.run = 0;
              }
            }
          }
        } else {
          if (crew.number in club.highest) {
            club.highest[crew.number].run = 0;
          }
        }
      }

      const crewInfo = {
        club: clubName,
        number: crew.number,
        gender: event.gender,
        year: event.year,
      };

      updateStats(overallStats.set, String(gained), 1, crewInfo);
      updateStats(club.set, String(gained), 1, crewInfo);

      if (!(crew.number in headships)) {
        headships[crew.number] = { club: clubName, num: pos };
      } else if (pos < headships[crew.number].num) {
        headships[crew.number].club = clubName;
        headships[crew.number].num = pos;
      }

      if (crew.blades) {
        overallStats.blades.push(crewInfo);
        club.blades.push(crewInfo);
      }
    }

    updateStats(overallStats.crews, String(event.crews.length), 1, eventInfo);

    for (const club in clubCount) {
      updateStats(
        stats.club[club].crews,
        String(clubCount[club].total),
        1,
        eventInfo,
      );
      updateStats(overallStats.clubs, String(clubCount[club].total), 1, {
        club: club,
        year: parseInt(event.year),
        gender: event.gender,
      });
    }

    if (!event.flags.includes("skip_headship")) {
      eventInfo.year = eventInfo.year.split(" ")[0];

      for (const num in headships) {
        updateStats(
          stats.club[headships[num].club].headships,
          num,
          1,
          eventInfo,
        );
      }
    }
  }

  return stats;
}
