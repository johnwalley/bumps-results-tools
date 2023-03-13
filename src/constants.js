const GENDER = {
  MEN: "Men",
  WOMEN: "Women",
};

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
];

const SET = {
  EIGHTS: "Summer Eights",
  TORPIDS: "Torpids",
  LENTS: "Lent Bumps",
  MAYS: "May Bumps",
  TOWN: "Town Bumps",
};

const abbrevCamCollege = {
  A: "Addenbrooke's",
  AR: "Anglia Ruskin",
  Ca: "Caius",
  CC: "Corpus Christi",
  CH: "Clare Hall",
  Cl: "Clare",
  Cr: "Christ's",
  CT: "CCAT",
  Cu: "Churchill",
  D: "Downing",
  Dw: "Darwin",
  E: "Emmanuel",
  F: "Fitzwilliam",
  G: "Girton",
  H: "Homerton",
  HH: "Hughes Hall",
  HHL: "Hughes/Lucy",
  J: "Jesus",
  K: "King's",
  L: "LMBC",
  LC: "Lucy Cavendish",
  M: "Magdalene",
  ME: "Murray Edwards",
  N: "Newnham",
  NH: "New Hall",
  Pb: "Pembroke",
  Ph: "Peterhouse",
  Q: "Queens'",
  QM: "QMABC",
  R: "Robinson",
  S: "Selwyn",
  SC: "St Catharine's",
  SE: "St Edmund's",
  SS: "Sidney Sussex",
  T: "1st and 3rd",
  TC: "Theological Colleges",
  TH: "Trinity Hall",
  VS: "Vet School",
  W: "Wolfson",
};

const abbrevOxCollege = {
  B: "Balliol",
  Br: "Brasenose",
  Ch: "Christ Church",
  Co: "Corpus Christi",
  E: "Exeter",
  H: "Hertford",
  J: "Jesus",
  K: "Keble",
  L: "Linacre",
  Lc: "Lincoln",
  LM: "L.M.H.",
  Mg: "Magdalen",
  Mf: "Mansfield",
  Mt: "Merton",
  N: "New College",
  O: "Oriel",
  OG: "Osler-Green",
  P: "Pembroke",
  Q: "Queen's",
  R: "Regent's Park",
  SE: "S.E.H.",
  S: "Somerville",
  SAn: "St Anne's",
  SAt: "St Antony's",
  SB: "St Benet's Hall",
  SC: "St Catherine's",
  SHi: "St Hilda's",
  SHu: "St Hugh's",
  SJ: "St John's",
  SP: "St Peter's",
  T: "Trinity",
  U: "University",
  Wh: "Wadham",
  Wf: "Wolfson",
  Wt: "Worcester",
};

const abbrevCamTown = {
  A: "Addenbrooke's",
  CB: "Camb Blue",
  CV: "Camb Veterans",
  Ct: "Cantabs",
  Cy: "City",
  Ca: "Caius",
  CT: "CCAT",
  Cr: "Christ's",
  Cu: "Churchill",
  CH: "Clare Hall",
  Cl: "Clare",
  CC: "Corpus Christi",
  COT: "Champs",
  Dn: "Domino",
  Dw: "Darwin",
  D: "Downing",
  E: "Emmanuel",
  F: "Fitzwilliam",
  FP: "Free Press",
  G: "Girton",
  H: "Homerton",
  HH: "Hughes Hall",
  Hn: "Hornets",
  I: "Ionica",
  IOE: "Isle of Ely",
  J: "Jesus",
  K: "King's",
  L: "LMBC",
  LC: "Lucy Cavendish",
  LS: "Lady Somerset",
  M: "Magdalene",
  ME: "Maximum Entropy",
  MM: "Mott MacDonald",
  NH: "New Hall",
  N: "Newnham",
  NN: "99",
  Pb: "Pembroke",
  Ph: "Peterhouse",
  QM: "QMABC",
  Q: "Queens'",
  RR: "Rob Roy",
  R: "Robinson",
  Sm: "Simoco",
  SI: "St Ives",
  SN: "St Neots",
  SR: "St Radegund",
  S: "Selwyn",
  SS: "Sidney Sussex",
  SC: "St Catharine's",
  SE: "St Edmund's",
  T: "1st & 3rd",
  TC: "Theological Colleges",
  Te: "Telephones",
  TH: "Trinity Hall",
  US: "Univ Sports",
  VS: "Vet School",
  W: "Wolfson",
  X: "X-Press",
};

module.exports = {
  abbrevCamCollege,
  abbrevCamTown,
  abbrevOxCollege,
  GENDER,
  ROMAN,
  SET,
};