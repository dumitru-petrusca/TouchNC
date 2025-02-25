import {GET_STATUS_CMD, sendCommand} from './http';
import {preferences, ReportType} from '../config/preferences';

export class Reporting {
  type = ReportType.NONE;
  intervalMs: number = 0;
  pollingInterval: NodeJS.Timeout | null = null;

  start() {
    this.type = preferences.reportType();
    this.intervalMs = preferences.reportInterval()
    console.log("Enable reporting: " + this.type + ", " + this.intervalMs)

    // disableReporting()
    if (this.intervalMs <= 0) {
      return
    }
    switch (this.type) {
      case ReportType.POLLING:
        this.pollingInterval = setInterval(() => sendCommand(GET_STATUS_CMD), this.intervalMs);
        break;
      case ReportType.AUTO:
        sendCommand("$Report/Interval=" + this.intervalMs);
        break;
    }
  }

  disableReporting() {
    switch (this.type) {
      case ReportType.POLLING:
        if (this.pollingInterval != null) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
        break;
      case ReportType.AUTO:
        sendCommand("$Report/Interval=0");
        break;
    }
    this.type = ReportType.NONE;
  }

}

export let reporting = new Reporting()