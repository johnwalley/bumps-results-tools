import { Gender } from "./gender";
import { Set } from "./set";

/**
 * Intermediate representation of an event.
 */
export type Event = {
  completed: boolean[][];
  days: number;
  divisions: string[][];
  finish: string[][];
  gender: Gender;
  move: number[][][];
  result: string;
  results: string;
  set: Set;
  small: string;
  year: number;
};

export type InternalEvent = {
  crews: {
    name: string;
    values: {
      day: number;
      pos: number;
    }[];
    valuesSplit: {
      blades: boolean;
      day: number;
      name: string;
      spoons: boolean;
      values: { day: number; pos: number }[];
    }[];
  }[];
  divisions: {
    start: number;
    size: number;
  }[];
  year: number;
};

export type JoinedInternalEvents = {
  crews: {
    name: string;
    values: { day: number; pos: number }[];
    valuesSplit: {
      blades: boolean;
      day: number;
      name: string;
      spoons: boolean;
      values: { day: number; pos: number }[];
    }[]
  }[];
  divisions: {
    divisions: { size: number; start: number }[];
    year: number;
    startDay: number;
    numDays: number;
  }[];
  set: Set;
  gender: Gender;
  endYear: number;
  maxCrews: number;
  startYear: number;
}
