import {axesDRO} from './dro';
import {mdi} from './mdi';
import {messagesPanel} from '../messages/messagesui';
import {createOverridesPanel} from '../machine/override';
import {column, label, panel, panel3, row, toggleFullscreen} from './ui';
import {css, cssClass, navRowClass, tabletTabClass} from './commonStyles';
import {createMenu, MenuItem} from './menu';
import {StatusDialog} from '../dialog/statusdlg';
import {FSDialog} from '../dialog/fsdialog';
import {FSType} from '../dialog/fs';
import {homeAll, restart} from '../machine/machine';
import {btnIcon, button} from './button';
import {toggleCoolantState, toggleCoordinateSystem, toggleDistanceMode, toggleSpindleState, toggleUnits} from '../machine/modal';
import {toolPathPanel} from './program';
import {createToolTable} from '../machine/tools';
import {Icon} from './icons';
import {sendCommandAndGetStatus, UNLOCK_CMD} from '../http/http';
import {probeRow} from '../machine/probe';

export interface MachineUI {
  manualTab(): HTMLElement | null;

  programTab(): HTMLElement | null;

  toolsTab(): HTMLElement | null;
}

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
          .child("2fr", createToolTable())
          .child("3fr", column()
              .child("auto", probeRow())
              .child("1fr", messagesPanel())
          )
          .build()
    ])
  }
}

const toolProbeClass = cssClass("toolProbe", css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
`)

function millNavPanel() {
  return panel('', navRowClass, [
    createMenu('dropdown', "Menu", "left", [
      new MenuItem("Status", () => new StatusDialog()),
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
  return panel('status', statusRowClass, [
    messagesPanel(),
    toolPathPanel(),
  ]);
}

const statusRowClass = cssClass("statusRow", css`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
`)