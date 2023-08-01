export const Gender = {
  MEN: "Men",
  WOMEN: "Women",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];
