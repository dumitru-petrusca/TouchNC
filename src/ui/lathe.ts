import {label, panel, spacer, toggleFullscreen} from './ui';
import {btnIcon, button} from './button';
import {homeAll, restart} from '../machine/machine';
import {EventHandler} from '../common';
import {css, cssClass, navRowClass} from './commonStyles';
import {sendCommandAndGetStatus} from '../http/http';
import {axisJogPanel} from '../machine/jog';
import {toggleCoolantState, toggleCoordinateSystem, toggleDistanceMode, toggleSpindleState, toggleUnits} from '../machine/modal';
import {createMenu, MenuItem} from './menu';
import {FSDialog} from '../dialog/fsdialog';
import {FSType} from '../dialog/fs';
import {StatusDialog} from '../dialog/statusdlg';
import {MachineUI} from './mill';
import {axesDRO} from './dro';
import {messagesPanel} from '../messages/messagesui';
import {Icon} from './icons';
import {mdi} from './mdi';
import {floatButton} from '../dialog/numpad';
import {FloatSetting} from '../config/settings';

let min = new FloatSetting("Min", 0, -1e6, 1e6)
let max = new FloatSetting("Max", 0, -1e6, 1e6)
let pitch = new FloatSetting("Pitch", 0, 0, 1e6)

export class LatheUI implements MachineUI {
  manualTab(): HTMLElement | null {
    return panel('tablettab', latheTabClass, [
      latheNavPanel(),
      axesDRO(),
      axisJogPanel('X'),
      latheControls(),
      mdi(),
      messagesPanel(),
    ])
  }

  programTab(): HTMLElement | null {
    return null
  }

  toolsTab(): HTMLElement | null {
    return null;
  }
}

export function latheControls() {
  return panel('lathe_rpm', latheRowClass, [
    button('', "\u25C0", 'Cut Left', doCutMove(min.value)),
    spacer(1),
    button('', "\u25B6", "Cut Right", doCutMove(max.value)),
    spacer(1),

    button('', "\u25C0\u25C0", 'Rapid Left', doRapidMove(min.value)),
    spacer(1),
    button('', "\u25B6\u25B6", "Rapid Right", doRapidMove(max.value)),
    spacer(1),

    floatButton("lathe", min),
    floatButton("lathe", max),
    floatButton('lathe', pitch),
    label('lathe-rpm', '70 rpm'),
  ]);
}

export function latheNavPanel() {
  return panel('', navRowClass, [
    createMenu('dropdown', "Menu", "left", [
      new MenuItem("Status", () => new StatusDialog()),
      new MenuItem("Files", () => new FSDialog(FSType.Local)),
      new MenuItem("Homing", homeAll),
      // new MenuItem("Reset", reset),
      new MenuItem("Restart", restart),
    ]),
    // label('time-of-day', "4:30"),
    label('tool', "T0"),
    label('plane', "XY"),
    button('units', 'mm', 'Switch between mm and Inch modes', toggleUnits),
    button('wpos-label', 'WPos', "Coordinate System", toggleCoordinateSystem),
    label('active-state', "Idle"),
    button('distance', "ABS", "Distance Mode", toggleDistanceMode),
    button('spindle', btnIcon(Icon.spindleOff), "Spindle", toggleSpindleState),
    button('coolant', btnIcon(Icon.coolantOff), "Coolant", toggleCoolantState),
    button('btn-start', btnIcon(Icon.play), 'Start or Resume Program'),
    button('btn-pause', btnIcon(Icon.pause), 'Pause or Stop Program'),
    // label('line', 'info', "0"),
    // label('runtime', 'info', "12:23"),
    button('fullscreen', btnIcon(Icon.fullscreen), 'Toggle Fullscreen', toggleFullscreen),
  ])
}

function doCutMove(x: number | undefined): EventHandler {
  return _ => sendCommandAndGetStatus(`F${pitch.value} G32 X${x}`)
}

function doRapidMove(x: number | undefined): EventHandler {
  return _ => sendCommandAndGetStatus(`G0 X${x}`)
}

const latheRowClass = cssClass("latheRow", css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 2fr 2fr 2fr 2fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

export const latheTabClass = cssClass("latheTab", css`
  display: grid;
  grid-template-rows: auto auto auto auto auto 1fr;
  gap: 10px;
  text-align: center;
  background-color: #ffffff;
  font-family: sans-serif;
  font-size: 3.2rem;
  user-select: none;

  padding-top: 10px;
  padding-bottom: 10px;

  width: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
`)
