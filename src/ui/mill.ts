import {axesDRO} from './dro';
import {mdi} from './mdi';
import {messagesPanel} from '../messages/messagesui';
import {createOverridesPanel} from '../machine/override';
import {label, panel, toggleFullscreen} from './ui';
import {navRowClass, tabletTabClass} from './commonStyles';
import {createMenu, MenuItem} from './menu';
import {StatusDialog} from '../dialog/statusdlg';
import {FSDialog} from '../fs/fsdialog';
import {FSType} from '../fs/fs';
import {currentState, homeAll, restart} from '../machine/machine';
import {btnIcon, button} from './button';
import {
  toggleCoolantState,
  toggleCoordinateSystem,
  toggleDistanceMode,
  toggleSpindleState,
  toggleUnits
} from '../machine/modal';
import {toolPathPanel} from './program';
import {createToolTable} from '../machine/tools';
import {Icon} from './icons';
import {sendCommandAndGetStatus, UNLOCK_CMD} from '../http/http';
import {probe} from '../machine/probe';
import {column, row} from './panel';
import {AlertDialog} from '../dialog/alertdlg';
import {MachineUI} from "./machine";

export class MillUI implements MachineUI {

  manualTab(): HTMLElement | null {
    return panel('tablettab', tabletTabClass, [
      millNavPanel(),
      axesDRO(),
      mdi(),
      messagesPanel(),
    ])
  }

  programTab(): HTMLElement | null {
    return panel('tablettab', tabletTabClass, [
      millNavPanel(),
      axesDRO(),
      createOverridesPanel(),
      statusPanel(),
    ])
  }

  toolsTab(): HTMLElement | null {
    return panel('tablettab', tabletTabClass, [
      millNavPanel(),
      axesDRO(),
      mdi(),
      row()
          .overflow("auto")
          .maxWidth("100%")
          .add("2fr", createToolTable())
          .add("3fr", column()
              .add("auto", probe.probeRow())
              .add("1fr", messagesPanel())
          )
          .build()
    ])
  }
}

function millNavPanel(): HTMLElement {
  return panel('', navRowClass, [
    createMenu('dropdown', "Menu", "left", [
      new MenuItem("Status", () => new StatusDialog()),
      new MenuItem("Pins", () => new AlertDialog("Pins", currentState.pins)),
      new MenuItem("Files", () => new FSDialog(FSType.Local)),
      new MenuItem("Homing", homeAll),
      new MenuItem("Restart", restart),
    ]),
    // label('time-of-day', "4:30"),
    label('tool', "T0"),
    label('plane', "XY"),
    button('units', 'mm', 'Switch between mm and Inch modes', toggleUnits),
    button('wpos-label', 'WPos', "Coordinate System", toggleCoordinateSystem),
    button('active-state', "Idle", "Machine State", _ => sendCommandAndGetStatus(UNLOCK_CMD)),
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

function statusPanel(): HTMLElement {
  return row('status')
      .overflow("auto").maxWidth("100%").maxHeight("100%")
      .add("1fr", messagesPanel())
      .add("2fr", toolPathPanel())
      .build()
}
