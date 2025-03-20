import {beep, row} from '../ui/ui';
import {sendCommand} from '../http/http';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate.js';
import {btnIcon, button} from '../ui/button';
import {btnClass} from '../ui/commonStyles';
import {Icon} from '../ui/icons';
import {SelectOption, SelectSetting, FloatSetting} from '../config/settings';
import {select} from '../config/settingsui';
import {coordButton, CoordinateButton} from '../dialog/numpad';
import {setCurrentToolOffset} from './tools';
import {setAxisValue} from './machine';
import {preferences, PROBE_TYPE, PROBE_OFFSET, PROBE_FEED, PROBE_MAX_TRAVEL, PROBE_RETRACT} from '../config/preferences';

export class Probe {
  private isProbing: boolean = false;
  private probeType: SelectSetting | null = null;
  private offsetBtn: CoordinateButton | null = null;
  private feedRateBtn: CoordinateButton | null = null;
  private maxTravelBtn: CoordinateButton | null = null;
  private retractBtn: CoordinateButton | null = null;
  private probeStart: HTMLButtonElement | null = null;

  private initializeIfNeeded() {
    if (this.probeType === null) {
      const probeTypeSetting = preferences.getSelect(PROBE_TYPE);
      if (!probeTypeSetting) {
        throw new Error("Probe type setting not found");
      }
      this.probeType = probeTypeSetting;
      
      const enabled = () => this.probeType!.value == "probe";
      
      const offsetSetting = preferences.get(PROBE_OFFSET) as FloatSetting;
      const feedSetting = preferences.get(PROBE_FEED) as FloatSetting;
      const travelSetting = preferences.get(PROBE_MAX_TRAVEL) as FloatSetting;
      const retractSetting = preferences.get(PROBE_RETRACT) as FloatSetting;

      if (!offsetSetting || !feedSetting || !travelSetting || !retractSetting) {
        throw new Error("Required probe settings not found");
      }

      this.offsetBtn = coordButton(offsetSetting);
      this.feedRateBtn = coordButton(feedSetting).setEnabled(enabled);
      this.maxTravelBtn = coordButton(travelSetting).setEnabled(enabled);
      this.retractBtn = coordButton(retractSetting).setEnabled(enabled);
      this.probeStart = button("probeStart", btnIcon(Icon.probe), "", this.startProbeProcess.bind(this));
    }
  }

  private startProbeProcess(_: Event) {
    this.initializeIfNeeded();
    this.isProbing = true;
    sendCommand(`G38.6 Z-${this.maxTravelBtn!.getValueMm()} F${this.feedRateBtn!.getValueMm()} P${this.offsetBtn!.getValueMm()}`)
      .catch(reason => this.error(reason));
  }

  public processProbeResult(response: string) {
    if (this.isProbing) {
      this.isProbing = false;
      const [_, coordsStr, status] = response.split(":").map(s => s.trim());
      if (parseInt(status) == 0) {
        this.error("")
      } else {
        setAxisValue("Z", 0)
        sendCommand(`$J=G90 G21 F1000 Z${this.retractBtn!.getValueMm()}`);  // retract the tool
        let coords = coordsStr.split(",").map(s => parseFloat(s.trim()));
        setCurrentToolOffset(coords[2])
      }
    }
  }

  private error(reason: string) {
    this.isProbing = false;
    new AlertDialog(translate("Error"), reason);
    beep();
  }

  public isCurrentlyProbing(): boolean {
    return this.isProbing;
  }

  public probeRow() {
    this.initializeIfNeeded();
    const enabled = () => this.probeType!.value == "probe";
    this.probeStart!.disabled = !enabled();
    return row()
      .add("3fr", select("probeType", btnClass, this.probeType!, (_: string) => {
        this.feedRateBtn!.update();
        this.maxTravelBtn!.update();
        this.retractBtn!.update();
        this.probeStart!.disabled = !enabled();
      }))
      .add("3fr", this.offsetBtn!.build())
      .add("3fr", this.feedRateBtn!.build())
      .add("3fr", this.maxTravelBtn!.build())
      .add("3fr", this.retractBtn!.build())
      .add("1fr", this.probeStart!)
      .build();
  }
}

// Create the singleton instance
export const probe = new Probe();
