import {beep, panel} from '../ui/ui';
import {sendCommand} from '../http/http';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate.js';
import {btnIcon, button} from '../ui/button';
import {css, cssClass} from '../ui/commonStyles';
import {floatButton} from '../dialog/numpad';
import {Icon} from '../ui/icons';
import {FloatSetting} from '../config/settings';

export let isProbing = false;
let maxTravel = new FloatSetting("Travel", 1000, 0, 10000)
let feedRate = new FloatSetting("Feed", 100, 0, 10000)
let touchPlateThickness = new FloatSetting("Offset", 10.0, 0, 10000)
let retract = new FloatSetting("Retract", 10, 0, 10000)
let spindleSpeedSetTimeout: NodeJS.Timeout;

export function probeLine(): HTMLDivElement {
  return panel("", probeLineClass, [
    floatButton("probe", feedRate),
    floatButton("probe", maxTravel),
    floatButton("probe", touchPlateThickness),
    floatButton("probe", retract),
    button("", btnIcon(Icon.probe), "", startProbeProcess)
  ])
}

// export function probePanel(): HTMLDivElement {
//   let children = [label("", "Probing", settingsPaneTitleClass)]
//
//   children.push(label("", "Feed Rate", settingsLabelClass))
//   children.push(numpadButton("", "", "" + feedRate, NumpadType.INTEGER, v => {
//     feedRate = Number(v)
//   }))
//
//   children.push(label("", "Probe Height", settingsLabelClass))
//   children.push(numpadButton("", "", "" + touchPlateThickness, NumpadType.FLOAT, v => {
//     touchPlateThickness = Number(v)
//   }))
//
//   children.push(label("", "Max Travel", settingsLabelClass))
//   children.push(numpadButton("", "", "" + maxTravel, NumpadType.FLOAT, v => {
//     maxTravel = Number(v)
//   }))
//
//   children.push(button("", "Start Probe", "", startProbeProcess, "", startProbeClass))
//
//   let list = panel("", settingsListClass, children);
//   return panel("", settingsPaneClass, list)
// }

const probeLineClass = cssClass("probeLine", css`
  display: grid;
  grid-template-columns: 3fr 3fr 3fr 3fr 1fr;
  gap: 10px;
  height: 100%;
  font-size: 25px;
  overflow: auto;
`)

const startProbeProcess = (_: Event) => {
  for (let styleSheet of document.styleSheets) {
    let cssRule = styleSheet.cssRules[0] as CSSStyleRule;
    console.log(cssRule.selectorText)
  }

  // G38.6 is FluidNC-specific.  It is like G38.2 except that the units
  // are always G21 units, i.e. mm in the usual case, and distance is
  // always incremental.  This avoids problems with probing when in G20
  // inches mode and undoing a preexisting G91 incremental mode
  isProbing = true;
  sendCommand(`G38.6 Z-${maxTravel.value} F${feedRate.value} P${touchPlateThickness.value}`)
      .catch(reason => finalizeProbing(0, reason));
}

export const processProbeResult = (response: string) => {
  const split = response.split(":");
  if (split.length > 2) {
    const status = parseInt(split[2].replace("]", "").trim());
    if (isProbing) {
      finalizeProbing(status, "");
    }
  }
}

const finalizeProbing = (status: number, reason: any) => {
  if (status != 0) {
    sendCommand(`$J=G90 G21 F1000 Z${touchPlateThickness.value}${retract.value}`);
  } else {
    new AlertDialog(translate("Error"), reason);
    beep();
  }
  isProbing = false;
}

const setSpindleSpeed = (speed: number) => {
  if (spindleSpeedSetTimeout != null) {
    clearTimeout(spindleSpeedSetTimeout)
  }
  if (speed >= 1) {
    let spindleTabSpindleSpeed = speed
    spindleSpeedSetTimeout = setTimeout(() => sendCommand('S' + spindleTabSpindleSpeed), 500)
  }
}

const probePanelClass = cssClass("probePanel", css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 10px;
  height: 100%;
  font-size: 30px;
`)
