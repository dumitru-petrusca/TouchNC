import {beep, row} from '../ui/ui';
import {sendCommand} from '../http/http';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate.js';
import {btnIcon, button} from '../ui/button';
import {btnClass} from '../ui/commonStyles';
import {Icon} from '../ui/icons';
import {SelectOption, SelectSetting} from '../config/settings';
import {select} from '../config/settingsui';
import {coordButton} from '../dialog/numpad';
import {setCurrentToolOffset} from './tools';
import {setAxisValue} from './machine';

export let isProbing = false;

const startProbeProcess = (_: Event) => {
  // G38.6 is FluidNC-specific.  It is like G38.2 except that the units
  // are always G21 units, i.e. mm in the usual case, and distance is
  // always incremental.  This avoids problems with probing when in G20
  // inches mode and undoing a preexisting G91 incremental mode
  isProbing = true;
  sendCommand(`G38.6 Z-${maxTravelBtn.getValue()} F${feedRateBtn.getValue()} P${offsetBtn.getValue()}`)
      .catch(reason => error(reason));
}

// [PRB: 151.000,149.000,-137.505 : 1]
export const processProbeResult = (response: string) => {
  if (isProbing) {
    isProbing = false;
    const [_, coordsStr, status] = response.split(":").map(s => s.trim());
    if (parseInt(status) == 0) {
      error("")
    } else {
      setAxisValue("Z", 0)
      sendCommand(`$J=G90 G21 F1000 Z${retractBtn.getValue()}`);  // retract the tool
      let coords = coordsStr.split(",").map(s => parseFloat(s.trim()));
      setCurrentToolOffset(coords[2])
    }
  }
}

function error(reason: string) {
  isProbing = false
  new AlertDialog(translate("Error"), reason);
  beep();
}

let probeType = new SelectSetting("Type", "manual", [new SelectOption("manual", "TLO Manual", 0), new SelectOption("probe", "TLO Probe", 1)])
let enabled = () => probeType.value == "probe";
let offsetBtn = coordButton("Offset", 0.01, 0, 10000);
let feedRateBtn = coordButton("Feed", 100, 0, 10000).setEnabled(enabled);
let maxTravelBtn = coordButton("Travel", 1000, 0, 10000).setEnabled(enabled);
let retractBtn = coordButton("Retract", 10, 0, 10000).setEnabled(enabled);
let probeStart = button("probeStart", btnIcon(Icon.probe), "", startProbeProcess);

export function probeRow() {
  probeStart.disabled = !enabled()
  return row()
      .child("3fr", select("probeType", btnClass, probeType, (_: string) => {
        feedRateBtn.update()
        maxTravelBtn.update()
        retractBtn.update()
        probeStart.disabled = !enabled()
      }))
      .child("3fr", offsetBtn.build())
      .child("3fr", feedRateBtn.build())
      .child("3fr", maxTravelBtn.build())
      .child("3fr", retractBtn.build())
      .child("1fr", probeStart)
      .build()
}
