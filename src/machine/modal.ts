import {setLabel} from '../ui/ui';
import {setButtonIcon, setButtonText} from '../ui/button';
import {GET_PARSER_STATE_CMD, sendCommand, sendCommandAndGetStatus} from '../http/http';
import {tabSelectChannel, toolChannel, unitChannel, UnitEvent} from '../events/eventbus';
import {Icon} from '../ui/icons';

const MM = 'G21';
const INCH = 'G20';

export class ModalType {
  tool = 0
  feedRate = 0
  spindleSpeed = 0

  motion: '' | 'G80' | 'G0' | 'G1' | 'G2' | 'G3' | 'G38.1' | 'G38.2' | 'G38.3' | 'G38.4' = ''
  wcs: 'G54' | 'G55' | 'G56' | 'G57' | 'G58' | 'G59' = 'G54'
  plane: 'G17' | 'G18' | 'G19' = 'G17'
  units: 'G20' | 'G21' = MM
  distance: 'G90' | 'G91' = 'G90'
  feed: '' | 'G93' | 'G94' = ''
  program: '' | 'M0' | 'M1' | 'M2' | 'M30' = ''
  spindle: 'M3' | 'M4' | 'M5' = 'M5'
  mist: 'M7' | 'M9' = 'M9'
  flood: 'M8' | 'M9' = 'M9'
  parking: '' | 'M56' = ''
}

const modalModes = [
  {
    name: 'motion',
    values: ['G80', 'G0', 'G1', 'G2', 'G3', 'G38.1', 'G38.2', 'G38.3', 'G38.4']
  },
  {name: 'wcs', values: ['G54', 'G55', 'G56', 'G57', 'G58', 'G59']},
  {name: 'plane', values: ['G17', 'G18', 'G19']},
  {name: 'units', values: [INCH, MM]},
  {name: 'distance', values: ['G90', 'G91']},
  {name: 'feed', values: ['G93', 'G94']},
  {name: 'program', values: ['M0', 'M1', 'M2', 'M30']},
  {name: 'spindle', values: ['M3', 'M4', 'M5']},
  {name: 'mist', values: ['M7']},  // Also M9, handled separately
  {name: 'flood', values: ['M8']}, // Also M9, handled separately
  {name: 'parking', values: ['M56']}
];

let spindleModeNames = new Map<string, Icon>([
  ['M3', Icon.spindleCw],
  ['M4', Icon.spindleCcw],
  ['M5', Icon.spindleOff],
])

let planeNames = new Map<string, string>([
  ['G17', 'XY'],
  ['G18', 'XZ'],
  ['G19', 'YZ'],
])

export let currentModal = new ModalType()
export let oldModal = new ModalType()

export const processModal = (msg: string) => {
  let modal = structuredClone(currentModal)
  modal.parking = '';  // Otherwise there is no way to turn it off
  modal.program = '';  // Otherwise there is no way to turn it off
  msg.replace('[GC:', '').replace(']', '').split(' ').forEach((mode) => {
    if (mode == 'M9') {
      modal.flood = mode;
      modal.mist = mode;
    } else if (mode.charAt(0) === 'T') {
      modal.tool = Number(mode.substring(1));
    } else if (mode.charAt(0) === 'F') {
      modal.feedRate = Number(mode.substring(1));
    } else if (mode.charAt(0) === 'S') {
      modal.spindleSpeed = Number(mode.substring(1));
    } else {
      modalModes.forEach((modalMode) => {
        if (modalMode.values.find(v => v == mode) != undefined) {
          (modal as any)[modalMode.name] = mode;
        }
      });
    }
  });

  oldModal = currentModal
  currentModal = modal;
  updateModes();

  if (oldModal.units != currentModal.units) {
    unitChannel.sendEvent(new UnitEvent(currentModal.units))
  }
  if (oldModal.tool != currentModal.tool) {
    toolChannel.sendEvent()
  }
}

const updateModes = () => {
  setLabel('tool', 'T' + currentModal.tool)
  setLabel('plane', planeNames.get(currentModal.plane) || '')
  setButtonText('units', currentModal.units == MM ? 'mm' : 'in')
  setButtonText('wpos-label', currentModal.wcs);
  setButtonText('distance', currentModal.distance == 'G90' ? 'ABS' : 'INC');
  setButtonIcon('spindle', spindleModeNames.get(currentModal.spindle)!);
  setButtonIcon('coolant', getCoolantIcon());
};

function getCoolantIcon() {
  let icon = Icon.coolantOff
  if (currentModal.mist == 'M7') {
    icon = Icon.coolantOn
  } else if (currentModal.flood == 'M8') {
    icon = Icon.coolantOn
  }
  return icon
}

export const isInchMode = () => currentModal.units == INCH;
export const isMmMode = () => currentModal.units == MM;
export const currentToMm = (x: number): number => isInchMode() ? x * 25.4 : x;
export const mmToCurrent = (x: number): number => isInchMode() ? x / 25.4 : x;
export const mmToDisplay = (x: number): string => mmToCurrent(x).toFixed(isInchMode() ? 3 : 2);

export const toggleUnits = () => {
  sendCommandAndGetStatus(currentModal.units == MM ? INCH : MM);
  // The button label will be fixed by the response to $G
  sendCommand(GET_PARSER_STATE_CMD);
}

export function toggleDistanceMode() {
  sendCommand(currentModal.distance == "G90" ? 'G91' : 'G90')
}

export function toggleSpindleState() {
  sendCommand(['M3', "M4"].includes(currentModal.spindle) ? 'M5' : 'M3')
}

export function toggleCoolantState() {
  sendCommand(currentModal.mist == 'M7' || currentModal.flood == 'M8' ? 'M9' : 'M7')
}

function rotateCoordinateSystem(): string {
  if (currentModal.wcs == 'G54') return 'G55';
  if (currentModal.wcs == 'G55') return 'G56';
  if (currentModal.wcs == 'G56') return 'G57';
  if (currentModal.wcs == 'G57') return 'G58';
  if (currentModal.wcs == 'G58') return 'G59';
  return 'G54';
}

export function toggleCoordinateSystem() {
  sendCommand(rotateCoordinateSystem())
}

tabSelectChannel.register(updateModes, "modal", 0)