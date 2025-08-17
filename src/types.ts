import { z } from "zod";

const StatisticsSchema = z.object({
  headships: z.array(
    z.object({
      club: z.string(),
      headships: z.number(),
      lastYear: z.number(),
    }),
  ),
  crews: z.array(
    z
      .object({
        year: z.number(),
      })
      .catchall(z.number()),
  ),
  positionChange: z.record(
    z.number(),
    z.array(z.object({ club: z.string(), crew: z.number(), year: z.number() })),
  ),
});

export type Statistics = z.infer<typeof StatisticsSchema>;

const CrewSchema = z.object({
  blades: z.boolean(),
  club_end: z.string().nullable(),
  club: z.string(),
  end: z.string().nullable(),
  gain: z.number().nullable(),
  highlight: z.boolean(),
  num_name: z.string(),
  number: z.number(),
  start: z.string(),
  withdrawn: z.boolean(),
});

export const EventSchema = z.object({
  back: z.array(z.array(z.number().nullable())).optional(),
  completed: z.array(z.array(z.boolean())).optional(),
  crews_withdrawn: z.number().optional(),
  crews: z.array(CrewSchema),
  days: z.number(),
  distance: z.number(),
  div_size: z.array(z.array(z.number())).nullable(),
  flags: z.array(z.string()),
  full_set: z.boolean().optional(),
  gender: z.enum(["Men", "Women"]),
  move: z.array(z.array(z.number().nullable())).optional(),
  pace: z.array(z.unknown()),
  results: z.array(z.string()),
  set: z.enum([
    "Summer Eights",
    "Lent Bumps",
    "May Bumps",
    "Torpids",
    "Town Bumps",
  ]),
  short: z.enum(["Eights", "Lents", "Mays", "Torpids", "Town"]),
  skip: z.array(z.array(z.unknown())).optional(),
  year: z.string(),
});

export type Event = z.infer<typeof EventSchema>;
export type Crew = z.infer<typeof CrewSchema>;
