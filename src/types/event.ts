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
