import {GET_STARTUP_LOG, sendCommand} from '../http/http';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate';

export function checkStartupMessage() {
  sendCommand(GET_STARTUP_LOG);
  // setTimeout(waitForStartupMessage, 100);
}

let Monitor_output = ""

function Monitor_output_Update(message: string) {
  Monitor_output += message

  // if (message) {
  //   if (typeof message === 'string' || message instanceof String) {
  //     Monitor_output = Monitor_output.concat(message);
  //   } else {
  //     try {
  //       var msg = JSON.stringify(message, null, " ");
  //       Monitor_output = Monitor_output.concat(msg + "\n");
  //     } catch (err) {
  //       Monitor_output = Monitor_output.concat(message.toString() + "\n");
  //     }
  //   }
  //   Monitor_output = Monitor_output.slice(-300);
  // }

  const verbose = true;
  let output = "";
  for (let out of Monitor_output) {
    const outlc = out.trim();

    // Filter the output to remove boring chatter
    if (outlc === "") {
      continue;
    }
    if (!verbose) {
      if (outlc == "wait" ||
          outlc.startsWith("ok") ||
          outlc.startsWith("[#]") ||
          outlc.startsWith("x:") ||
          outlc.startsWith("fr:") ||
          outlc.startsWith("echo:") ||
          outlc.startsWith("Config:") ||
          outlc.startsWith("echo:Unknown command: \"echo\"") ||
          outlc.startsWith("echo:enqueueing \"*\"")
      ) {
        continue;
      }
      //no status
      if (outlc.startsWith("<") || outlc.startsWith("[echo:")) continue;
    }
    if (out.startsWith("[#]")) {
      out = out.replace("[#]", "");
    }
    out = out.replace("&", "&amp;");
    out = out.replace("<", "&lt;");
    out = out.replace(">", "&gt;");
    if (out.startsWith("ALARM:") || out.startsWith("Hold:") || out.startsWith("Door:")) {
      out = "<font color='orange'><b>" + out + translate(out.trim()) + "</b></font>\n";
    }
    if (out.startsWith("error:")) {
      out = "<font color='red'><b>" + out.toUpperCase() + translate(out.trim()) + "</b></font>\n";
    } else if (out.startsWith("[MSG:ERR")) {
      out = "[<font color='red'>MSG:ERR</font>" + out.substring(8);
    } else if (out.startsWith("[MSG:WARN")) {
      out = "[<font color='orange'>MSG:WARN:</font>" + out.substring(9);
    } else if (out.startsWith("[MSG:INFO")) {
      out = "[<font color='green'>MSG:INFO</font>" + out.substring(9);
    }
    output += out;
  }

/*
  const old_output = id("cmd_content").innerHTML;
  id("cmd_content").innerHTML = output;
  // Do not autoscroll if the contents have not changed.
  // This prevents scrolling on filtered-out status reports.
  if (output != old_output) {
    Monitor_check_autoscroll();
  }
*/
}

function waitForStartupMessage() {
  let versionPos = -1;
  for (let i = 0; i < Monitor_output.length; i++) {
    if (Monitor_output[i].startsWith("[MSG:INFO: FluidNC")) {
      versionPos = i;
      break;
    }
  }
  if (versionPos < 0) {
    // wait for startup message
    setTimeout(waitForStartupMessage, 100);
    return;
  }
  let endPos = Monitor_output.indexOf("ok\n", versionPos);
  if (endPos < 0) {
    endPos = Monitor_output.indexOf("<Alarm", versionPos);
    if (endPos < 0) {
      // wait to complete startup message
      setTimeout(waitForStartupMessage, 100);
      return;
    }
  }

  let errorOrWarning = false;
  for (let i = 0; i < endPos; i++) {
    if (Monitor_output[i].startsWith("[MSG:ERR") || Monitor_output[i].startsWith("[MSG:WARN")) {
      errorOrWarning = true;
      break;
    }
  }

  if (errorOrWarning) {
    let body = "<br/>";
    for (let i = 0; i < endPos; i++) {
      if (Monitor_output[i].startsWith("[MSG:ERR")) {
        body += "<span style='color: red'>" + Monitor_output[i] + "</span><br/>\n";
      } else if (Monitor_output[i].startsWith("[MSG:WARN")) {
        body += "<span style='color: orange'>" + Monitor_output[i] + "</span><br/>\n";
      } else if (Monitor_output[i].startsWith("[MSG:")) {
        body += "<span>" + Monitor_output[i] + "</span><br/>\n";
      }
    }

    new AlertDialog("Config File Error<br>Fix it or FluidNC will not work", body);
  }
}
