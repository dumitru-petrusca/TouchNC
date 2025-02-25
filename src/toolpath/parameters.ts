// Copyright (c) 2024 - Mitch Bradley
// Use of this source code is governed by a GPLv3 license that can be found in the LICENSE file.

import {expression, read_unary} from './expression';
import {LinePos} from './types';

let assignments: any[][] = [];
let named_params = new Map();
// We do not implement predefined parameters because they exist in the
// context of the controller to which we do not have direct access.
// Our primary purpose is visualization of a GCode program and predefined
// parameters are usually not applicable to that.
// Unused system parameter code is in system_parameters.src
let user_params = new Map();

const ngc_param_is_rw = (id: number) => {
  return true;
}

class ParamRef {
  id: number;
  name: string;
  text: string;

  constructor(name = '', text = "", id = 0) {
    this.name = name;  // If non-empty, the parameter is named
    this.text = text;  // If non-empty, the parameter is named
    this.id = id;      // Valid if name is empty
  }
}

const set_numberered_param = (id: number, value: any) => {
  if (id >= 1 && id <= 5000) {
    return user_params.set(id, value);
  }
  return false;
}
const get_numberered_param = (id: number) => {
  if (id >= 1 && id <= 5000) {
    let value = user_params.get(id)
    return (value == undefined) ? NaN : value;
  }
  return NaN;
}

const get_system_param = (name: string) => NaN;
const get_config_item = (name: string) => NaN;
const set_config_item = (name: string, value: any) => {
}

const isAlpha = (c: string) => {
  return c.toLowerCase() != c.toUpperCase();
}

function get_numbered_param(id: number) {

}

const get_param = (param_ref: ParamRef) => {
  if (param_ref.text.length) {
    if (param_ref.text.startsWith('/')) {
      return get_config_item(param_ref.text);
    }
    if (param_ref.text.startsWith('_')) {
      const result = get_system_param(param_ref.text);
      if (!isNaN(result)) {
        return result;
      }
    }
    return named_params.get(param_ref.text);
  }
  return get_numbered_param(param_ref.id);
}

const read_float = (s: LinePos) => {
  const re = /[+-]?[\d\.]*/
  const tail = s.line.substr(s.pos)
  const num = tail.match(re)![0]
  s.pos += num.length
  return Number(num)
}

const get_param_ref = (s: LinePos, param_ref: ParamRef) => {
  // Entry condition - the previous character was #
  let c = s.line[s.pos];

  // c is the first character and *pos still points to it
  switch (c) {
    case '#':
      // Indirection resulting in param number
      let next_param_ref = new ParamRef()
      s.pos++;
      if (!get_param_ref(s, next_param_ref)) {
        return false;
      }
      param_ref.id = get_param(next_param_ref)
      return !isNaN(param_ref.id)
    case '<':
      // Named parameter
      s.pos++;
      while (s.pos < s.line.length) {
        c = s.line[s.pos++]
        if (c == '>') {
          return true
        }
        param_ref.name += c;
      }
      return false;
    case '[':
      // Expression evaluating to param number
      s.pos++;
      param_ref.id = expression(s)
      return !isNaN(param_ref.id)
    default:
      // Param number
      param_ref.id = read_float(s)
      return !isNaN(param_ref.id)
  }
}

function set_numbered_param(id: number, value: any) {

}

const set_param = (param_ref: ParamRef, value: any) => {
  if (param_ref.text.length) {
    if (param_ref.text.startsWith('/')) {
      set_config_item(param_ref.text, value);
      return;
    }
    named_params.set(param_ref.text, value);
    return;
  }

  if (ngc_param_is_rw(param_ref.id)) {
    set_numbered_param(param_ref.id, value);
  }
}

// Gets a numeric value, either a literal number or a #-prefixed parameter value
// Return NaN on error
export const read_number = (s: LinePos, in_expression: boolean): number => {
  let c = s.line[s.pos];
  if (c == '#') {
    s.pos++;
    let param_ref = new ParamRef();
    if (!get_param_ref(s, param_ref)) {
      return NaN;
    }
    return get_param(param_ref);
  }
  if (c == '[') {
    return expression(s);
  }
  if (in_expression) {
    if (isAlpha(c)) {
      return read_unary(s)
    }
    if (c == '-') {
      s.pos++;
      return -read_number(s, in_expression);
    }
    if (c == '+') {
      s.pos++;
      return read_number(s, in_expression);
    }
  }
  return read_float(s);
}

// Process a #PREF=value assignment, with the initial # already consumed
export const assign_param = (s: LinePos) => {
  let param_ref = new ParamRef();

  if (!get_param_ref(s, param_ref)) {
    return false;
  }
  if (s.line[s.pos] != '=') {
    console.debug('Missing =');
    return false;
  }
  s.pos++;

  let value = read_number(s, false)
  if (isNaN(value)) {
    console.debug('Missing value');
    return false;
  }
  assignments.push([param_ref, value]);

  return true;
}

export const perform_assignments = () => {
  for (const [ref, value] of assignments) {
    set_param(ref, value);
  }
  assignments = [];
}
