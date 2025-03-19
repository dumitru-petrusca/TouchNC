import {beep, row} from '../ui/ui';
import {sendCommand} from '../http/http';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate.js';
import {btnIcon, button} from '../ui/button';
import {btnClass} from '../ui/commonStyles';
import {Icon} from '../ui/icons';
import {SelectOption, SelectSetting} from '../config/settings';
import {select} from '../config/settingsui';
import {coordButton, CoordinateButton} from '../dialog/numpad';
import {setCurrentToolOffset} from './tools';
import {setAxisValue} from './machine';

export class Probe {
  private isProbing: boolean = false;
  private probeType: SelectSetting;
  private offsetBtn: CoordinateButton;
  private feedRateBtn: CoordinateButton;
  private maxTravelBtn: CoordinateButton;
  private retractBtn: CoordinateButton;
  private probeStart: HTMLButtonElement;

  constructor() {
    this.probeType = new SelectSetting("Type", "manual", [
      new SelectOption("manual", "TLO Manual", 0),
      new SelectOption("probe", "TLO Probe", 1)
    ]);
    
    const enabled = () => this.probeType.value == "probe";
    this.offsetBtn = coordButton("Offset", 0.01, 0, 10000);
    this.feedRateBtn = coordButton("Feed", 100, 0, 10000).setEnabled(enabled);
    this.maxTravelBtn = coordButton("Travel", 1000, 0, 10000).setEnabled(enabled);
    this.retractBtn = coordButton("Retract", 10, 0, 10000).setEnabled(enabled);
    this.probeStart = button("probeStart", btnIcon(Icon.probe), "", this.startProbeProcess.bind(this));
  }

  private startProbeProcess(_: Event) {
    this.isProbing = true;
    sendCommand(`G38.6 Z-${this.maxTravelBtn.getValue()} F${this.feedRateBtn.getValue()} P${this.offsetBtn.getValue()}`)
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
        sendCommand(`$J=G90 G21 F1000 Z${this.retractBtn.getValue()}`);  // retract the tool
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
    const enabled = () => this.probeType.value == "probe";
    this.probeStart.disabled = !enabled();
    return row()
      .child("3fr", select("probeType", btnClass, this.probeType, (_: string) => {
        this.feedRateBtn.update();
        this.maxTravelBtn.update();
        this.retractBtn.update();
        this.probeStart.disabled = !enabled();
      }))
      .child("3fr", this.offsetBtn.build())
      .child("3fr", this.feedRateBtn.build())
      .child("3fr", this.maxTravelBtn.build())
      .child("3fr", this.retractBtn.build())
      .child("1fr", this.probeStart)
      .build();
  }
}

export const probe = new Probe();
