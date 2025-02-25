import {LinePos, Word, ParsedLine, fromPairs} from './types';
import {Toolpath} from './toolpath';

// http://reprap.org/wiki/G-code#Special_fields
// The checksum "cs" for a GCode string "cmd" (including its line number) is computed
// by exor-ing the bytes in the string up to and not including the * character.
const computeChecksum = (s: string) => {
  s = s || '';
  if (s.lastIndexOf('*') >= 0) {
    s = s.substr(0, s.lastIndexOf('*'));
  }

  let cs = 0;
  for (let i = 0; i < s.length; ++i) {
    const c = s[i].charCodeAt(0);
    cs ^= c;
  }
  return cs;
};

// http://linuxcnc.org/docs/html/gcode/overview.html#gcode:comments
// Comments can be embedded in a line using parentheses () or for the remainder of a line
// using a semi-colon. The semi-colon is not treated as the start of a comment when enclosed
// in parentheses.
const stripComments = (line: string) => {
  const re1 = new RegExp(/\s*\([^\)]*\)/g); // Remove anything inside the parentheses
  const re2 = new RegExp(/\s*;.*/g); // Remove anything after a semi-colon to the end of the line, including preceding spaces
  const re3 = new RegExp(/\s+/g);
  return line.replace(re1, '').replace(re2, '').replace(re3, '');
};

// @param {string} line The G-code line
export function parseLine(line: string, toolpath: Toolpath) {
  const parsedLine = new ParsedLine(line)
  line = stripComments(line);
  const linePos = new LinePos(line);

  if (linePos.line.length > 0 && linePos.line[0] == '$') {
    return parsedLine;
  }

  // GCode
  for (linePos.pos = 0; linePos.pos < linePos.line.length;) {
    const letter = linePos.line[linePos.pos++].toUpperCase();

    if (letter == '#') {
      //TODO-dp
      // const status = assign_param(s);
      console.error("OOPS, we cannot handle #")
      continue;
    }

    //TODO-dp
    // const value = read_number(s, false);
    const value = readFloat(linePos);
    if (isNaN(value)) {
      console.error("Bad GCode number: " + linePos.line);
      continue;
    }

    // N: Line number
    if (letter == 'N' && parsedLine.lineNumber == -1) {
      parsedLine.lineNumber = value;
      continue;
    }

    // *: Checksum
    if (letter == '*' && parsedLine.checksum == -1) {
      parsedLine.checksum = value;
      continue;
    }

    parsedLine.words.push(new Word(letter, value));
  }

  if (parsedLine.checksum != -1 && computeChecksum(line) != parsedLine.checksum) {
    console.error("SHIT, GCode checksum failed: " + line)
    parsedLine.err = true; // checksum failed
  }

  //TODO-dp
  // perform_assignments();

  interpret(parsedLine, toolpath);
}

function interpret(parsedLine: ParsedLine, toolpath: Toolpath) {
  for (const group of parsedLine.partitionByGroup()) {
    const pair = group[0] || [];
    const l = pair.letter;
    const v = pair.value;
    let cmd = '';
    let args = {};

    if (l == 'G') {
      cmd = l + v;
      args = fromPairs(group.slice(1));
      if (v == 0 || v == 1 || v == 2 || v == 3 || v == 38.2 || v == 38.3 || v == 38.4 || v == 38.5) {
        toolpath.motionMode = cmd;
      } else if (v == 80) {
        toolpath.motionMode = '';
      }
    } else if (l == 'M') {
      cmd = "" + (l + v);
      args = fromPairs(group.slice(1));
    } else if (l == 'T') { // T1 ; w/o M6
      cmd = l;
      args = v;
    } else if (l == 'F') { // F750 ; w/o motion command
      cmd = l;
      args = v;
    } else if (l == 'X' || l == 'Y' || l == 'Z' || l == 'A' || l == 'B' || l == 'C' || l == 'I' || l == 'J' || l == 'K' || l == 'P') {
      // Use previous motion command if the line does not start with G-code or M-code.
      cmd = toolpath.motionMode;
      args = fromPairs(group);
    }

    if (cmd != "") {
      let handlers = toolpath.handlers as any;
      if (typeof handlers[cmd] == 'function') {
        handlers[cmd](args);
      } else {
        console.log("no handler for: " + parsedLine.line)
      }
    }
  }
}

function readFloat(s: LinePos) {
  const re = /[+-]?[\d\.]*/
  const tail = s.line.substr(s.pos)
  const num = tail.match(re)![0]
  s.pos += num.length
  return Number(num)
}
