const assert = require("assert");
const utils = require("../src");

describe("utils", function () {
  it("read_flat() returns a correct intermediate object.", function () {
    const data = `Year,Club,Sex,Day,Crew,Start position,Position,Division
2013,Cantabs,M,1,1,1,1,1
2013,Cantabs,M,2,1,1,4,1
2013,Cantabs,M,3,1,1,5,1
2013,City,M,1,1,2,2,1
2013,City,M,2,1,2,3,1
2013,City,M,3,1,2,3,1
2013,Rob Roy,M,1,1,3,3,1
2013,Rob Roy,M,2,1,3,2,1
2013,Rob Roy,M,3,1,3,2,1
2013,99,M,1,1,4,4,1
2013,99,M,2,1,4,1,1
2013,99,M,3,1,4,1,1
2013,Cantabs,M,1,2,5,5,2
2013,Cantabs,M,2,2,5,5,2
2013,Cantabs,M,3,2,5,6,2
2013,City,M,1,2,6,7,2
2013,City,M,2,2,6,6,2
2013,City,M,3,2,6,4,2
2013,Champs,M,1,1,7,6,3
2013,Champs,M,2,1,7,7,3
2013,Champs,M,3,1,7,7,3
`;

    const expected = [
      {
        completed: [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        days: 3,
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
        results: `r ur rrrrr
r ur ro3u
r ru urrr`,
        set: "Town Bumps",
        small: "Short",
        year: 2013,
      },
    ];

    const actual = utils.read_flat(data);

    assert.deepEqual(actual, expected);
  });

  it("read_tg() returns a correct intermediate object.", function () {
    const data = `Set,Town Bumps
Short,Short
Gender,M
Year,2013
Days,3

Division,Cantabs 1,City 1,Rob Roy 1,99 1
Division,Cantabs 2,City 2
Division,Champs 1

Results
 r
 ur
 rrrrr
 r
 ur
 ro3u
 r
 ru
 urrr
 `;

    const expected = {
      completed: [
        [true, true, true],
        [true, true, true],
        [true, true, true],
      ],
      days: 3,
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
      results: `r ur rrrrr
r ur ro3u
r ru urrr`,
      set: "Town Bumps",
      small: "Short",
      year: 2013,
    };

    const actual = utils.read_tg(data);

    assert.deepEqual(actual, expected);
  });

  it("read_tg() returns a correct intermediate object given Torpids input", function () {
    const data = `Set,Summer Eights
Short,Eights
Gender,Women
Year,1985

Division,SHu,Osler House,LM,SHu2,SC,SHi,J,S,Wt,SAn,Co,P
Division,Wh,K,N,Br,Wf,LM2,L,Lc,H,B,U,T
Division,Ch,S2,SHi2,SE,Q,SHu3,Br2,SC2,J2,T2,Mf,Mg
Division,SHu4,Mt,SHi3,J3,K2,SJ,Wf2,N2,SP,SAn2,SHi4,Lc2
Division,H2,SE2,SHu5,B2,E,Wh2,Wt2,R,U2,Br3,Ch2,SC3,Lc3

Results
rrurure1e1e1e-3r ruruo3urrr ruuururrr uuo3ururr uruuurru
rruururru e1e1e1e1e1e1e1e-7rrrrr rruururru urrururur rruuururr
rrururuur urrrruurrr uruuurrrr rro3urruru ruuururrr
rrurrrrrurr rurruuuu rrrrrrrrurrr rrururrurr uuururrrr
`;

    const expected = {
      set: "Summer Eights",
      small: "Eights",
      gender: "Women",
      result: "",
      year: 1985,
      days: 4,
      divisions: [
        [
          "SHu",
          "Osler House",
          "LM",
          "SHu2",
          "SC",
          "SHi",
          "J",
          "S",
          "Wt",
          "SAn",
          "Co",
          "P",
        ],
        ["Wh", "K", "N", "Br", "Wf", "LM2", "L", "Lc", "H", "B", "U", "T"],
        [
          "Ch",
          "S2",
          "SHi2",
          "SE",
          "Q",
          "SHu3",
          "Br2",
          "SC2",
          "J2",
          "T2",
          "Mf",
          "Mg",
        ],
        [
          "SHu4",
          "Mt",
          "SHi3",
          "J3",
          "K2",
          "SJ",
          "Wf2",
          "N2",
          "SP",
          "SAn2",
          "SHi4",
          "Lc2",
        ],
        [
          "H2",
          "SE2",
          "SHu5",
          "B2",
          "E",
          "Wh2",
          "Wt2",
          "R",
          "U2",
          "Br3",
          "Ch2",
          "SC3",
          "Lc3",
        ],
      ],
      results:
        "rrurure1e1e1e-3r ruruo3urrr ruuururrr uuo3ururr uruuurru\nrruururru e1e1e1e1e1e1e1e-7rrrrr rruururru urrururur rruuururr\nrrururuur urrrruurrr uruuurrrr rro3urruru ruuururrr\nrrurrrrrurr rurruuuu rrrrrrrrurrr rrururrurr uuururrrr",
      move: [
        [
          [-1, 1, 0, 0, -1, 1, -1, 1, -1, 1, 0, -1],
          [1, 0, -1, 1, 0, -3, -1, 1, 3, -1, 1, -1],
          [1, 0, 0, -1, 1, 0, -1, 1, -1, 1, -1, 1],
          [0, 0, 0, -3, -1, 1, 3, -1, 1, 0, -1, 1],
          [0, -3, 1, 1, 1, 0, -1, 1, 0, -1, 1, 0, 0],
        ],
        [
          [0, 0, -1, 1, 0, -1, 1, -1, 1, -1, 1, 0],
          [0, -1, 1, 0, -1, 1, 0, -1, 1, 0, 0, -1],
          [-1, 2, 0, 0, -1, 1, 0, -1, 1, -1, 1, 0],
          [0, 0, 0, 0, 0, -7, 1, 1, 1, 1, 1, 1],
          [-1, 2, 0, 0, -1, 1, 0, -1, 1, -1, 1, 0, 0],
        ],
        [
          [0, 0, 0, -1, 1, 0, -1, 1, -1, 1, -1, 1],
          [-1, 1, 0, -1, 1, 0, 0, -3, -1, 1, 3, 0],
          [0, 0, 0, 0, -1, 1, -1, 1, -1, 1, 0, -1],
          [1, 0, 0, -1, 1, -1, 1, 0, 0, 0, 0, -1],
          [1, -1, 1, -1, 1, 0, -1, 1, 0, -1, 1, 0, 0],
        ],
        [
          [0, 0, 0, 0, -1, 1, 0, -1, 1, -1, 1, -1],
          [1, 0, -1, 1, 0, 0, -1, 1, 0, -1, 1, 0],
          [0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0],
          [-1, 1, -1, 1, -1, 1, -1, 1, 0, 0, -1, 1],
          [0, 0, -1, 1, 0, 0, 0, 0, 0, -1, 1, 0, 0],
        ],
      ],
      finish: [
        [
          "Osler House",
          "SHu",
          "SHu2",
          "SHi",
          "S",
          "LM",
          "SAn",
          "Co",
          "SC",
          "Wh",
          "J",
          "Br",
        ],
        ["Wt", "P", "H", "K", "N", "Wf", "B", "Lc", "U", "LM2", "L", "S2"],
        [
          "Ch",
          "T",
          "SHi2",
          "SE",
          "Q",
          "SHu3",
          "T2",
          "SC2",
          "Mg",
          "Br2",
          "J2",
          "SHu4",
        ],
        [
          "Mt",
          "Mf",
          "SJ",
          "SHi3",
          "SP",
          "Wf2",
          "N2",
          "J3",
          "SAn2",
          "Lc2",
          "K2",
          "SHi4",
        ],
        [
          "SHu5",
          "B2",
          "Wh2",
          "H2",
          "E",
          "SE2",
          "U2",
          "R",
          "Wt2",
          "Br3",
          "Ch2",
          "SC3",
          "Lc3",
        ],
      ],
      completed: [
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
      ],
    };

    const actual = utils.read_tg(data);

    assert.deepEqual(actual, expected);
  });

  it("read_tg() returns a correct intermediate object given Eights input", function () {
    const data = `Set,Summer Eights
Short,Eights
Gender,Men
Year,1987

Division,N,O,Ch,U,Wt,SE,K,Mg,Lc,B,P,Wh
Division,T,E,Q,SJ,J,SC,Osler House,H,O2,Wf,Br,K2
Division,Mt,Co,SP,N2,U2,Ch2,LM,Lc2,E2,O3,SE2,Wt2
Division,Mf,P2,H2,Br2,SJ2,SC2,B2,Wh2,Mg2,T2,K3,Ch3
Division,SAn,Mt2,Q2,J2,L,B3,Wt3,U3,Osler House 2,Lc3,N3,E3
Division,Mt3,U4,SE3,SP2,Wf2,P3,K4,O4,LM2,O5,Co2,K5
Division,Ch4,SJ3,Lc4,H3,R,Q3,SP3,SC3,N4,SC4,SAn2,O6
Division,Br3,Wh3,T3,Mf2,SE4,N5,SJ4,T4,Wt4,B4,H4,Mg3
Division,Templeton,U5,E4,LM3,J3,Templeton 2,Br4,Mg4,Ch5,H5,SE5,LM4,SJ5

Results
uurrrrrrur uuururru urruuruu urro3ururr uuuuuur urrurrrrur ururrue1e1e1e-3 uuruurur rruurrrurr
uuurrruu ruuurrrur rrruuurru ruuruuur ruuuuuu rurrrrruru rrue1e1e1e1e2re1e1e-8 urruururr rrrurrrrrru
rrrrrrrruur uuuuruu urruuuur uurrruuu uuuuuur uurrrrrurr ruuururu uruuurur rruurrrrrrr
urrrrrurru ruuuruur ruuuuuu ruuuruur ruuuuuu ruurrurrrr uuururur rururruru ruuurrrrrr
`;

    const expected = {
      set: "Summer Eights",
      small: "Eights",
      gender: "Men",
      result: "",
      year: 1987,
      days: 4,
      divisions: [
        ["N", "O", "Ch", "U", "Wt", "SE", "K", "Mg", "Lc", "B", "P", "Wh"],
        [
          "T",
          "E",
          "Q",
          "SJ",
          "J",
          "SC",
          "Osler House",
          "H",
          "O2",
          "Wf",
          "Br",
          "K2",
        ],
        [
          "Mt",
          "Co",
          "SP",
          "N2",
          "U2",
          "Ch2",
          "LM",
          "Lc2",
          "E2",
          "O3",
          "SE2",
          "Wt2",
        ],
        [
          "Mf",
          "P2",
          "H2",
          "Br2",
          "SJ2",
          "SC2",
          "B2",
          "Wh2",
          "Mg2",
          "T2",
          "K3",
          "Ch3",
        ],
        [
          "SAn",
          "Mt2",
          "Q2",
          "J2",
          "L",
          "B3",
          "Wt3",
          "U3",
          "Osler House 2",
          "Lc3",
          "N3",
          "E3",
        ],
        [
          "Mt3",
          "U4",
          "SE3",
          "SP2",
          "Wf2",
          "P3",
          "K4",
          "O4",
          "LM2",
          "O5",
          "Co2",
          "K5",
        ],
        [
          "Ch4",
          "SJ3",
          "Lc4",
          "H3",
          "R",
          "Q3",
          "SP3",
          "SC3",
          "N4",
          "SC4",
          "SAn2",
          "O6",
        ],
        [
          "Br3",
          "Wh3",
          "T3",
          "Mf2",
          "SE4",
          "N5",
          "SJ4",
          "T4",
          "Wt4",
          "B4",
          "H4",
          "Mg3",
        ],
        [
          "Templeton",
          "U5",
          "E4",
          "LM3",
          "J3",
          "Templeton 2",
          "Br4",
          "Mg4",
          "Ch5",
          "H5",
          "SE5",
          "LM4",
          "SJ5",
        ],
      ],
      results:
        "uurrrrrrur uuururru urruuruu urro3ururr uuuuuur urrurrrrur ururrue1e1e1e-3 uuruurur rruurrrurr\nuuurrruu ruuurrrur rrruuurru ruuruuur ruuuuuu rurrrrruru rrue1e1e1e1e2re1e1e-8 urruururr rrrurrrrrru\nrrrrrrrruur uuuuruu urruuuur uurrruuu uuuuuur uurrrrrurr ruuururu uruuurur rruurrrrrrr\nurrrrrurru ruuuruur ruuuuuu ruuuruur ruuuuuu ruurrurrrr uuururur rururruru ruuurrrrrr",
      move: [
        [
          [0, 0, -1, 1, 0, 0, 0, -1, 1, -1, 1, 0],
          [0, -1, 1, 0, -1, 1, -1, 1, 0, -1, 1, -1],
          [-3, 2, 1, 1, -1, 1, 0, 0, -1, 1, 0, -1],
          [1, -1, 1, 0, 0, 0, 0, -1, 1, 0, 0, -1],
          [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1],
          [1, 0, -1, 1, 0, -3, -1, 1, 3, 0, 0, -1],
          [-1, 2, -1, 1, 0, -1, 1, -1, 1, 0, 0, -1],
          [-1, 2, 0, 0, -1, 1, 0, -1, 1, -1, 1, -1],
          [1, -1, 1, 0, 0, 0, 0, 0, 0, -1, 1, -1, 1],
        ],
        [
          [-1, 1, 0, 0, 0, 0, 0, 0, -1, 1, 0, 0],
          [0, 0, -1, 1, 0, -1, 1, -1, 1, 0, 0, -1],
          [-8, 2, 1, 0, 2, 1, 1, 1, 1, -1, 1, 0],
          [-1, 1, 0, -1, 1, 0, 0, 0, 0, 0, -1, 1],
          [-1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
          [0, -1, 1, -1, 1, -1, 1, 0, -1, 1, -1, 1],
          [-1, 1, 0, 0, -1, 1, -1, 1, -1, 1, 0, 0],
          [0, -1, 1, 0, 0, 0, -1, 1, -1, 1, -1, 1],
          [-1, 1, -1, 1, 0, 0, 0, -1, 1, -1, 1, -1, 1],
        ],
        [
          [0, 0, 0, 0, 0, 0, 0, -1, 1, -1, 1, 0],
          [0, -1, 1, 0, -1, 1, -1, 1, -1, 1, 0, -1],
          [-1, 2, 0, -1, 1, 0, -1, 1, -1, 1, -1, 1],
          [0, 0, -1, 1, 0, 0, 0, 0, 0, -1, 1, -1],
          [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1],
          [-1, 2, -1, 1, -1, 1, 0, 0, 0, -1, 1, -1],
          [1, -1, 1, -1, 1, -1, 1, -1, 1, 0, 0, -1],
          [-1, 2, -1, 1, 0, -1, 1, -1, 1, -1, 1, -1],
          [1, -1, 1, -1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0, 0, 0, -1, 1, -1, 1, -1, 1],
          [-1, 1, 0, -1, 1, 0, 0, -1, 1, 0, -1, 1],
          [0, -1, 1, 0, -1, 1, 0, -1, 1, -1, 1, -1],
          [1, 0, 0, 0, -1, 1, 0, 0, -1, 1, -1, 1],
          [-1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
          [0, -1, 1, -1, 1, 0, -1, 1, -1, 1, -1, 1],
          [-1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
          [0, -1, 1, -1, 1, 0, -1, 1, -1, 1, -1, 1],
          [-1, 1, 0, 0, -1, 1, 0, 0, 0, 0, 0, -1, 1],
        ],
      ],
      finish: [
        ["O", "N", "U", "Ch", "Wt", "SE", "P", "K", "B", "Lc", "Wh", "Mg"],
        [
          "SJ",
          "T",
          "Q",
          "H",
          "E",
          "SC",
          "O2",
          "Br",
          "J",
          "Osler House",
          "N2",
          "Wf",
        ],
        [
          "SP",
          "Ch2",
          "Co",
          "U2",
          "LM",
          "Mt",
          "O3",
          "SE2",
          "Lc2",
          "Mf",
          "K2",
          "H2",
        ],
        [
          "E2",
          "Wt2",
          "SJ2",
          "P2",
          "SC2",
          "Br2",
          "B2",
          "Mg2",
          "SAn",
          "Wh2",
          "Q2",
          "T2",
        ],
        [
          "L",
          "K3",
          "Wt3",
          "Ch3",
          "Osler House 2",
          "Mt2",
          "N3",
          "J2",
          "Mt3",
          "B3",
          "SP2",
          "U3",
        ],
        [
          "Lc3",
          "Wf2",
          "E3",
          "O4",
          "U4",
          "SE3",
          "K4",
          "LM2",
          "SJ3",
          "O5",
          "Ch4",
          "P3",
        ],
        [
          "H3",
          "Co2",
          "SP3",
          "K5",
          "N4",
          "Lc4",
          "SC4",
          "R",
          "SC3",
          "Q3",
          "T3",
          "SAn2",
        ],
        [
          "Wh3",
          "Mf2",
          "O6",
          "N5",
          "Br3",
          "Wt4",
          "H4",
          "SE4",
          "Templeton",
          "SJ4",
          "E4",
          "T4",
        ],
        [
          "LM3",
          "B4",
          "Mg3",
          "J3",
          "Templeton 2",
          "U5",
          "Br4",
          "Ch5",
          "Mg4",
          "H5",
          "SE5",
          "SJ5",
          "LM4",
        ],
      ],
      completed: [
        [true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true, true, true],
      ],
    };

    const actual = utils.read_tg(data);

    assert.deepEqual(actual, expected);
  });

  it("read_ad() returns a correct intermediate object.", function () {
    const data = `EIGHTS 2016
 4  3  7   = NDay, NDiv, NCrew
 3  Men's Div I (6.45)
Oriel                       0   0   0   0
Christ Church               0  -1   0   0
Pembroke                   -1   0   0  -1
 3  Men's Div II (5.45)
Osler-Green                -1  -1  -1   0
St Catherine's              2   1   0   0
Pembroke IV                 0   1   0   1
 1  Men's Div III (4.45)
Exeter                      0   0   1   0
`;

    const expected = {
      completed: [
        [true, true, true],
        [true, true, true],
        [true, true, true],
        [true, true, true],
      ],
      days: 4,
      divisions: [
        ["Oriel", "Christ Church", "Pembroke"],
        ["Osler-Green", "St Catherine's", "Pembroke 4"],
        ["Exeter"],
      ],
      finish: [
        ["Oriel", "St Catherine's", "Christ Church"],
        ["Pembroke 4", "Pembroke", "Exeter"],
        ["Osler-Green"],
      ],
      gender: "Men",
      move: [
        [[0, 0, -1], [-1, 2, 0], [0]],
        [[0, -1, 1], [0, -1, 1], [0]],
        [[0, 0, 0], [0, 0, -1], [1]],
        [[0, 0, 0], [-1, 1, 0], [0]],
      ],
      result: "",
      results: `r rru urr
r rur rur
r urr rrrr
r rru rrrr`,
      set: "Summer Eights",
      small: "Eights",
      year: 2016,
    };

    const actual = utils.read_ad(data);

    assert.deepEqual(actual, expected);
  });

  it("read_ad() returns a correct intermediate object for Torpids.", function () {
    const data = `TORPIDS 2017
 4  5  61   = NDay, NDiv, NCrew
 12  Women's Div I (4.30)
Magdalen                   -4  -4  -1  -2
Oriel                       1   0   0   0
Pembroke                    0  -1  -1   0
Christ Church               2   0  -1   0
Wadham                      1   1   1   0
University                 -2   0   0   0
Wolfson                     1   1   1  -5
Hertford                    1   1   0   2
New College                -1  -1  -2   0
St John's                   1   2   0   1
Balliol                    -1  -1  -1  -2
Keble                       1   1   1   2
 12  Women's Div II (3.30)
S.E.H.                      0  -2  -2  -1
Lincoln                     0   2   1   1
Trinity                    -1  -3   1   1
Jesus                       1   1   2   1
St Catherine's             -3  -5  -1  -1
Somerville                  1   1   1   1
Linacre                     0   1  -2  -1
Green Templeton             2   1   1   1
Worcester                  -1   1  -1  -2
St Anne's                   1   1   1   0
St Hugh's                  -2  -2  -1  -1
Brasenose                   1   0  -2   0
 12  Women's Div III (2.30)
L.M.H.                      1   2   1   1
Mansfield                   0   2   1   1
Corpus Christi             -2  -4  -4  -1
Wolfson II                  1   1   2   1
Wadham II                   1   0   1   1
Exeter                     -1   1   1   1
Queen's                     1   1  -1   0
St Hilda's                  0   1   0   0
St Peter's                 -1   0   0  -1
Merton                      1   1   0   0
St Antony's                 0   0   2   0
New College II             -1  -2  -4  -2
 12  Women's Div IV (1.30)
St John's II               -1   2   0  -1
Pembroke II                 2  -1  -1   2
Regent's Park              -3   1   1   1
Lincoln II                  0   0   1  -3
Oriel II                    2   1   3   1
Worcester II                1  -3  -2  -3
University II              -6  -1   1  -1
Wolfson III                 1   1   1   0
Somerville II               1   1   1   2
Jesus II                    1  -2   0   1
Magdalen II                -1  -1  -3  -3
Linacre II                  2   1   0   1
 13  *Women's Div V (12.30)
Balliol II                  2   1   2   1
Lincoln III                 0   2   0   0
Christ Church II           -5  -1   0  -1
Hertford II                 1  -4   1   0
Trinity II                  1   1   1   3
Wadham III                  1   0  -3   0
St Anne's II                1   2   1   0
Mansfield II                1   1   1   1
St Hilda's II              -1  -1  -1   1
Keble II                    1   1   1   2
Exeter II                  -1  -1   2  -2
Merton II                   1   1  -3   1
L.M.H. II                   0   1   2   1
`;

    const expected = {
      set: "Torpids",
      small: "Torpids",
      gender: "Women",
      result: "",
      year: 2017,
      days: 4,
      divisions: [
        [
          "Magdalen",
          "Oriel",
          "Pembroke",
          "Christ Church",
          "Wadham",
          "University",
          "Wolfson",
          "Hertford",
          "New College",
          "St John's",
          "Balliol",
          "Keble",
        ],
        [
          "S.E.H.",
          "Lincoln",
          "Trinity",
          "Jesus",
          "St Catherine's",
          "Somerville",
          "Linacre",
          "Green Templeton",
          "Worcester",
          "St Anne's",
          "St Hugh's",
          "Brasenose",
        ],
        [
          "L.M.H.",
          "Mansfield",
          "Corpus Christi",
          "Wolfson 2",
          "Wadham 2",
          "Exeter",
          "Queen's",
          "St Hilda's",
          "St Peter's",
          "Merton",
          "St Antony's",
          "New College 2",
        ],
        [
          "St John's 2",
          "Pembroke 2",
          "Regent's Park",
          "Lincoln 2",
          "Oriel 2",
          "Worcester 2",
          "University 2",
          "Wolfson 3",
          "Somerville 2",
          "Jesus 2",
          "Magdalen 2",
          "Linacre 2",
        ],
        [
          "Balliol 2",
          "Lincoln 3",
          "Christ Church 2",
          "Hertford 2",
          "Trinity 2",
          "Wadham 3",
          "St Anne's 2",
          "Mansfield 2",
          "St Hilda's 2",
          "Keble 2",
          "Exeter 2",
          "Merton 2",
          "L.M.H. 2",
        ],
      ],
      results: `re1e-1e1e-1e1e1e1e1e1e-5rr e2e2e-1e1e1e1e-6e1e2re-3e2e-1 re-1re1e-1re1e-1e1e1e-2rr e1e1e-2e1e-1e2re1e-3e1e-1rr re1e-1e1e-1e1e1e-2e1e2re1e-4
e1e-1e1e-1e1e-1e1e2re1e-4e2e-1 re-1e1e1e-2e1e1e1e-3re1e2e-2 re-1rre1e1e1e1e-4re1e2e-2 re2re1e1e-5e1e1e1e-3e1e2e-2 re-1e1e-1e2re1e1e-4e1e-1rr
e2e2e-1e-3re1e1e1e-3e1e1e1e-3 rrre2re-2e1e1e1e1e-4e3e-1 rre2re-4rre1e-1e1e-1e2e-1 re1e-2e1e-1e1e1e-2e1e1e-2e2e-1 re1e-2e1e-1rrre1e-1e1e-1r
e1e1e-2e1e-1re2re1e-3re3e-1 rre1e-3e1e1e-2e2re1e-3e2e-1 re-1e1e-1rrrre1e-1e1e-1r re1e1e-2e1e-1re1e-1e1e1e-2r re1e1e-2e2re1e2re-5rrr`,
      move: [
        [
          [-4, 1, 0, 2, 1, -2, 1, 1, -1, 1, -1, 1],
          [0, 0, -1, 1, -3, 1, 0, 2, -1, 1, -2, 1],
          [1, 0, -2, 1, 1, -1, 1, 0, -1, 1, 0, -1],
          [-1, 2, -3, 0, 2, 1, -6, 1, 1, 1, -1, 2],
          [2, 0, -5, 1, 1, 1, 1, 1, -1, 1, -1, 1, 0],
        ],
        [
          [0, 0, -1, 1, -4, 1, 1, 0, 2, -1, 1, -1],
          [-2, 2, 1, -3, 1, 1, 1, -5, 1, 1, 0, 2],
          [-2, 2, 1, 0, -4, 1, 1, 1, 1, 0, 0, -1],
          [-2, 2, 1, 0, -3, 1, 1, 1, -2, 1, 1, -1],
          [-1, 2, -4, 1, 0, 2, 1, -1, 1, -1, 1, -1, 1],
        ],
        [
          [0, -1, 1, -1, 1, 0, 0, 0, -1, 1, -2, 1],
          [-1, 2, -2, 1, 1, -2, 1, 1, -1, 1, -2, 1],
          [-1, 2, -1, 1, -1, 1, 0, 0, -4, 0, 2, 0],
          [-1, 3, -4, 1, 1, 1, 1, -2, 0, 2, 0, 0],
          [-3, 1, 1, 1, -3, 1, 1, 1, 0, -3, -1, 2, 2],
        ],
        [
          [0, 0, 0, -5, 0, 2, 1, 0, 2, -2, 1, 1],
          [0, -2, 1, 1, -1, 1, 0, -1, 1, -2, 1, 1],
          [0, -1, 1, -1, 1, 0, 0, 0, 0, -1, 1, -1],
          [-1, 2, -3, 1, 0, 2, -2, 1, 1, -3, 1, 0],
          [-1, 3, 0, -3, 1, 0, 2, 0, -1, 1, -2, 1, 1],
        ],
      ],
      finish: [
        [
          "Oriel",
          "Wadham",
          "Christ Church",
          "Hertford",
          "Pembroke",
          "St John's",
          "Keble",
          "University",
          "Wolfson",
          "Lincoln",
          "Jesus",
          "Magdalen",
        ],
        [
          "New College",
          "Somerville",
          "Green Templeton",
          "Balliol",
          "Trinity",
          "S.E.H.",
          "St Anne's",
          "L.M.H.",
          "Linacre",
          "Mansfield",
          "Wolfson 2",
          "Worcester",
        ],
        [
          "Brasenose",
          "Wadham 2",
          "St Catherine's",
          "Exeter",
          "St Hugh's",
          "Queen's",
          "St Hilda's",
          "Merton",
          "St Antony's",
          "Oriel 2",
          "St Peter's",
          "Pembroke 2",
        ],
        [
          "St John's 2",
          "Corpus Christi",
          "Regent's Park",
          "Somerville 2",
          "Wolfson 3",
          "Lincoln 2",
          "Balliol 2",
          "Linacre 2",
          "New College 2",
          "Jesus 2",
          "Trinity 2",
          "Lincoln 3",
        ],
        [
          "Worcester 2",
          "University 2",
          "St Anne's 2",
          "Mansfield 2",
          "Keble 2",
          "Hertford 2",
          "Magdalen 2",
          "Wadham 3",
          "L.M.H. 2",
          "Christ Church 2",
          "St Hilda's 2",
          "Merton 2",
          "Exeter 2",
        ],
      ],
      completed: [
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
        [true, true, true, true, true],
      ],
    };

    const actual = utils.read_ad(data);

    assert.deepEqual(actual, expected);
  });

  it("read_ad() returns a correct intermediate object for Torpids when no racing occured.", function () {
    var data = `TORPIDS 2000                   0 days                                           
 STARTING ORDER - NO RACING     6 divisions                                      
   MEN'S DIV I                 12 crews                                          
 Pembroke                                                                        
 Oriel                                                                           
 New College                                                                     
 Exeter                                                                          
 Christ Church                                                                   
 Worcester                                                                       
 Magdalen                                                                        
 Brasenose                                                                       
 Queen's                                                                         
 St. Catherine's                                                                 
 Lincoln                                                                         
 Merton                                                                          
   MEN'S DIV II                12 crews                                          
 Oriel II                                                                        
 Wadham                                                                          
 L.M.H.                                                                          
 St. Peter's                                                                     
 Trinity                                                                         
 S.E.H.                                                                          
 St. John's                                                                      
 Keble                                                                           
 Balliol                                                                         
 University                                                                      
 Jesus                                                                           
 Hertford                                                                        
   MEN'S DIV III               12 crews                                          
 Mansfield                                                                       
 Osler-Green                                                                     
 Wolfson                                                                         
 Corpus Christi                                                                  
 Christ Church II                                                                
 St. Anne's                                                                      
 Linacre                                                                         
 Magdalen II                                                                     
 Pembroke II                                                                     
 Somerville                                                                      
 St. Hugh's                                                                      
 Keble II                                                                        
   MEN'S DIV IV                12 crews                                          
 Oriel III                                                                       
 Balliol II                                                                      
 Lincoln II                                                                      
 St. John's II                                                                   
 Brasenose II                                                                    
 New College II                                                                  
 Exeter II                                                                       
 S.E.H. II                                                                       
 University II                                                                   
 L.M.H. II                                                                       
 St. Catherine's II                                                              
 Wadham II                                                                       
   MEN'S DIV V                 12 crews                                          
 Jesus II                                                                        
 St. Anne's II                                                                   
 Queen's II                                                                      
 St. Peter's II                                                                  
 Magdalen III                                                                    
 Hertford II                                                                     
 Trinity II                                                                      
 Merton II                                                                       
 St. Benet's Hall                                                                
 Wolfson II                                                                      
 University III                                                                  
 Regent's Park                                                                   
   MEN'S DIV VI                13 crews                                          
 Worcester II                                                                    
 Wolfson III                                                                     
 Pembroke III                                                                    
 Balliol III                                                                     
 Linacre II                                                                      
 Mansfield II                                                                    
 University IV                                                                   
 Christ Church III                                                               
 Somerville II                                                                   
 Keble III                                                                       
 Christ Church IV                                                                
 S.E.H. III                                                                      
 Oriel IV                                                                        
 `;

    const expected = {
      set: "Torpids",
      small: "Torpids",
      gender: "Men",
      result: "",
      year: 2000,
      days: 0,
      divisions: [],
      results: "",
      move: [],
      finish: [],
      completed: [],
    };

    var actual = utils.read_ad(data);

    assert.deepEqual(actual, expected);
  });

  it("read_ad() returns a correct intermediate object for Summer Eights.", function () {
    const data = `EIGHTS 2016
 4  7  92   = NDay, NDiv, NCrew
 13  Men's Div I (6.45)
Oriel                       0   0   0   0
Christ Church               0   0   0   0
Pembroke                    0   0   0  -1
Magdalen                   -1  -1  -1   0
Wolfson                     1   0  -1   0
Keble                       0   1   1   1
Trinity                    -1  -1  -1  -1
University                  1   0   1   0
S.E.H.                      0   1   0  -1
Balliol                    -1  -1   0   0
Wadham                      1   0   1   1
New College                 0   1   0   1
Hertford                    0   0   0   0
 13  Men's Div II (5.45)
Worcester                  -1  -1  -1  -1
St Catherine's              1   0   0   0
Brasenose                  -1  -1  -1  -1
L.M.H.                      1   1   0   0
Mansfield                   0   1   1   0
Lincoln                     0   0   1   1
Jesus                       0   0   0   1
St John's                   0  -1  -1  -1
Oriel II                   -1  -1  -1   0
Pembroke II                 1   1   0   0
St Anne's                  -1  -1   0   0
Queen's                     1   1   1   0
St Peter's                 -1   0  -1  -1
 13  Men's Div III (4.45)
Exeter                     -1   0   1   0
St Hugh's                   2   1   1   1
Christ Church II           -1  -1  -1   1
Corpus Christi              1   0  -1   0
New College II             -1   0   1  -1
Merton                      1   1   1   1
Somerville                  0   0   0  -1
St Antony's                 0   0   0   1
Linacre                    -1   0  -1  -1
University II               1   0   0   0
Wadham II                   0   0   1   0
Magdalen II                -1  -1  -1  -1
Balliol II                  1   0  -1   0
 13  Men's Div IV (3.40)
Trinity II                  0  -1   1   0
S.E.H. II                  -1  -1   1   1
Keble II                    1   2   1   1
Jesus II                    0   1  -1   0
Osler House                 0  -1  -1  -1
Brasenose II               -1  -1  -1  -1
Wolfson II                  1   1   0   0
Worcester II               -1  -1  -1  -1
Hertford II                 1   1   1   0
St Catherine's II           0   1   1   1
St John's II               -1  -1  -1  -1
Green Templeton             1   0   1   1
St Hilda's                 -1   0   1   0
 13  Men's Div V (2.20)
Merton II                   1   1   0   1
Lincoln II                  0   0   0   1
Exeter II                   0   0   0   0
St Peter's II               0  -1   0  -1
Wolfson III                -1  -1   1   1
Regent's Park               1   1   0   0
Pembroke III                0   1  -1   0
Jesus III                  -1  -1  -1  -1
Queen's II                 -1   1   0  -1
St Benet's Hall             2   0   0   0
St Anne's II               -1   0  -1  -1
University III              1   0   1   1
Wadham III                 -1  -1  -1   0
 13  Men's Div VI (1.15)*
Somerville II               1  -1   0  -1
Oriel III                  -1  -1  -1   0
L.M.H. II                   1   2   1   1
S.E.H. III                 -1  -1   0   0
Mansfield II                1   1   1   2
Keble III                   0   1   1   0
Pembroke IV                -1  -1  -1  -1
New College III             1   0  -1  -1
Linacre II                 -1  -1  -1   0
St John's III               1   1   1   0
St Hugh's II                0   1   1   1
Hertford III                0  -1   0  -1
Merton III                 -1  -1  -1  -1
 14  Men's Div VII (12.00)*
Balliol III                 1   1   1   1
Keble IV                   -1  -1  -1  -5
Jesus IV                    1   1   0  -1
Mansfield III              -1  -1   0  -1
St Antony's II              1   1   1   2
University IV               0   1   1   1
Corpus Christi II           0  -1   0  -1
L.M.H. III                 -3  -1   0  -1
Lincoln III                -1   0  -1   0
St Hilda's II               1   0  -1   5
St Catherine's III          3   1   0   1
St Antony's III            -1  -1   0   0
Balliol IV                  1   1   2   1
Corpus Christi III          0   1   0   1
`;

    const expected = {
      set: "Summer Eights",
      small: "Eights",
      gender: "Men",
      result: "",
      year: 2016,
      days: 4,
      divisions: [
        [
          "Oriel",
          "Christ Church",
          "Pembroke",
          "Magdalen",
          "Wolfson",
          "Keble",
          "Trinity",
          "University",
          "S.E.H.",
          "Balliol",
          "Wadham",
          "New College",
          "Hertford",
        ],
        [
          "Worcester",
          "St Catherine's",
          "Brasenose",
          "L.M.H.",
          "Mansfield",
          "Lincoln",
          "Jesus",
          "St John's",
          "Oriel 2",
          "Pembroke 2",
          "St Anne's",
          "Queen's",
          "St Peter's",
        ],
        [
          "Exeter",
          "St Hugh's",
          "Christ Church 2",
          "Corpus Christi",
          "New College 2",
          "Merton",
          "Somerville",
          "St Antony's",
          "Linacre",
          "University 2",
          "Wadham 2",
          "Magdalen 2",
          "Balliol 2",
        ],
        [
          "Trinity 2",
          "S.E.H. 2",
          "Keble 2",
          "Jesus 2",
          "Osler House",
          "Brasenose 2",
          "Wolfson 2",
          "Worcester 2",
          "Hertford 2",
          "St Catherine's 2",
          "St John's 2",
          "Green Templeton",
          "St Hilda's",
        ],
        [
          "Merton 2",
          "Lincoln 2",
          "Exeter 2",
          "St Peter's 2",
          "Wolfson 3",
          "Regent's Park",
          "Pembroke 3",
          "Jesus 3",
          "Queen's 2",
          "St Benet's Hall",
          "St Anne's 2",
          "University 3",
          "Wadham 3",
        ],
        [
          "Somerville 2",
          "Oriel 3",
          "L.M.H. 2",
          "S.E.H. 3",
          "Mansfield 2",
          "Keble 3",
          "Pembroke 4",
          "New College 3",
          "Linacre 2",
          "St John's 3",
          "St Hugh's 2",
          "Hertford 3",
          "Merton 3",
        ],
        [
          "Balliol 3",
          "Keble 4",
          "Jesus 4",
          "Mansfield 3",
          "St Antony's 2",
          "University 4",
          "Corpus Christi 2",
          "L.M.H. 3",
          "Lincoln 3",
          "St Hilda's 2",
          "St Catherine's 3",
          "St Antony's 3",
          "Balliol 4",
          "Corpus Christi 3",
        ],
      ],
      results: `ruo3urruur urruuruur uue2e-1e-1rurrrr uuruurrur rururruuu uuurrrruu rrrurururrr
uurruuuu ruuuruuu urruruurrr ruruuuuu urrrrrrrurrr ruuurruur rrurururrrr
rrre2e-1e-1rrruur rruuuruur ruurrurrrrr uruuuruu ruurrruuu rruurruurr rrrruruurrr
ruro5uuuu uruurrrrru uuurrurru rruuurrrur rrurruurur rrrurruurrr rrruurrrurr`,
      move: [
        [
          [0, 0, 0, -1, 1, 0, -1, 1, 0, -1, 1, 0, 0],
          [-1, 1, -1, 1, 0, 0, 0, 0, -1, 1, -1, 1, -1],
          [-1, 2, -1, 1, -1, 1, 0, 0, -1, 1, 0, -1, 1],
          [0, -1, 1, 0, 0, -1, 1, -1, 1, 0, -1, 1, -1],
          [1, 0, 0, 0, -1, 1, 0, -1, -1, 2, -1, 1, -1],
          [1, -1, 1, -1, 1, 0, -1, 1, -1, 1, 0, 0, -1],
          [1, -1, 1, -1, 1, 0, 0, -3, -1, 1, 3, -1, 1, 0],
        ],
        [
          [0, 0, 0, 0, -1, 1, 0, -1, 1, 0, -1, 1, 0],
          [0, -1, 1, -1, 1, 0, 0, -1, 1, -1, 1, -1, 1],
          [0, 0, 0, -1, 1, 0, 0, 0, 0, 0, 0, 0, -1],
          [-1, 2, -1, 1, -1, 1, -1, 1, -1, 1, 0, -1, 1],
          [0, 0, 0, -1, 1, -1, 1, 0, -1, 1, 0, 0, -1],
          [-1, 2, -1, 1, -1, 1, 0, -1, 1, -1, 1, -1, 1],
          [-1, 1, -1, 1, -1, 1, -1, 1, 0, 0, -1, 1, -1, 1],
        ],
        [
          [0, 0, 0, -1, 1, -1, 1, 0, -1, 1, 0, 0, 0],
          [0, 0, -1, 1, -1, 1, 0, 0, -1, 1, -1, 1, 0],
          [-1, 1, -1, 1, -1, 1, 0, 0, 0, -1, 1, -1, 1],
          [-1, 1, -1, 1, 0, -1, 1, -1, 1, -1, 1, 0, -1],
          [1, 0, 0, 0, 0, -1, 1, 0, 0, -1, 1, -1, 1],
          [0, -1, 1, -1, 1, 0, -1, 1, -1, 1, -1, 1, 0],
          [0, -1, 1, -1, 1, 0, 0, 0, -1, -1, 2, 0, 0, 0],
        ],
        [
          [0, 0, -1, 1, 0, 0, 0, -1, 1, -1, 1, 0, 0],
          [0, 0, 0, -1, 1, -1, 1, 0, 0, -1, 1, 0, 0],
          [0, -1, 1, 0, -1, 1, -1, 1, 0, 0, -1, 1, 0],
          [0, -1, 1, 0, 0, 0, -1, 1, -1, 1, -1, 1, 0],
          [-1, 1, 0, 0, -1, 1, 0, 0, -1, 1, -1, 1, -1],
          [-1, 2, 0, 0, 0, 0, 0, -1, 1, -1, 1, 0, -1],
          [-1, 2, -1, 1, -5, -1, 1, -1, 1, 5, 0, -1, 1, 0],
        ],
      ],
      finish: [
        [
          "Oriel",
          "Christ Church",
          "Keble",
          "Pembroke",
          "Wolfson",
          "University",
          "Magdalen",
          "Wadham",
          "S.E.H.",
          "New College",
          "Trinity",
          "Balliol",
          "Hertford",
        ],
        [
          "St Catherine's",
          "L.M.H.",
          "Mansfield",
          "Lincoln",
          "Worcester",
          "Jesus",
          "Brasenose",
          "Pembroke 2",
          "Queen's",
          "St Hugh's",
          "St John's",
          "Oriel 2",
          "St Anne's",
        ],
        [
          "Exeter",
          "Merton",
          "St Peter's",
          "Corpus Christi",
          "Christ Church 2",
          "New College 2",
          "St Antony's",
          "Somerville",
          "University 2",
          "Wadham 2",
          "Keble 2",
          "Linacre",
          "Balliol 2",
        ],
        [
          "Trinity 2",
          "S.E.H. 2",
          "Magdalen 2",
          "Jesus 2",
          "Wolfson 2",
          "Hertford 2",
          "St Catherine's 2",
          "Osler House",
          "Green Templeton",
          "Brasenose 2",
          "Merton 2",
          "Worcester 2",
          "St Hilda's",
        ],
        [
          "Lincoln 2",
          "St John's 2",
          "Exeter 2",
          "Regent's Park",
          "Wolfson 3",
          "St Peter's 2",
          "Pembroke 3",
          "St Benet's Hall",
          "University 3",
          "Queen's 2",
          "L.M.H. 2",
          "Jesus 3",
          "Mansfield 2",
        ],
        [
          "St Anne's 2",
          "Somerville 2",
          "Wadham 3",
          "Keble 3",
          "Oriel 3",
          "S.E.H. 3",
          "St John's 3",
          "St Hugh's 2",
          "New College 3",
          "Balliol 3",
          "Pembroke 4",
          "Linacre 2",
          "St Antony's 2",
        ],
        [
          "Hertford 3",
          "Jesus 4",
          "University 4",
          "Merton 3",
          "St Hilda's 2",
          "St Catherine's 3",
          "Mansfield 3",
          "Balliol 4",
          "Corpus Christi 2",
          "Keble 4",
          "Lincoln 3",
          "Corpus Christi 3",
          "L.M.H. 3",
          "St Antony's 3",
        ],
      ],
      completed: [
        [true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true],
        [true, true, true, true, true, true, true],
      ],
    };

    const actual = utils.read_ad(data);

    assert.deepEqual(actual, expected);
  });

  it("read_ad() returns a correct intermediate object for Summer Eights (second example).", function () {
    const data = `EIGHTS 2014
 4  6  79   = NDay, NDiv, NCrew
 13  Women's Div I (6.15)
St John's                   0  -1   0   0
Wadham                      0   1   0   0
S.E.H.                      0   0   0   0
Pembroke                   -1   0   1   0
Magdalen                    1   0  -1   0
Balliol                    -1   0   0   0
Christ Church               1   0   0   0
University                  0   0   0   0
Hertford                    0  -1  -1   0
Merton                     -1  -1  -1  -1
Keble                       1   1   0   0
Oriel                      -1   0   1   0
Wolfson                     1   1   1   0
 13  Women's Div II (5.15)
Somerville                  0   0   0   1
Worcester                   0   0   0  -1
St Catherine's             -1  -1  -1  -1
Jesus                       1   0  -1   0
New College                 0   1   1   1
Exeter                     -1  -1  -1  -1
St Anne's                   1   0   1   0
Lincoln                     0   1   0   1
Linacre                    -1   0  -3  -1
Trinity                     1   0   1   0
Mansfield                   0  -1   1   0
Wadham II                   0   1  -1   0
Queen's                    -1  -1  -1  -1
 13  Women's Div III (4.15)
St Hugh's                   1   0   3   1
Corpus Christi              0   1   0   1
St Hilda's                 -1  -1  -1  -1
Brasenose                   1   0   1   0
L.M.H.                      0   1   0   1
St John's II               -1  -1   0   0
Wolfson II                  1   0   1   0
St Antony's                -1   0   0   0
St Peter's                  1   1   0   1
Pembroke II                 0  -1  -1  -1
Christ Church II           -1  -1  -1   0
Linacre II                  1   1   0  -1
Worcester II               -1   0   1   1
 13  Women's Div IV (3.00)
Hertford II                -1  -1  -1  -1
University II               2   1   1   1
Merton II                  -1  -1  -1  -1
Lincoln II                  1   1   0  -1
Green Templeton             0   1   1   1
Magdalen II                 0   0   1   1
Trinity II                  0  -1   0  -1
L.M.H. II                  -1  -1  -2  -1
Oriel II                    1   1   0   1
Lincoln III                -1  -1   1   0
New College II              1   1   0   1
S.E.H. II                  -1  -1  -1   0
Balliol II                  1   1   1   0
 13  Women's Div V (1.45)*
St Catherine's II           0   1   0   1
Regent's Park               0   0   1   0
Worcester III              -1  -1  -1  -1
St Anne's II                1   0   0   0
Brasenose II               -1  -1  -1   0
St John's III               1   1   0  -1
Queen's II                 -1  -1  -1  -1
Green Templeton II          1   1   1   1
Jesus II                    0   1   1   1
Jesus III                   0  -1  -1  -1
University III             -1  -1  -1  -1
Somerville II               1   1   1   0
Pembroke III               -1  -1  -1  -1
 14  Women's Div VI (12.40)*
St Hugh's II                1   1   1   1
Oriel III                  -1  -1  -3  -1
Green Templeton III         1   1   1   1
Keble II                    0   1   1   1
Christ Church III           0  -1   1   0
New College III             0   1  -1   0
Mansfield II               -1   0  -1   0
Corpus Christi II           1   0   3   1
University IV               0  -1   0  -1
Keble III                  -1   0  -1  -1
St Hugh's III               1   1   1   1
University V                0  -1   0   1
St Anne's III              -1   0   0   0
St Peter's II               1   1   1   1
`;

    const expected = {
      set: "Summer Eights",
      small: "Eights",
      gender: "Women",
      result: "",
      year: 2014,
      days: 4,
      divisions: [
        [
          "St John's",
          "Wadham",
          "S.E.H.",
          "Pembroke",
          "Magdalen",
          "Balliol",
          "Christ Church",
          "University",
          "Hertford",
          "Merton",
          "Keble",
          "Oriel",
          "Wolfson",
        ],
        [
          "Somerville",
          "Worcester",
          "St Catherine's",
          "Jesus",
          "New College",
          "Exeter",
          "St Anne's",
          "Lincoln",
          "Linacre",
          "Trinity",
          "Mansfield",
          "Wadham 2",
          "Queen's",
        ],
        [
          "St Hugh's",
          "Corpus Christi",
          "St Hilda's",
          "Brasenose",
          "L.M.H.",
          "St John's 2",
          "Wolfson 2",
          "St Antony's",
          "St Peter's",
          "Pembroke 2",
          "Christ Church 2",
          "Linacre 2",
          "Worcester 2",
        ],
        [
          "Hertford 2",
          "University 2",
          "Merton 2",
          "Lincoln 2",
          "Green Templeton",
          "Magdalen 2",
          "Trinity 2",
          "L.M.H. 2",
          "Oriel 2",
          "Lincoln 3",
          "New College 2",
          "S.E.H. 2",
          "Balliol 2",
        ],
        [
          "St Catherine's 2",
          "Regent's Park",
          "Worcester 3",
          "St Anne's 2",
          "Brasenose 2",
          "St John's 3",
          "Queen's 2",
          "Green Templeton 2",
          "Jesus 2",
          "Jesus 3",
          "University 3",
          "Somerville 2",
          "Pembroke 3",
        ],
        [
          "St Hugh's 2",
          "Oriel 3",
          "Green Templeton 3",
          "Keble 2",
          "Christ Church 3",
          "New College 3",
          "Mansfield 2",
          "Corpus Christi 2",
          "University 4",
          "Keble 3",
          "St Hugh's 3",
          "University 5",
          "St Anne's 3",
          "St Peter's 2",
        ],
      ],
      results: `urururrrur uurruuurr ruuurrruu uuruururr urrurururr ruurruurrr
rururruuu ruuuuurrr uuuuruur ruurururu rrurrururrr rruurrrrrru
rruruo3uur uuuuurru rre1e1e-2rrruurr uurrrrurur ro3uuruurr ruurrrrurrr
ruururruu ruurruurrr rurruuuur ruurrururr urrururrur urrrrrrrrrrrr`,
      move: [
        [
          [0, 0, 0, -1, 1, -1, 1, 0, 0, -1, 1, -1, 1],
          [0, 0, -1, 1, 0, -1, 1, 0, -1, 1, 0, 0, -1],
          [1, 0, -1, 1, 0, -1, 1, -1, 1, 0, -1, 1, -1],
          [-1, 2, -1, 1, 0, 0, 0, -1, 1, -1, 1, -1, 1],
          [0, 0, -1, 1, -1, 1, -1, 1, 0, 0, -1, 1, -1],
          [1, -1, 1, 0, 0, 0, -1, 1, 0, -1, 1, 0, -1, 1],
        ],
        [
          [-1, 1, 0, 0, 0, 0, 0, 0, -1, 1, -1, 1, 0],
          [0, 0, 0, -1, 1, 0, -1, 1, 0, 0, -1, 1, 0],
          [-1, 1, 0, -1, 1, 0, -1, 1, 0, -1, 1, -1, 1],
          [0, -1, 1, -1, 1, 0, -1, 1, -1, 1, -1, 1, -1],
          [1, 0, 0, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1],
          [-1, 1, -1, 1, -1, 1, 0, 0, -1, 1, 0, -1, 1, 0],
        ],
        [
          [0, 0, 0, -1, 1, 0, 0, 0, 0, -1, 1, -1, 1],
          [0, 0, -1, 1, -1, 1, 0, -1, 1, -3, -1, 1, 3],
          [0, -1, 1, 0, -1, 1, 0, 0, 0, 0, -1, 1, -1],
          [1, 0, -1, 1, -1, 1, 0, 0, 0, -2, 1, 1, 0],
          [-1, 1, 0, 0, -1, 1, -1, 1, -1, 1, -1, 1, -1],
          [1, -1, 1, -3, -1, 1, 3, -1, 1, 0, -1, 1, 0, 0],
        ],
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1],
          [1, -1, 1, 0, 0, -1, 1, 0, -1, 1, 0, 0, -1],
          [1, 0, -1, 1, 0, -1, 1, 0, 0, -1, 1, -1, 1],
          [0, -1, 1, -1, 1, -1, 1, -1, 1, 0, 0, -1, 1],
          [0, 0, 0, -1, 1, -1, 1, 0, 0, -1, 1, -1, 1],
          [-1, 1, -1, 1, 0, 0, -1, 1, 0, -1, 1, -1, 1, 0],
        ],
      ],
      finish: [
        [
          "Wadham",
          "St John's",
          "S.E.H.",
          "Pembroke",
          "Magdalen",
          "Christ Church",
          "Balliol",
          "University",
          "Keble",
          "Wolfson",
          "Hertford",
          "Oriel",
          "Somerville",
        ],
        [
          "Merton",
          "New College",
          "Worcester",
          "Jesus",
          "St Anne's",
          "Lincoln",
          "St Catherine's",
          "Trinity",
          "St Hugh's",
          "Exeter",
          "Mansfield",
          "Wadham 2",
          "Corpus Christi",
        ],
        [
          "Linacre",
          "Brasenose",
          "L.M.H.",
          "Queen's",
          "Wolfson 2",
          "St Peter's",
          "St Hilda's",
          "St John's 2",
          "St Antony's",
          "University 2",
          "Linacre 2",
          "Worcester 2",
          "Pembroke 2",
        ],
        [
          "Christ Church 2",
          "Green Templeton",
          "Lincoln 2",
          "Magdalen 2",
          "Hertford 2",
          "Oriel 2",
          "Merton 2",
          "New College 2",
          "Trinity 2",
          "Balliol 2",
          "Lincoln 3",
          "St Catherine's 2",
          "L.M.H. 2",
        ],
        [
          "Regent's Park",
          "S.E.H. 2",
          "St Anne's 2",
          "Green Templeton 2",
          "St John's 3",
          "Jesus 2",
          "Worcester 3",
          "Brasenose 2",
          "Somerville 2",
          "St Hugh's 2",
          "Queen's 2",
          "Green Templeton 3",
          "Jesus 3",
        ],
        [
          "Keble 2",
          "University 3",
          "Corpus Christi 2",
          "Pembroke 3",
          "Christ Church 3",
          "New College 3",
          "St Hugh's 3",
          "Oriel 3",
          "Mansfield 2",
          "St Peter's 2",
          "University 4",
          "University 5",
          "Keble 3",
          "St Anne's 3",
        ],
      ],
      completed: [
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
      ],
    };

    const actual = utils.read_ad(data);

    assert.deepEqual(actual, expected);
  });

  it("read_ad() returns a correct intermediate object for Summer Eights (third example).", function () {
    const data = `EIGHTS 2013
 4  6  79   = NDay, NDiv, NCrew
 13  Women's Div I (6.15)
Pembroke                    0  -1  -1  -1
Wadham                     -1   0   1   0
St John's                   1   1   0   0
Balliol                     0  -1   0  -1
Hertford                   -1  -1  -1  -1
S.E.H.                      1   1   0   1
Christ Church              -1   0   1   0
Magdalen                    1   1   0   1
University                  0   0   0   1
Merton                      0   0  -1   1
Osler House                -1  -1  -1  -1
Keble                       1   0   1  -1
Oriel                       0   1   0   0
 13  Women's Div II (5.15)
Wolfson                     0   0  -1   2
St Catherine's              0  -1  -1   0
New College                -1  -1  -1   0
Somerville                  1   1   2  -1
St Anne's                  -1  -1   0  -1
Worcester                   1   1   1   0
Jesus                       0   1   1   0
Exeter                      0   0   0   1
Lincoln                     0   0   0   0
Linacre                     0  -1   1   0
Mansfield                   0   1  -1  -1
St Hugh's                  -1   0  -1  -1
Trinity                     1   0   0   1
 13  Women's Div III (4.15)
St Hilda's                 -1  -1  -1   0
Queen's                     1   0   1  -1
L.M.H.                     -1  -1   0  -1
Wadham II                   1   1   0   2
Corpus Christi              0   1   1   0
St Peter's                 -1  -1  -1  -1
Brasenose                   1   0   0   1
Christ Church II           -1  -1  -1  -1
Wolfson II                  1   1   0  -1
St John's II                0   1   1   1
St Antony's                 0   0   1   1
Hertford II                 0  -1  -1  -1
Merton II                  -1  -1  -1  -1
 13  Women's Div IV (3.00)
Worcester II               -1   1   1  -1
Pembroke II                 2   1   0   1
Linacre II                  0   0   1   2
University II              -1   1   0   1
Magdalen II                 1  -1  -1  -1
St Hilda's II              -1  -1  -1  -1
Lincoln II                  1   0   1   0
S.E.H. II                   0   1  -6  -1
L.M.H. II                   0  -1   0   1
Trinity II                  0   1   1   0
Balliol II                 -1  -1  -1  -1
Lincoln III                 1   0   0  -1
New College II             -1  -1   0   2
 13  Women's Div V (1.45)*
Green Templeton             1   1   5   1
Oriel II                    0   1   2   1
Regent's Park               0  -1   0   0
St Anne's II               -1  -1   0  -1
St Catherine's II           1   1   0   0
Wadham III                 -1   0  -1  -1
Exeter II                   1   1   0   0
Queen's II                  0  -1  -1  -1
Hertford III               -1  -1  -1  -1
Worcester III               1   1   1   1
Brasenose II                0   1   1   1
University III             -1  -1  -1  -1
St John's III               1   0   1   1
 14  Women's Div VI (12.40)*
Green Templeton II          0   1   0   1
Jesus II                    0   0   1   0
Osler House II             -1   1  -3  -1
Somerville II               1  -1  -1   0
Pembroke III               -1  -1   0   1
St Peter's II               1   0   1   0
Jesus III                   0   1   3   1
Exeter III                  0  -1  -1  -1
Oriel III                  -1  -1  -1   0
Magdalen III                1   1   0  -1
Green Templeton III        -1  -1  -1   1
St Hugh's II                1   1   1   1
St Antony's II             -1   0   1  -1
St John's IV                1   1   1   1
`;

    var expected = {
      set: "Summer Eights",
      small: "Eights",
      gender: "Women",
      result: "",
      year: 2013,
      days: 4,
      divisions: [
        [
          "Pembroke",
          "Wadham",
          "St John's",
          "Balliol",
          "Hertford",
          "S.E.H.",
          "Christ Church",
          "Magdalen",
          "University",
          "Merton",
          "Osler House",
          "Keble",
          "Oriel",
        ],
        [
          "Wolfson",
          "St Catherine's",
          "New College",
          "Somerville",
          "St Anne's",
          "Worcester",
          "Jesus",
          "Exeter",
          "Lincoln",
          "Linacre",
          "Mansfield",
          "St Hugh's",
          "Trinity",
        ],
        [
          "St Hilda's",
          "Queen's",
          "L.M.H.",
          "Wadham 2",
          "Corpus Christi",
          "St Peter's",
          "Brasenose",
          "Christ Church 2",
          "Wolfson 2",
          "St John's 2",
          "St Antony's",
          "Hertford 2",
          "Merton 2",
        ],
        [
          "Worcester 2",
          "Pembroke 2",
          "Linacre 2",
          "University 2",
          "Magdalen 2",
          "St Hilda's 2",
          "Lincoln 2",
          "S.E.H. 2",
          "L.M.H. 2",
          "Trinity 2",
          "Balliol 2",
          "Lincoln 3",
          "New College 2",
        ],
        [
          "Green Templeton",
          "Oriel 2",
          "Regent's Park",
          "St Anne's 2",
          "St Catherine's 2",
          "Wadham 3",
          "Exeter 2",
          "Queen's 2",
          "Hertford 3",
          "Worcester 3",
          "Brasenose 2",
          "University 3",
          "St John's 3",
        ],
        [
          "Green Templeton 2",
          "Jesus 2",
          "Osler House 2",
          "Somerville 2",
          "Pembroke 3",
          "St Peter's 2",
          "Jesus 3",
          "Exeter 3",
          "Oriel 3",
          "Magdalen 3",
          "Green Templeton 3",
          "St Hugh's 2",
          "St Antony's 2",
          "St John's 4",
        ],
      ],
      results: `uuurruurr rururuurrr uurrruuru urrruuruu rurrrrruurr rrurruurur
ruuuururr uruuruuu ruruururu ruruuruur rrrurruuur rurrrruuru
uuurro3uu rruuurrrrrr e2e-1e5rrue-6urur uruurrrurr ururrruuu urururrrur
uruuurrur ruuuurrru uuururuu uuuuurru uurrurrrru uruuruurr`,
      move: [
        [
          [0, -1, 1, 0, -1, 1, -1, 1, 0, 0, -1, 1, 0],
          [0, 0, -1, 1, -1, 1, 0, 0, 0, 0, 0, -1, 1],
          [-1, 1, -1, 1, 0, -1, 1, -1, 1, 0, 0, 0, -1],
          [-1, 2, 0, -1, 1, -1, 1, 0, 0, 0, -1, 1, -1],
          [1, 0, 0, -1, 1, -1, 1, 0, -1, 1, 0, -1, 1],
          [0, 0, -1, 1, -1, 1, 0, 0, -1, 1, -1, 1, -1, 1],
        ],
        [
          [-1, 1, 0, -1, 1, -1, 1, 0, 0, 0, 0, -1, 1],
          [0, -1, 1, -1, 1, -1, 1, 0, 0, -1, 1, 0, 0],
          [0, -1, 1, -1, 1, 0, -1, 1, -1, 1, 0, -1, 1],
          [-1, 1, 0, -1, 1, 0, -1, 1, -1, 1, 0, -1, 1],
          [-1, 1, -1, 1, -1, 1, 0, -1, 1, -1, 1, 0, -1],
          [1, 0, -1, 1, 0, -1, 1, -1, 1, -1, 1, -1, 1, 0],
        ],
        [
          [0, -1, 1, 0, 0, 0, -1, 1, 0, -1, 1, 0, -1],
          [-1, 2, -1, 1, -1, 1, 0, 0, 0, -1, 1, 0, -1],
          [1, 0, -1, 1, 0, 0, 0, -1, 1, -1, 1, 0, -1],
          [1, -1, 1, 0, -1, 1, -6, -1, 1, 0, 0, 5, -1],
          [2, 0, 0, 0, 0, 0, -1, 1, -1, 1, -1, 1, 0],
          [-1, 1, -3, -1, 1, 3, 0, 0, -1, 1, -1, 1, -1, 1],
        ],
        [
          [0, 0, -1, 1, -1, 1, 0, -1, 1, -1, 1, 0, -1],
          [-1, 2, 0, 0, 0, 0, -1, 1, 0, 0, -1, 1, -1],
          [-1, 2, 0, 0, -1, 1, -1, 1, -1, 1, -1, 1, -1],
          [-1, 2, -1, 1, 0, -1, 1, 0, -1, 1, -1, 1, -1],
          [-1, 2, 0, 0, 0, -1, 1, -1, 1, -1, 1, -1, 1],
          [0, -1, 1, 0, 0, -1, 1, -1, 1, -1, 1, 0, -1, 1],
        ],
      ],
      finish: [
        [
          "St John's",
          "Wadham",
          "S.E.H.",
          "Pembroke",
          "Magdalen",
          "Balliol",
          "Christ Church",
          "University",
          "Hertford",
          "Merton",
          "Keble",
          "Oriel",
          "Wolfson",
        ],
        [
          "Somerville",
          "Osler House",
          "Worcester",
          "St Catherine's",
          "Jesus",
          "New College",
          "Exeter",
          "St Anne's",
          "Lincoln",
          "Linacre",
          "Trinity",
          "Mansfield",
          "Wadham 2",
        ],
        [
          "Queen's",
          "St Hugh's",
          "Corpus Christi",
          "St Hilda's",
          "Brasenose",
          "L.M.H.",
          "St John's 2",
          "Wolfson 2",
          "St Antony's",
          "St Peter's",
          "Pembroke 2",
          "Christ Church 2",
          "Linacre 2",
        ],
        [
          "Worcester 2",
          "Hertford 2",
          "University 2",
          "Merton 2",
          "Lincoln 2",
          "Green Templeton",
          "Magdalen 2",
          "Trinity 2",
          "L.M.H. 2",
          "St Hilda's 2",
          "Oriel 2",
          "Lincoln 3",
          "New College 2",
        ],
        [
          "S.E.H. 2",
          "Balliol 2",
          "St Catherine's 2",
          "Regent's Park",
          "Exeter 2",
          "Worcester 3",
          "St Anne's 2",
          "Brasenose 2",
          "Wadham 3",
          "St John's 3",
          "Queen's 2",
          "Green Templeton 2",
          "Hertford 3",
        ],
        [
          "Jesus 2",
          "Jesus 3",
          "University 3",
          "St Peter's 2",
          "Somerville 2",
          "Pembroke 3",
          "Osler House 2",
          "St Hugh's 2",
          "Magdalen 3",
          "St John's 4",
          "Exeter 3",
          "Oriel 3",
          "Green Templeton 3",
          "St Antony's 2",
        ],
      ],
      completed: [
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
        [true, true, true, true, true, true],
      ],
    };

    const actual = utils.read_ad(data);

    assert.deepEqual(actual, expected);
  });

  it("write_flat() returns the correct flat format output.", function () {
    const events = [
      {
        completed: [],
        days: 2,
        divisions: [
          ["Cantabs 1", "City 1"],
          ["Cantabs 2", "City 2"],
          ["Champs 1"],
        ],
        finish: [],
        gender: "M",
        move: [
          [[0, 0], [0, -1], [1]],
          [[0, 0], [0, 0], [0]],
        ],
        result: "",
        results: "r rrr rrr\nr rrr rrr\n",
        set: "Town Bumps",
        small: "Short",
        year: "2013",
      },
    ];

    const expected = `Year,Club,Sex,Day,Crew,Start position,Position,Division
2013,Cantabs,M,1,1,1,1,1
2013,Cantabs,M,2,1,1,1,1
2013,City,M,1,1,2,2,1
2013,City,M,2,1,2,2,1
2013,Cantabs,M,1,2,3,3,2
2013,Cantabs,M,2,2,3,3,2
2013,City,M,1,2,4,5,2
2013,City,M,2,2,4,5,2
2013,Champs,M,1,1,5,4,3
2013,Champs,M,2,1,5,4,3
`;

    const actual = utils.write_flat(events);

    assert.equal(actual, expected);
  });

  it("write_tg() returns the correct Tim Grainger output.", function () {
    const event = {
      completed: [],
      days: 2,
      divisions: [
        ["Cantabs 1", "City 1"],
        ["Cantabs 2", "City 2"],
        ["Champs 1"],
      ],
      finish: [],
      gender: "M",
      move: [
        [[0, 0], [0, -1], [1]],
        [[0, 0], [0, 0], [0]],
      ],
      result: "",
      results: `r ur rrr
r rrr rrr`,
      set: "Town Bumps",
      small: "Short",
      year: "2013",
    };

    const expected = `Set,Town Bumps
Short,Short
Gender,M
Year,2013
Days,2

Division,Cantabs 1,City 1
Division,Cantabs 2,City 2
Division,Champs 1

Results
r ur rrr
r rrr rrr
`;
    const actual = utils.write_tg(event);

    assert.equal(actual, expected);
  });

  it("write_ad() returns the correct Anu Dudhia output.", function () {
    const event = {
      completed: [],
      days: 2,
      divisions: [
        ["Cantabs 1", "City 1"],
        ["Cantabs 2", "City 2"],
        ["Champs 1"],
      ],
      finish: [],
      gender: "Men",
      move: [
        [[0, 0], [0, 0], [0]],
        [[0, 0], [0, -1], [1]],
      ],
      result: "",
      results: `rr rrr
rr rrr
`,
      set: "Summer Eights",
      small: "Short",
      year: "2013",
    };

    const expected = `EIGHTS 2013
 2  3  5   = NDay, NDiv, NCrew
 2  Men's Div I
Cantabs                     0   0
City                        0   0
 2  Men's Div II
Cantabs II                  0   0
City II                     0  -1
 1  Men's Div III
Champs                      0   1
`;

    const actual = utils.write_ad(event);

    assert.equal(actual, expected);
  });

  it("round-trip flat format.", function () {
    const data = `Year,Club,Sex,Day,Crew,Start position,Position,Division
2013,Cantabs,M,1,1,1,1,1
2013,Cantabs,M,2,1,1,1,1
2013,City,M,1,1,2,2,1
2013,City,M,2,1,2,2,1
2013,Cantabs,M,1,2,3,3,2
2013,Cantabs,M,2,2,3,3,2
2013,City,M,1,2,4,5,2
2013,City,M,2,2,4,5,2
2013,Champs,M,1,1,5,4,3
2013,Champs,M,2,1,5,4,3
`;

    const expected = data;
    const actual = utils.write_flat(utils.read_flat(data));

    assert.equal(actual, expected);
  });

  it("round-trip tg format.", function () {
    const data = `Set,Town Bumps
Short,Town
Gender,Men
Year,2016

Division,Cantabs 1,Rob Roy 1,Rob Roy 2,99 1,St Neots 1,City 1,X-Press 1,Cantabs 2,City 2,Cantabs 3,99 2,Chesterton 1,Rob Roy 3,City 3,X-Press 2,Champs 1,99 3
Division,City 4,Cantabs 4,City 5,City 6,Champs 2,St Radegund 1,X-Press 3,Cantabs 5,City 7,X-Press 4,99 4,Rob Roy 4,City 8,St Neots 2,Cantabs 6,Chesterton 2,Champs 3
Division,Cantabs 7,Champs 4,City 9,Isle of Ely 1,Cantabs 8,St Radegund 2,Champs 5,City 10,Champs 6,City 11,Cantabs 9,Cantabs 10,99 5,X-Press 5,99 6,X-Press 6,Cantabs 11
Division,X-Press 7,99 7,Chesterton 3,Cantabs 12,Cantabs 13,Camb Veterans 1,Cantabs 14,City 12,Cantabs 15,X-Press 8

Results
rrrurrru uruuruurrrur urrururrurrru o3urrurrrrrrrrrr
urrurur ruruuruurrur rrruo3uruurur rrrurrurrrrurrr
rrurrrru uuruururuur rrrrruo3uuruu uuurrrrrrrrrrrr
rrurrrur ruruuurrrruu ruruurruurur ruuururrrrurr
`;

    const expected = data;
    const actual = utils.write_tg(utils.read_tg(data));

    assert.equal(actual, expected);
  });

  it("round-trip ad format.", function () {
    const data = `TORPIDS 2016
 4  6  73   = NDay, NDiv, NCrew
 12  Men's Div I
Pembroke                    0   0   0   0
Oriel                       0   0   0   0
Magdalen                    0   0   0   0
Christ Church               0  -1  -1   0
Wolfson                     0   1   0   0
Wadham                      0   0   1   0
Hertford                    0   0   0   0
Trinity                     0  -3   0  -1
St Catherine's              0   1   0   0
Worcester                  -3   0  -1  -1
Balliol                     1   1   0   0
New College                 1   1   0   0
 12  Men's Div II
St John's                   1   0  -1   0
Lincoln                     0  -1  -1  -1
St Anne's                  -1  -1  -1  -1
Pembroke II                 1   1   2   1
S.E.H.                      0   1   1   1
Jesus                       0  -1   0   1
Brasenose                  -1  -1  -2  -1
University                  1   1   1   1
L.M.H.                      0   1   0  -1
Queen's                    -2  -1  -1   0
Merton                      1  -1   1   0
Mansfield                   1   1   1   1
 12  Men's Div III
Somerville                  0   1  -1   0
Christ Church II           -8  -2  -1  -4
Exeter                      1  -1   0   0
Keble                       1   1   2   1
Corpus Christi              1  -1   0  -1
Oriel II                    0  -3  -2  -1
St Peter's                  2   1   0   0
Balliol II                  1   1  -1  -1
Linacre                     1   0   0   1
St Hugh's                   1   2   1   1
New College II             -2  -1  -1  -1
St Antony's                 1   1   1  -1
 12  Men's Div IV
Wadham II                  -1   1   1   1
Wolfson II                  2   1   1   1
St John's II                0  -1  -7   2
Trinity II                 -1  -3   0   0
Jesus II                    1   1   1   1
Hertford II                -1   0   1   0
Green Templeton             1   1   1   2
University II              -3  -1  -1  -2
Keble II                    1   2   1   2
Wadham III                  1   0   2   0
St Catherine's II           1   0   0   0
Brasenose II               -1   0   1   0
 12  Men's Div V
Magdalen II                 1   1   2  -4
Worcester II               -1  -4  -3  -2
Lincoln II                  1   0  -2  -1
Pembroke III               -4  -3  -2  -1
Trinity III                 1   1   1   3
S.E.H. II                   1   1   1   1
Regent's Park               1   1  -1  -3
St Hugh's II                1   1   1   1
St John's III              -4  -4  -1  -1
St Hilda's                  1   1   1   1
Mansfield II               -1  -1  -1   1
Wolfson III                 2   1   1   1
 13  Men's Div VI
Exeter II                  -1   2   1   1
Merton II                   3   1   1   1
L.M.H. II                   0   1   2   1
Balliol III                 0   0   0  -1
Wolfson IV                 -1  -1  -1  -1
St John's IV                1   2   0   0
Keble III                  -1  -1   0   1
St Antony's II              1   1   1   1
Oriel III                  -2  -2   1   1
Christ Church III           0   0   0   0
S.E.H. III                  2   1   1   1
Corpus Christi II           0   1   0  -2
Balliol IV                  0   1  -1   1
`;

    const expected = data;
    const actual = utils.write_ad(utils.read_ad(data));

    assert.equal(actual, expected);
  });

  it("round-trip from flat format to tg format.", function () {
    const data = `Year,Club,Sex,Day,Crew,Start position,Position,Division
2013,Cantabs,M,1,1,1,1,1
2013,Cantabs,M,2,1,1,4,1
2013,Cantabs,M,3,1,1,5,1
2013,City,M,1,1,2,2,1
2013,City,M,2,1,2,3,1
2013,City,M,3,1,2,3,1
2013,Rob Roy,M,1,1,3,3,1
2013,Rob Roy,M,2,1,3,2,1
2013,Rob Roy,M,3,1,3,2,1
2013,99,M,1,1,4,4,1
2013,99,M,2,1,4,1,1
2013,99,M,3,1,4,1,1
2013,Cantabs,M,1,2,5,5,2
2013,Cantabs,M,2,2,5,5,2
2013,Cantabs,M,3,2,5,6,2
2013,City,M,1,2,6,7,2
2013,City,M,2,2,6,6,2
2013,City,M,3,2,6,4,2
2013,Champs,M,1,1,7,6,3
2013,Champs,M,2,1,7,7,3
2013,Champs,M,3,1,7,7,3
`;

    const expected = `Set,Town Bumps
Short,Short
Gender,M
Year,2013
Days,3

Division,Cantabs 1,City 1,Rob Roy 1,99 1
Division,Cantabs 2,City 2
Division,Champs 1

Results
r ur rrrrr
r ur ro3u
r ru urrr
`;

    const actual = utils.write_tg(utils.read_flat(data)[0]);

    assert.equal(actual, expected);
  });

  it("round-trip from tg format to flat format.", function () {
    const data = `Set,Town Bumps
Short,Short
Gender,M
Year,2013
Days,3

Division,Cantabs 1,City 1,Rob Roy 1,99 1
Division,Cantabs 2,City 2
Division,Champs 1

Results
r ur rrrrr
r ur ro3u
r ru urrr
`;

    const expected = `Year,Club,Sex,Day,Crew,Start position,Position,Division
2013,Cantabs,M,1,1,1,1,1
2013,Cantabs,M,2,1,1,4,1
2013,Cantabs,M,3,1,1,5,1
2013,City,M,1,1,2,2,1
2013,City,M,2,1,2,3,1
2013,City,M,3,1,2,3,1
2013,Rob Roy,M,1,1,3,3,1
2013,Rob Roy,M,2,1,3,2,1
2013,Rob Roy,M,3,1,3,2,1
2013,99,M,1,1,4,4,1
2013,99,M,2,1,4,1,1
2013,99,M,3,1,4,1,1
2013,Cantabs,M,1,2,5,5,2
2013,Cantabs,M,2,2,5,5,2
2013,Cantabs,M,3,2,5,6,2
2013,City,M,1,2,6,7,2
2013,City,M,2,2,6,6,2
2013,City,M,3,2,6,4,2
2013,Champs,M,1,1,7,6,3
2013,Champs,M,2,1,7,7,3
2013,Champs,M,3,1,7,7,3
`;

    const actual = utils.write_flat([utils.read_tg(data)]);

    assert.equal(actual, expected);
  });
});
