import {Firmware} from '../dialog/connectdlg';
import {getElement, ifPresent, setEnabled, setLabel} from '../ui/ui';
import {FEED_HOLD_CMD, FEED_RESUME_CMD, GET_PARSER_STATE_CMD, HOME_CMD, RESET_CMD, sendCommand, sendCommandAndGetStatus, sendHttpRequest, UNLOCK_CMD} from '../http/http';
import {isProbing} from './probe';
import {Icon, svgIcon} from '../ui/icons';
import {Coordinate, positionChannel, progressChannel, restartChannel, State, stateChannel, tabSelectChannel, unitChannel} from '../events/eventbus';
import {getButtonValueAsString} from '../ui/button';
import {currentModal, decimals, factor} from './modal';
import {arraysEqual} from '../common';
import {ConfirmDialog} from '../dialog/confirmdlg';
import {translate} from '../translate';
import {machineSettings} from '../config/machinesettings';

export const LATHE = "LATHE"
export const MILL = "MILL"

export let axisNames = ['x', 'y', 'z', 'a', 'b', 'c'];
export let axisCount = 3;
export let machine = MILL;
export let machineBboxAsked = false;
export let xMaxTravel = Infinity, yMaxTravel = Infinity
export let xHomePos = Infinity, yHomePos = Infinity
export let xHomeDir = Infinity, yHomeDir = Infinity
export let currentState: State = new State();
let startTime = 0;

export function setMachineProperties(firmware: Firmware) {
  machine = firmware.machine
  axisCount = firmware.axes
  axisNames = axisNames.slice(0, axisCount)
}

export function getAxisValue(axis: string): number {
  axis = axis.toLowerCase()
  for (let i = 0; i < axisNames.length; i++) {
    if (axisNames[i] == axis) {
      return currentState.wpos[i];
    }
  }
  throw "No such axis " + axis
}

export const setAxisValue = (axis: string, coordinate: number) => {
  sendCommandAndGetStatus('G10 L20 P0 ' + axis + coordinate);
}

export const gotoAxisValue = (axis: string, coordinate: number) => {
  // Always force G90 mode because synchronization of modal reports is unreliable
  // For controllers that permit it, specifying mode and move in one block is safer
  sendCommandAndGetStatus('G90 G0 ' + axis + coordinate);
}

export function lockAxis(e: Event) {
  sendCommandAndGetStatus('$TL' + getButtonValueAsString(e));
}

export function restart() {
  new ConfirmDialog(translate("Restart FluidNC"), () => {
    restartChannel.sendEvent()
    sendHttpRequest("/command?plain=" + encodeURIComponent("[ESP444]RESTART"));
  });
}

export const reset = () => stopAndRecover();
export const unlock = () => sendCommandAndGetStatus(UNLOCK_CMD);
export const homeAll = () => sendCommandAndGetStatus(HOME_CMD);
export const requestModes = () => sendCommandAndGetStatus(GET_PARSER_STATE_CMD);

export const stopAndRecover = () => {
  sendCommand(RESET_CMD);
  if (isProbing) {
    // probe_failed_notification('Probe Canceled'); //TODO(dp) function is missing
  }
  // To stop FluidNC you send a reset character, which causes some modes
  // be reset to their default values.  In particular, it sets G21 mode,
  // which affects the coordinate display and the jog distances.
  requestModes();
};

export const askMachineBbox = () => {
  if (machineBboxAsked) {
    return;
  }
  askAxis("$/axes/x/homing/mpos_mm");
  askAxis("$/axes/x/homing/positive_direction");
  askAxis("$/axes/x/max_travel_mm");

  askAxis("$/axes/y/homing/mpos_mm");
  askAxis("$/axes/y/homing/positive_direction");
  askAxis("$/axes/y/max_travel_mm");

  machineBboxAsked = true;
}

const askAxis = (name: string) => {
  sendHttpRequest("/command?plain=" + encodeURIComponent(name))
      .then(processSettingRead)
      .catch(reason => console.log("Error " + reason))
}

export function processSettingRead(result: string) {
  const [name, value] = result.split('=');
  if (!value) {
    return;
  }
  switch (name) {
    case '$/axes/x/max_travel_mm':
      xMaxTravel = parseFloat(value);
      return;
    case '$/axes/y/max_travel_mm':
      yMaxTravel = parseFloat(value);
      return;
    case '$/axes/x/homing/mpos_mm':
      xHomePos = parseFloat(value);
      return;
    case '$/axes/y/homing/mpos_mm':
      yHomePos = parseFloat(value);
      return;
    case '$/axes/x/homing/positive_direction':
      xHomeDir = value == "true" ? 1 : -1;
      return;
    case '$/axes/y/homing/positive_direction':
      yHomeDir = value == "true" ? 1 : -1;
      return;
  }
}

export const pauseGCode = () => {
  sendCommand(FEED_HOLD_CMD); // '!'
};

export const resumeGCode = () => {
  sendCommand(FEED_RESUME_CMD); // '~'
};

export class Coordinate2 {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export function wposToXYZ(state: State): Coordinate {
  return new Coordinate(state.wpos[0], state.wpos[1], state.wpos[2])
}

function updateOverrides(state: State, force: boolean = false) {
  if (state.ovr.feed != currentState.ovr.feed || force) {
    setLabel('feed-ovr', "Feed / " + state.ovr.feed + '%');
  }
  if (state.ovr.spindle != currentState.ovr.spindle || force) {
    setLabel('spindle-ovr', "RPM / " + state.ovr.spindle + '%');
  }
}

export const processMachineState = (response: string) => {
  const state: State = structuredClone(currentState)
  response.substring(1, response.length - 2).split('|').forEach(field => {
    const [tag, value] = field.split(':');
    if (tag === "Door") {
      state.name = "Door" + value;
      state.message = field;
    } else if (tag === "Hold") {
      state.name = tag;
      state.message = field;
    } else if (tag === "Run" || tag === "Jog" || tag === "Home") {
      state.name = tag;
    } else if (tag === "Idle" || tag === "Alarm" || tag === "Check" || tag === "Sleep") {
      state.name = tag;
    } else if (tag === "Ln") {
      state.lineNumber = parseInt(value);
    } else if (tag === "MPos") {
      state.mpos = value.split(',').map((v) => parseFloat(v));
      state.wpos = state.mpos.map((v, index) => v - currentState.wco[index]);
    } else if (tag === "WPos") {
      state.wpos = value.split(',').map((v) => parseFloat(v));
      state.mpos = state.wpos.map((v, index) => v + currentState.wco[index]);
    } else if (tag === "WCO") {
      state.wco = value.split(',').map((v) => parseFloat(v));
    } else if (tag === "FS") {
      const fsRates = value.split(',');
      state.feedRate = parseFloat(fsRates[0]);
      state.spindleSpeed = parseInt(fsRates[1]);
    } else if (tag === "Ov") {
      handleOverrides(value, state);
    } else if (tag === "A") {
      handleArray(value, state);
    } else if (tag === "SD") {
      handleSD(value, state);
    } else if (tag === "Pn") {
      state.pins = value;
    } else if (tag === "MPG") {
      state.mpgs = parseInt(value);
    } else if (tag === "RPM") {
      state.lathe_rpm = parseFloat(value);
    }
  });
  updateState(state);
}

function updateState(state: State, force: boolean = false) {
  updateEnabled(state, force);
  updateMPGs(state, force);
  updateStateName(state, force)
  updateOverrides(state, force)
  updateLathe(state, force);
  updatePositions(state, force);
  updateGCode(state, force);
  updateTime();

  let positionEvent = !arraysEqual(state.wpos, currentState.wpos) || force;
  let stateEvent = state.name != currentState.name || force;
  let progressEvent = state.sdPercent != currentState.sdPercent || force;

  currentState = state;

  if (positionEvent) {
    positionChannel.sendEvent()
  }
  if (stateEvent) {
    stateChannel.sendEvent()
  }
  if (progressEvent) {
    progressChannel.sendEvent()
  }
}

function handleArray(array: string, state: State) {
  state.spindleDirection = 'M5';
  Array.from(array).forEach(v => {
    switch (v) {
      case 'S':
        state.spindleDirection = 'M3';
        break;
      case 'C':
        state.spindleDirection = 'M4';
        break;
      case 'F':
        state.flood = true;
        break;
      case 'M':
        state.mist = true;
        break;
    }
  });
}

function handleOverrides(overrides: string, state: State) {
  const ovRates = overrides.split(',');
  state.ovr.feed = parseInt(ovRates[0])
  state.ovr.rapid = parseInt(ovRates[1])
  state.ovr.spindle = parseInt(ovRates[2])
}

function handleSD(value: string, state: State) {
  const sdInfo = value.split(',');
  state.sdPercent = parseFloat(sdInfo[0]);
  state.sdName = sdInfo[1];
  if (state.name == "Idle") {
    state.name = "Run";
  }
}

function updateStateName(state: State, force: boolean = false) {
  if (currentState.name != state.name || currentState.feedRate != state.feedRate ||
      currentState.spindleSpeed != state.spindleSpeed || currentState.spindleDirection != state.spindleDirection || force) {
    let stateName = state.name
    if (stateName == "Idle") {
      stateName = "Manual";
    } else if (stateName == 'Run') {
      const rateNumber = currentModal.units == 'G21' ? Number(state.feedRate).toFixed(0) : Number(state.feedRate / 25.4).toFixed(2);
      const rateText = rateNumber + (currentModal.units == 'G21' ? ' mm/min' : ' in/min');
      stateName = rateText + " " + state.spindleSpeed + " " + spindleDirText(state);
    }
    setLabel('active-state', stateName);
  }
}

function updateTime() {
  const now = new Date();
  setLabel('time-of-day', now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
  if (currentState.name == 'Run') {
    let elapsed = now.getTime() - startTime;
    if (elapsed < 0) {
      elapsed = 0;
    }
    let seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    setLabel('runtime', minutes + ':' + seconds);
  } else {
    startTime = now.getTime();
  }
}

function spindleDirText(state: State) {
  switch (state.spindleDirection) {
    case 'M3':
      return 'CW';
    case 'M4':
      return 'CCW';
    case 'M5':
      return 'Off';
  }
}

function updateMPGs(state: State, force: boolean = false) {
  if (state.mpgs != currentState.mpgs || force) {
    for (let i = 0; i < axisCount; i++) {
      let axis = axisNames[i];
      ifPresent(`lock-${axis}`, btn => {
        let mpgEnabled = machineSettings.isConfigured(`/axes/${axis}/mpg/a_pin`);
        let mpgUnlocked = state.mpgs & (1 << i);
        let iconColor = mpgEnabled ? (mpgUnlocked ? "black" : "red") : "darkgray";
        let icon = mpgEnabled ? (mpgUnlocked ? Icon.lockOpen : Icon.lockClosed) : Icon.lockClosed;
        (btn as HTMLButtonElement).replaceChildren(svgIcon(icon, "1em", "1em", iconColor));
        (btn as HTMLButtonElement).disabled = !mpgEnabled;
      })
    }
  }
}

function setEnabledAll(id: string, enabled: boolean) {
  document.querySelectorAll(`#${id} *`).forEach(e => {
    if (e.tagName === "INPUT" || e.tagName === "BUTTON" || e.tagName === "SELECT" || e.tagName === "TEXTAREA") {
      (e as any).disabled = !enabled;
    }
  });
}

function updateEnabled(state: State, force: boolean = false) {
  const running1 = currentState.name == 'Run' || currentState.name == 'Hold';
  const running2 = state.name == 'Run' || state.name == 'Hold';
  if (currentState.name == "" || running1 != running2 || force) {
    ifPresent("units", _ => {
      setEnabledAll("axis-position", !running2);
      setEnabledAll("mdi", !running2);
      setEnabledAll("tool-table", !running2);
      setEnabledAll('ovr-controls', running2);
      setEnabled('units', !running2);
      setEnabled('wpos-label', !running2);
      setEnabled('distance', !running2);
      setEnabled('spindle', !running2);
      setEnabled('open-gcode-file', !running2);
    })
  }
}

export function updatePositions(state: State, force: boolean = false) {
  const digits = decimals();
  let f = factor()
  state.wpos.forEach((pos, index) => {
    if (index < axisCount && (pos != currentState.wpos[index] || force)) {
      setLabel(`wpos-${axisNames[index]}`, Number(pos * f).toFixed(index > 2 ? 2 : digits));
    }
  });
  state.mpos?.forEach((pos, index) => {
    if (index < axisCount && (pos != currentState.mpos[index] || force)) {
      setLabel('mpos-' + axisNames[index], Number(pos * f).toFixed(index > 2 ? 2 : digits));
    }
  });
}

function updateLathe(state: State, force: boolean = false) {
  if (machine === LATHE && (currentState.lathe_rpm != state.lathe_rpm || force)) {
    setLabel("lathe-rpm", state.lathe_rpm.toFixed(0) + " rpm");
  }
}

function updateGCode(state: State, force: boolean = false) {
  if (currentState.lineNumber != state.lineNumber || force) {
    setLabel('line', "" + state.lineNumber);
  }
}

unitChannel.register(_ => updatePositions(currentState, true))
tabSelectChannel.register(_ => updateState(currentState, true), "machine", 0)