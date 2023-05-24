export interface RawEvent {
  set: string;
  small: string;
  gender: string;
  result: string;
  year: number;
  days: number;
  divisions: string[][];
  results: string;
  move: number[][][];
  finish: string[][];
  completed: boolean[][];
}

export interface Crew {
  name: string;
  values: { day: number; pos: number }[];
}

export interface Event {
  year: number;
  crews: Crew[];
  divisions: {
    start: number;
    size: number;
  }[];
}

export interface JoinedEvent {
  year: number;
  crews: {
    name: string;
    values: {
      day: number;
      pos: number;
    }[];
    valuesSplit: {
      name: string;
      day: number;
      blades: boolean;
      spoons: boolean;
      values: unknown;
    }[];
  }[];
  divisions: {
    start: number;
    size: number;
  }[];
}
