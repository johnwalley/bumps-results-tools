export interface Event {
  set: string;
  short: string;
  gender: string;
  year: string;
  days: number;
  distance: number;
  flags: string[];
  div_size: number[][] | null;
  results: string[];
  pace: unknown[];
  move?: (number | null)[][];
  back?: (number | null)[][];
  completed?: any[];
  skip?: any[];
  crews_withdrawn?: number;
  crews: Crew[];
  full_set?: boolean;
}

export interface Crew {
  gain: number | null;
  blades: boolean;
  highlight: boolean;
  withdrawn: boolean;
  start: string;
  num_name: string;
  club: string;
  number: number;
  end: string | null;
  club_end: string | null;
}
