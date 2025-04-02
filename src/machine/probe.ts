import {beep} from '../ui/ui';
import {sendCommand} from '../http/http';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate.js';
import {btnIcon, button} from '../ui/button';
import {btnClass} from '../ui/commonStyles';
import {Icon} from '../ui/icons';
import {SelectSetting} from '../config/settings';
import {select} from '../config/settingsui';
import {setCurrentToolOffset} from './tools';
import {getAxisMachinePosition, setAxisPosition} from './machine';
import {preferences, PROBE_FEED, PROBE_MAX_TRAVEL, PROBE_OFFSET, PROBE_RETRACT, PROBE_TYPE} from '../config/preferences';
import {mmToCurrent} from './modal';
import {row} from '../ui/panel';
import {coordButton, CoordinateButton} from '../ui/coordinateButton';

/**
 * The Probe class manages tool length offset measurement through either manual input or automated probing.
 *
 * It provides a UI row with controls for:
 * - Selecting between manual and probe modes
 * - Setting probe parameters (offset, feed rate, travel distance, retract distance)
 * - Initiating the probing sequence
 *
 * Manual Mode:
 * - Used when there is no probe
 * - The operator manually moves Z to touch the workpiece (typically using a feeler gauge)
 * - When Z is at the touch point, clicking the probe button will:
 *   1. Set the current Z position to zero
 *   2. Apply the offset value as the tool length offset
 *
 * Probe Mode:
 * When in probe mode, it executes a probing cycle that:
 * 1. Moves the Z-axis down at the specified feed rate until contact is made
 * 2. Records the contact position
 * 3. Retracts the tool to a safe distance
 * 4. Updates the current tool's offset based on the probe result
 */
export class Probe {
  private isProbing: boolean = false;
  private probeType?: SelectSetting;
  private offsetBtn?: CoordinateButton;
  private feedRateBtn?: CoordinateButton;
  private maxTravelBtn?: CoordinateButton;
  private retractBtn?: CoordinateButton;
  private probeStart?: HTMLButtonElement;

  private initializeIfNeeded() {
    if (this.probeType === undefined) {
      this.probeType = preferences.getSelect(PROBE_TYPE);
      const isProbeMode = () => this.probeType!.getValue() == "probe";
      this.offsetBtn = coordButton(preferences.floatSetting(PROBE_OFFSET), Icon.height);
      this.feedRateBtn = coordButton(preferences.floatSetting(PROBE_FEED), Icon.running).setEnabled(isProbeMode);
      this.maxTravelBtn = coordButton(preferences.floatSetting(PROBE_MAX_TRAVEL), Icon.arrowRange).setEnabled(isProbeMode);
      this.retractBtn = coordButton(preferences.floatSetting(PROBE_RETRACT), Icon.alightTop).setEnabled(isProbeMode);
      this.probeStart = button("probeStart", btnIcon(Icon.alightBottom), "", this.startProbeProcess.bind(this));
    }
  }

  private startProbeProcess(_: Event) {
    this.initializeIfNeeded();
    let zOffset = this.offsetBtn!.getValue();
    if (this.probeType!.getValue() === "probe") {
      this.isProbing = true;
      sendCommand(`G38.6 Z-${this.maxTravelBtn!.getValue()} F${this.feedRateBtn!.getValue()} P${zOffset}`)
          .catch(reason => this.error(reason));
    } else {
      // Manual probing mode - operator has already positioned Z at touch point
      setCurrentToolOffset(getAxisMachinePosition('Z'));  // Apply the offset in mm
      setAxisPosition("Z", mmToCurrent(zOffset)); // the axis is at the probe offset
      // sendCommand(`$J=G90 G21 F1000 Z${this.retractBtn!.getValue()}`);  // retract the tool
    }
  }

  public processProbeResult(response: string) {
    if (this.isProbing) {
      this.isProbing = false;
      const [_, coordsStr, status] = response.split(":").map(s => s.trim());
      if (parseInt(status) == 0) {
        this.error("")
      } else {
        let coords = coordsStr.split(",").map(s => parseFloat(s.trim()));
        setCurrentToolOffset(coords[2])
        setAxisPosition("Z", 0)
        sendCommand(`$J=G90 G21 F1000 Z${this.retractBtn!.getValue()}`);  // retract the tool
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
    return row()
        .add("3fr", select("probeType", btnClass, this.probeType!, (_: string) => {
          this.feedRateBtn!.update();
          this.maxTravelBtn!.update();
          this.retractBtn!.update();
        }))
        .add("3fr", this.offsetBtn!.build())
        .add("3fr", this.feedRateBtn!.build())
        .add("3fr", this.maxTravelBtn!.build())
        .add("3fr", this.retractBtn!.build())
        .add("1fr", this.probeStart!)
        .build();
  }
}

export const probe = new Probe();
