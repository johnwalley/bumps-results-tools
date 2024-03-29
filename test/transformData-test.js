const assert = require("assert");
const utils = require("../src");

describe("utils", function () {
  it("Transform data correctly.", function () {
    const data = {
      completed: [
        [true, true, true],
        [true, true, true],
        [true, true, true],
        [true, true, true],
      ],
      days: 4,
      divisions: [
        ["Cantabs 1", "City 1", "Rob Roy 1", "99 1"],
        ["Cantabs 2", "City 2"],
        ["Champs 1"],
      ],
      finish: [
        ["99 1", "Rob Roy 1", "City 1", "City 2"],
        ["Cantabs 1", "Cantabs 2"],
        ["Champs 1"],
      ],
      gender: "M",
      move: [
        [[0, 0, 0, 0], [0, -1], [1]],
        [[-3, -1, 1, 3], [0, -1], [1]],
        [[0, 0, 0, -1], [-1, 2], [0]],
        [[0, 0, 0, 0], [0, 0], [0]],
      ],
      result: "",
      results:
        "r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n\
r rrr rrrrr",
      set: "Town Bumps",
      small: "Short",
      year: 2013,
    };

    var expected = {
      crews: [
        {
          name: "Cantabs 1",
          values: [
            { day: 0, pos: 1 },
            { day: 1, pos: 1 },
            { day: 2, pos: 4 },
            { day: 3, pos: 5 },
            { day: 4, pos: 5 },
          ],
        },
        {
          name: "City 1",
          values: [
            { day: 0, pos: 2 },
            { day: 1, pos: 2 },
            { day: 2, pos: 3 },
            { day: 3, pos: 3 },
            { day: 4, pos: 3 },
          ],
        },
        {
          name: "Rob Roy 1",
          values: [
            { day: 0, pos: 3 },
            { day: 1, pos: 3 },
            { day: 2, pos: 2 },
            { day: 3, pos: 2 },
            { day: 4, pos: 2 },
          ],
        },
        {
          name: "99 1",
          values: [
            { day: 0, pos: 4 },
            { day: 1, pos: 4 },
            { day: 2, pos: 1 },
            { day: 3, pos: 1 },
            { day: 4, pos: 1 },
          ],
        },
        {
          name: "Cantabs 2",
          values: [
            { day: 0, pos: 5 },
            { day: 1, pos: 5 },
            { day: 2, pos: 5 },
            { day: 3, pos: 6 },
            { day: 4, pos: 6 },
          ],
        },
        {
          name: "City 2",
          values: [
            { day: 0, pos: 6 },
            { day: 1, pos: 7 },
            { day: 2, pos: 6 },
            { day: 3, pos: 4 },
            { day: 4, pos: 4 },
          ],
        },
        {
          name: "Champs 1",
          values: [
            { day: 0, pos: 7 },
            { day: 1, pos: 6 },
            { day: 2, pos: 7 },
            { day: 3, pos: 7 },
            { day: 4, pos: 7 },
          ],
        },
      ],
      divisions: [
        { size: 4, start: 1 },
        { size: 2, start: 5 },
        { size: 1, start: 7 },
      ],
      year: 2013,
    };

    var actual = utils.transformData(data);

    assert.deepEqual(actual, expected);
  });

  it("Transform data with more than four days correctly.", function () {
    const data = {
      completed: [
        [true, true, true],
        [true, true, true],
        [true, true, true],
        [true, true, true],
        [true, true, true],
        [true, true, true],
      ],
      days: 6,
      divisions: [
        ["Cantabs 1", "City 1", "Rob Roy 1", "99 1"],
        ["Cantabs 2", "City 2"],
        ["Champs 1"],
      ],
      finish: [
        ["99 1", "Rob Roy 1", "City 1", "City 2"],
        ["Cantabs 1", "Cantabs 2"],
        ["Champs 1"],
      ],
      gender: "M",
      move: [
        [[0, 0, 0, 0], [0, -1], [1]],
        [[-3, -1, 1, 3], [0, -1], [1]],
        [[0, 0, 0, -1], [-1, 2], [0]],
        [[0, 0, 0, 0], [0, 0], [0]],
        [[0, 0, 0, 0], [0, 0], [0]],
        [[0, 0, 0, 0], [0, 0], [0]],
      ],
      result: "",
      results:
        "r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n\
r rrr rrrrr\n\
r rrr rrrrr\n\
r rrr rrrrr",
      set: "Town Bumps",
      small: "Short",
      year: 2013,
    };

    var expected = {
      crews: [
        {
          name: "Cantabs 1",
          values: [
            { day: 0, pos: 1 },
            { day: 1, pos: 1 },
            { day: 2, pos: 4 },
            { day: 3, pos: 5 },
            { day: 4, pos: 5 },
            { day: 5, pos: 5 },
            { day: 6, pos: 5 },
          ],
        },
        {
          name: "City 1",
          values: [
            { day: 0, pos: 2 },
            { day: 1, pos: 2 },
            { day: 2, pos: 3 },
            { day: 3, pos: 3 },
            { day: 4, pos: 3 },
            { day: 5, pos: 3 },
            { day: 6, pos: 3 },
          ],
        },
        {
          name: "Rob Roy 1",
          values: [
            { day: 0, pos: 3 },
            { day: 1, pos: 3 },
            { day: 2, pos: 2 },
            { day: 3, pos: 2 },
            { day: 4, pos: 2 },
            { day: 5, pos: 2 },
            { day: 6, pos: 2 },
          ],
        },
        {
          name: "99 1",
          values: [
            { day: 0, pos: 4 },
            { day: 1, pos: 4 },
            { day: 2, pos: 1 },
            { day: 3, pos: 1 },
            { day: 4, pos: 1 },
            { day: 5, pos: 1 },
            { day: 6, pos: 1 },
          ],
        },
        {
          name: "Cantabs 2",
          values: [
            { day: 0, pos: 5 },
            { day: 1, pos: 5 },
            { day: 2, pos: 5 },
            { day: 3, pos: 6 },
            { day: 4, pos: 6 },
            { day: 5, pos: 6 },
            { day: 6, pos: 6 },
          ],
        },
        {
          name: "City 2",
          values: [
            { day: 0, pos: 6 },
            { day: 1, pos: 7 },
            { day: 2, pos: 6 },
            { day: 3, pos: 4 },
            { day: 4, pos: 4 },
            { day: 5, pos: 4 },
            { day: 6, pos: 4 },
          ],
        },
        {
          name: "Champs 1",
          values: [
            { day: 0, pos: 7 },
            { day: 1, pos: 6 },
            { day: 2, pos: 7 },
            { day: 3, pos: 7 },
            { day: 4, pos: 7 },
            { day: 5, pos: 7 },
            { day: 6, pos: 7 },
          ],
        },
      ],
      divisions: [
        { size: 4, start: 1 },
        { size: 2, start: 5 },
        { size: 1, start: 7 },
      ],
      year: 2013,
    };

    var actual = utils.transformData(data);

    assert.deepEqual(actual, expected);
  });

  it("Transform incomplete data correctly.", function () {
    var data = {
      completed: [
        [true, true, true],
        [true, true, true],
        [true, true, true],
        [false, false, false],
      ],
      days: 4,
      divisions: [
        ["Cantabs 1", "City 1", "Rob Roy 1", "99 1"],
        ["Cantabs 2", "City 2"],
        ["Champs 1"],
      ],
      finish: [
        ["99 1", "Rob Roy 1", "City 1", "City 2"],
        ["Cantabs 1", "Cantabs 2"],
        ["Champs 1"],
      ],
      gender: "M",
      move: [
        [[0, 0, 0, 0], [0, -1], [1]],
        [[-3, -1, 1, 3], [0, -1], [1]],
        [[0, 0, 0, -1], [-1, 2], [0]],
      ],
      result: "",
      results:
        "r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n\
r rrr rrrrr",
      set: "Town Bumps",
      small: "Short",
      year: 2013,
    };

    var expected = {
      crews: [
        {
          name: "Cantabs 1",
          values: [
            { day: 0, pos: 1 },
            { day: 1, pos: 1 },
            { day: 2, pos: 4 },
            { day: 3, pos: 5 },
          ],
        },
        {
          name: "City 1",
          values: [
            { day: 0, pos: 2 },
            { day: 1, pos: 2 },
            { day: 2, pos: 3 },
            { day: 3, pos: 3 },
          ],
        },
        {
          name: "Rob Roy 1",
          values: [
            { day: 0, pos: 3 },
            { day: 1, pos: 3 },
            { day: 2, pos: 2 },
            { day: 3, pos: 2 },
          ],
        },
        {
          name: "99 1",
          values: [
            { day: 0, pos: 4 },
            { day: 1, pos: 4 },
            { day: 2, pos: 1 },
            { day: 3, pos: 1 },
          ],
        },
        {
          name: "Cantabs 2",
          values: [
            { day: 0, pos: 5 },
            { day: 1, pos: 5 },
            { day: 2, pos: 5 },
            { day: 3, pos: 6 },
          ],
        },
        {
          name: "City 2",
          values: [
            { day: 0, pos: 6 },
            { day: 1, pos: 7 },
            { day: 2, pos: 6 },
            { day: 3, pos: 4 },
          ],
        },
        {
          name: "Champs 1",
          values: [
            { day: 0, pos: 7 },
            { day: 1, pos: 6 },
            { day: 2, pos: 7 },
            { day: 3, pos: 7 },
          ],
        },
      ],
      divisions: [
        { size: 4, start: 1 },
        { size: 2, start: 5 },
        { size: 1, start: 7 },
      ],
      year: 2013,
    };

    var actual = utils.transformData(data);

    assert.deepEqual(actual, expected);
  });
});
