export class LinePos {
  line: string;
  pos: number;

  constructor(line: string) {
    this.line = line;  // If non-empty, the parameter is named
    this.pos = 0;      // Valid if name is empty
  }
}

export class Modal2 {
  // Motion Mode
  // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
  motion = 'G0'

  // Coordinate System Select
  // G54, G55, G56, G57, G58, G59
  wcs = 'G54'

  // Plane Select
  // G17: XY-plane, G18: ZX-plane, G19: YZ-plane
  plane = 'G17'

  // Units Mode
  // G20: Inches, G21: Millimeters
  units = 'G21'

  // Distance Mode
  // G90: Absolute, G91: Relative
  distance = 'G90'

  // Arc IJK distance mode
  arc = 'G91.1'

  // Feed Rate Mode
  // G93: Inverse time mode, G94: Units per minute mode, G95: Units per rev mode
  feedMode = 'G94'

  // Tool Length Offset
  // G43.1, G49
  tlo = 'G49'

  // Program Mode
  // M0, M1, M2, M30
  program = 'M0'

  // Spingle State
  // M3, M4, M5
  spindle = 'M5'

  // Coolant State
  // M7, M8, M9
  coolant = 'M9' // 'M7', 'M8', 'M7,M8', or 'M9'

  // Tool Select
  tool = 0

  // Cutter Radius Compensation
  cutter = 'G40'
}

export class ParsedLine {
  line = ""
  words: Word[] = []
  lineNumber = -1
  checksum = -1
  err = false

  constructor(line: string) {
    this.line = line;
  }

  partitionByGroup(): Word[][] {
    const groups: Word[][] = [];

    for (let i = 0; i < this.words.length; ++i) {
      const word = this.words[i];
      if (word.letter == 'G' || word.letter == 'M' || word.letter == 'T') {
        groups.push([word]);
      } else {
        if (groups.length == 0) {
          groups.push([word]);
        } else {
          groups[groups.length - 1].push(word);
        }
      }
    }

    return groups;
  };
}

export class Word {
  letter: string;
  value: number;

  constructor(letter: string, value: number) {
    this.letter = letter;
    this.value = value;
  }
}

/**
 * Returns an object composed of arrays of property names and values.
 * fromPairs([['a', 1], ['b', 2]])  =>  { 'a': 1, 'b': 2 }
 */
export const fromPairs = (pairs: Word[]): any => {
  let index = -1;
  const result: any = {};

  while (++index < pairs.length) {
    const pair = pairs[index];
    result[pair.letter] = pair.value;
  }

  return result;
};
