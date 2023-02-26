import { assert, describe, it } from "vitest";
import { joinEvents } from "../main";

describe("utils", function () {
  it("Join incomplete events correctly.", function () {
    var data = [
      {
        crews: [
          {
            name: "Cantabs 1",
            values: [
              { day: 0, pos: 1 },
              { day: 1, pos: 1 },
              { day: 2, pos: 1 },
              { day: 3, pos: 1 },
              { day: 4, pos: 1 },
            ],
          },
          {
            name: "City 1",
            values: [
              { day: 0, pos: 2 },
              { day: 1, pos: 2 },
              { day: 2, pos: 2 },
              { day: 3, pos: 2 },
              { day: 4, pos: 2 },
            ],
          },
        ],
        divisions: [{ start: 0, size: 2 }],
        year: 2013,
      },
      {
        crews: [{ name: "Cantabs 1", values: [{ day: 0, pos: 1 }] }],
        divisions: [{ start: 0, size: 1 }],
        year: 2014,
      },
    ];

    var expected = {
      crews: [
        {
          name: "Cantabs 1",
          values: [
            { day: 0, pos: 1 },
            { day: 1, pos: 1 },
            { day: 2, pos: 1 },
            { day: 3, pos: 1 },
            { day: 4, pos: 1 },
            { day: 5, pos: 1 },
            { day: 6, pos: -1 },
            { day: 7, pos: -1 },
            { day: 8, pos: -1 },
            { day: 9, pos: -1 },
          ],
          valuesSplit: [
            {
              blades: true,
              day: 0,
              name: "Cantabs 1",
              spoons: false,
              values: [
                { day: 0, pos: 1 },
                { day: 1, pos: 1 },
                { day: 2, pos: 1 },
                { day: 3, pos: 1 },
                { day: 4, pos: 1 },
              ],
            },
            {
              blades: true,
              day: 5,
              name: "Cantabs 1",
              spoons: true,
              values: [
                { day: 5, pos: 1 },
                { day: 6, pos: -1 },
                { day: 7, pos: -1 },
                { day: 8, pos: -1 },
                { day: 9, pos: -1 },
              ],
            },
          ],
        },
        {
          name: "City 1",
          values: [
            { day: 0, pos: 2 },
            { day: 1, pos: 2 },
            { day: 2, pos: 2 },
            { day: 3, pos: 2 },
            { day: 4, pos: 2 },
            { day: 5, pos: -1 },
            { day: 6, pos: -1 },
            { day: 7, pos: -1 },
            { day: 8, pos: -1 },
            { day: 9, pos: -1 },
          ],
          valuesSplit: [
            {
              blades: false,
              day: 0,
              name: "City 1",
              spoons: true,
              values: [
                { day: 0, pos: 2 },
                { day: 1, pos: 2 },
                { day: 2, pos: 2 },
                { day: 3, pos: 2 },
                { day: 4, pos: 2 },
              ],
            },
          ],
        },
      ],
      divisions: [
        {
          divisions: [{ size: 2, start: 0 }],
          year: 2013,
          startDay: 0,
          numDays: 4,
        },
        {
          divisions: [{ size: 1, start: 0 }],
          year: 2014,
          startDay: 5,
          numDays: 4,
        },
      ],
      set: "Lent Bumps",
      gender: "Women",
      endYear: 2014,
      maxCrews: 2,
      startYear: 2013,
    };

    var actual = joinEvents(data, "Lent Bumps", "Women");

    assert.deepEqual(actual, expected);
  });

  it("Join events with different numbers of days correctly.", function () {
    var data = [
      {
        crews: [
          {
            name: "Cantabs 1",
            values: [
              { day: 0, pos: 1 },
              { day: 1, pos: 1 },
              { day: 2, pos: 1 },
              { day: 3, pos: 1 },
              { day: 4, pos: 1 },
              { day: 5, pos: 1 },
              { day: 6, pos: 1 },
            ],
          },
          {
            name: "City 1",
            values: [
              { day: 0, pos: 2 },
              { day: 1, pos: 2 },
              { day: 2, pos: 2 },
              { day: 3, pos: 2 },
              { day: 4, pos: 2 },
              { day: 5, pos: 2 },
              { day: 6, pos: 2 },
            ],
          },
        ],
        divisions: [{ start: 0, size: 2 }],
        year: 2013,
      },
      {
        crews: [
          {
            name: "Cantabs 1",
            values: [
              { day: 0, pos: 1 },
              { day: 1, pos: 1 },
              { day: 2, pos: 1 },
              { day: 3, pos: 1 },
              { day: 4, pos: 1 },
            ],
          },
          {
            name: "City 1",
            values: [
              { day: 0, pos: 2 },
              { day: 1, pos: 2 },
              { day: 2, pos: 2 },
              { day: 3, pos: 2 },
              { day: 4, pos: 2 },
            ],
          },
        ],
        divisions: [{ start: 0, size: 2 }],
        year: 2014,
      },
    ];

    var expected = {
      crews: [
        {
          name: "Cantabs 1",
          values: [
            { day: 0, pos: 1 },
            { day: 1, pos: 1 },
            { day: 2, pos: 1 },
            { day: 3, pos: 1 },
            { day: 4, pos: 1 },
            { day: 5, pos: 1 },
            { day: 6, pos: 1 },
            { day: 7, pos: 1 },
            { day: 8, pos: 1 },
            { day: 9, pos: 1 },
            { day: 10, pos: 1 },
            { day: 11, pos: 1 },
          ],
          valuesSplit: [
            {
              blades: true,
              day: 0,
              name: "Cantabs 1",
              spoons: false,
              values: [
                { day: 0, pos: 1 },
                { day: 1, pos: 1 },
                { day: 2, pos: 1 },
                { day: 3, pos: 1 },
                { day: 4, pos: 1 },
                { day: 5, pos: 1 },
                { day: 6, pos: 1 },
              ],
            },
            {
              blades: true,
              day: 7,
              name: "Cantabs 1",
              spoons: false,
              values: [
                { day: 7, pos: 1 },
                { day: 8, pos: 1 },
                { day: 9, pos: 1 },
                { day: 10, pos: 1 },
                { day: 11, pos: 1 },
              ],
            },
          ],
        },
        {
          name: "City 1",
          values: [
            { day: 0, pos: 2 },
            { day: 1, pos: 2 },
            { day: 2, pos: 2 },
            { day: 3, pos: 2 },
            { day: 4, pos: 2 },
            { day: 5, pos: 2 },
            { day: 6, pos: 2 },
            { day: 7, pos: 2 },
            { day: 8, pos: 2 },
            { day: 9, pos: 2 },
            { day: 10, pos: 2 },
            { day: 11, pos: 2 },
          ],
          valuesSplit: [
            {
              blades: false,
              day: 0,
              name: "City 1",
              spoons: true,
              values: [
                { day: 0, pos: 2 },
                { day: 1, pos: 2 },
                { day: 2, pos: 2 },
                { day: 3, pos: 2 },
                { day: 4, pos: 2 },
                { day: 5, pos: 2 },
                { day: 6, pos: 2 },
              ],
            },
            {
              blades: false,
              day: 7,
              name: "City 1",
              spoons: true,
              values: [
                { day: 7, pos: 2 },
                { day: 8, pos: 2 },
                { day: 9, pos: 2 },
                { day: 10, pos: 2 },
                { day: 11, pos: 2 },
              ],
            },
          ],
        },
      ],
      divisions: [
        {
          divisions: [{ size: 2, start: 0 }],
          year: 2013,
          startDay: 0,
          numDays: 6,
        },
        {
          divisions: [{ size: 2, start: 0 }],
          year: 2014,
          startDay: 7,
          numDays: 4,
        },
      ],
      set: "Lent Bumps",
      gender: "Women",
      endYear: 2014,
      maxCrews: 2,
      startYear: 2013,
    };

    var actual = joinEvents(data, "Lent Bumps", "Women");

    assert.deepEqual(actual, expected);
  });
});
