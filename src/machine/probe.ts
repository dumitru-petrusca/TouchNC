import {beep, getElement, ifPresent, setDisplay} from '../ui/ui';
import {sendCommand} from '../http/http';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate.js';

export let isProbing = false;
let spindleSpeedSetTimeout: NodeJS.Timeout;

export const processProbeResult = (response: string) => {
  const split = response.split(":");
  if (split.length > 2) {
    const status = parseInt(split[2].replace("]", "").trim());
    if (isProbing) {
      finalize_probing(status);
    }
  }
}

const finalize_probing = (status: number) => {
  if (status != 0) {
    const cmd = "$J=G90 G21 F1000 Z" + (parseFloat(getValue('probetouchplatethickness')) + parseFloat(getValue('proberetract')));
    sendCommand(cmd);
  } else {
    new AlertDialog(translate("Error"), translate("Error"));
    beep();
  }

  isProbing = false;
  setClickability('probingbtn', true);
  setClickability('probingtext', false);
  setClickability('sd_pause_btn', false);
  setClickability('sd_resume_btn', false);
  setClickability('sd_reset_btn', false);
}

const setClickability = (element: string, visible: boolean) => {
  setDisplay(element, visible ? 'table-row' : 'none');
}

const onprobemaxtravelChange = () => {
  const travel = parseFloat(getValue('probemaxtravel'));
  if (travel > 9999 || travel <= 0 || isNaN(travel) || (travel === null)) {
    new AlertDialog(translate("Out of range"), translate("Value of maximum probe travel must be between 1 mm and 9999 mm !"));
    return false;
  }
  return true;
}

const onprobefeedrateChange = () => {
  const feedratevalue = parseInt(getValue('probefeedrate'));
  if (feedratevalue <= 0 || feedratevalue > 9999 || isNaN(feedratevalue) || (feedratevalue === null)) {
    new AlertDialog(translate("Out of range"), translate("Value of probe feedrate must be between 1 mm/min and 9999 mm/min !"));
    return false
  }
  return true;
}

const onproberetractChange = () => {
  const thickness = parseFloat(getValue('proberetract'));
  if (thickness < 0 || thickness > 999 || isNaN(thickness) || (thickness === null)) {
    new AlertDialog(translate("Out of range"), translate("Value of probe retract must be between 0 mm and 9999 mm !"));
    return false;
  }
  return true;
}

const onprobetouchplatethicknessChange = () => {
  const thickness = parseFloat(getValue('probetouchplatethickness'));
  if (thickness < 0 || thickness > 999 || isNaN(thickness) || (thickness === null)) {
    new AlertDialog(translate("Out of range"), translate("Value of probe touch plate thickness must be between 0 mm and 9999 mm !"));
    return false;
  }
  return true;
}

const StartProbeProcess = () => {
  // G38.6 is FluidNC-specific.  It is like G38.2 except that the units
  // are always G21 units, i.e. mm in the usual case, and distance is
  // always incremental.  This avoids problems with probing when in G20
  // inches mode and undoing a preexisting G91 incremental mode
  if (!onprobemaxtravelChange() ||
      !onprobefeedrateChange() ||
      !onproberetractChange() ||
      !onprobetouchplatethicknessChange()) {
    return;
  }
  isProbing = true;
  let cmd = "G38.6 Z-" + parseFloat(getValue('probemaxtravel')) + ' F' + parseInt(getValue('probefeedrate')) + ' P' + getValue('probetouchplatethickness');
  sendCommand(cmd).catch(reason => {
    finalize_probing(0);
    new AlertDialog(translate("Error"), reason);
    beep();
  });
  setClickability('probingbtn', false);
  setClickability('probingtext', true);
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

const setProbeDetected = (state: boolean) => {
  const color = state ? "green" : "grey";
  const glyph = state ? "ok-circle" : "record";
  // setHTML("touch_status_icon", svgIcon(glyph, "1.3em", "1.3em", color));
}

function getValue(name: string) {
  return (getElement(name) as any).value;
}

function setHTML(name: string, val: string) {
  ifPresent(name, e => e.innerHTML = val);
}
