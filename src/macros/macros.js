var interval_position = -1;
var control_macrolist = [];

function hideAxiscontrols() {
  displayNone('JogBar');
  displayNone('HomeZ');
  displayBlock('CornerZ');
  displayNone('control_z_position_display');
  displayNone('control_zm_position_row');
  displayNone('z_velocity_display');
}

function loadmacrolist() {
  control_macrolist = [];
  var url = "/macrocfg.json";
  SendGetHttp(url, processMacroGetSuccess, processMacroGetFailed);
}

function Macro_build_list(response_text) {
  var response = [];
  try {
    if (response_text.length != 0) {
      response = JSON.parse(response_text);
    }
  } catch (e) {
    console.error("Parsing error:", e);
  }
  for (var i = 0; i < 9; i++) {
    var entry;
    if ((response.length != 0) && (typeof (response[i].text) !== 'undefined'
        && typeof (response[i].glyph) !== 'undefined'
        && typeof (response[i].filename) !== 'undefined'
        && typeof (response[i].target) !== 'undefined'
        && typeof (response[i].class) !== 'undefined'
        && typeof (response[i].index) !== 'undefined')) {
      entry = {
        name: response[i].text,
        glyph: response[i].glyph,
        filename: response[i].filename,
        target: response[i].target,
        class: response[i].class,
        index: response[i].index
      };
    } else {
      entry = {
        name: '',
        glyph: '',
        filename: '',
        target: '',
        class: '',
        index: i
      };
    }
    control_macrolist.push(entry);
  }
  control_build_macro_ui();
}

function processMacroGetSuccess(response) {
  if (response.indexOf("<HTML>") == -1) {
    Macro_build_list(response);
  } else {
    Macro_build_list("");
  }
}

function processMacroGetFailed(errorcode, response) {
  console.log("Error " + errorcode + " : " + response);
  Macro_build_list("");
}

function on_autocheck_position(use_value) {
  if (typeof (use_value) !== 'undefined') {
    id(
        'autocheck_position').checked = use_value;
  }
  if (id('autocheck_position').checked) {
    var interval = parseInt(id('posInterval_check').value);
    if (!isNaN(interval) && interval > 0 && interval < 100) {
      if (interval_position != -1) {
        clearInterval(interval_position);
      }
      interval_position = setInterval(function () {
        get_Position()
      }, interval * 1000);
    } else {
      id('autocheck_position').checked = false;
      id('posInterval_check').value = 0;
      if (interval_position != -1) {
        clearInterval(interval_position);
      }
      interval_position = -1;
    }
  } else {
    if (interval_position != -1) {
      clearInterval(interval_position);
    }
    interval_position = -1;
  }
}

function onPosIntervalChange() {
  var interval = parseInt(id('posInterval_check').value);
  if (!isNaN(interval) && interval > 0 && interval < 100) {
    on_autocheck_position();
  } else {
    id('autocheck_position').checked = false;
    id('posInterval_check').value = 0;
    if (interval != 0) {
      alertdlg(translate("Out of range"),
          translate(
              "Value of auto-check must be between 0s and 99s !!"));
    }
    on_autocheck_position();
  }
}

function get_Position() {
  get_status();
}

function control_motorsOff() {
  SendPrinterCommand("$Motors/Disable");
}

function SendHomecommand(cmd) {
  if (id('lock_UI').checked) {
    return;
  }
  switch (cmd) {
    case 'G28':
      cmd = '$H';
      break;
    case 'G28 X0':
      cmd = '$HX';
      break;
    case 'G28 Y0':
      cmd = '$HY';
      break;

    case 'G28 Z0':
      if (axisCount > 3) {
        cmd = '$H' + id('control_select_axis').value;
      } else {
        cmd = '$HZ';
      }
      break;
    default:
      cmd = '$H';
      break;
  }

  sendCommand(cmd);
}

function SendZerocommand(cmd) {
  sendCommand("G10 L20 P0 " + cmd);
}

function onXYvelocityChange() {
  var feedratevalue = parseInt(id('control_xy_velocity').value);
  if (feedratevalue < 1 || feedratevalue > 9999 || isNaN(feedratevalue)
      || (feedratevalue === null)) {
    //we could display error but we do not
  }
}

function onZvelocityChange() {
  var feedratevalue = parseInt(id('control_z_velocity').value);
  if (feedratevalue < 1 || feedratevalue > 999 || isNaN(feedratevalue)
      || (feedratevalue === null)) {
    //we could display error but we do not
  }
}

function processMacroSave(answer) {
  if (answer == "ok") {
    //console.log("now rebuild list");
    control_build_macro_ui();
  }
}

function control_build_macro_button(index) {
  var content = "";
  var entry = control_macrolist[index];
  content += "<button class='btn fixedbutton " + control_macrolist[index].class
      + "' type='text' ";
  if (entry.glyph.length == 0) {
    content += "style='display:none'";
  }
  content += "onclick='macro_command (\"" + entry.target + "\",\""
      + entry.filename + "\")'";
  content += "><span style='position:relative; top:3px;'>";
  if (entry.glyph.length == 0) {
    content += get_icon_svg("star");
  } else {
    content += get_icon_svg(entry.glyph);
  }
  content += "</span>";
  if (entry.text.length > 0) {
    content += "&nbsp;";
  }
  content += entry.text;
  content += "</button>";

  return content;
}

function control_build_macro_ui() {
  var content = "<div class='tooltip'>";
  content += "<span class='tooltip-text'>Manage macros</span>"
  content += "<button class='btn btn-primary' onclick='showmacrodlg(processMacroSave)'>";
  content += "<span class='badge'>";
  content += "<svg width='1.3em' height='1.2em' viewBox='0 0 1300 1200'>";
  content += "<g transform='translate(50,1200) scale(1, -1)'>";
  content += "<path  fill='currentColor' d='M407 800l131 353q7 19 17.5 19t17.5 -19l129 -353h421q21 0 24 -8.5t-14 -20.5l-342 -249l130 -401q7 -20 -0.5 -25.5t-24.5 6.5l-343 246l-342 -247q-17 -12 -24.5 -6.5t-0.5 25.5l130 400l-347 251q-17 12 -14 20.5t23 8.5h429z'></path>";
  content += "</g>";
  content += "</svg>";
  content += "<svg width='1.3em' height='1.2em' viewBox='0 0 1300 1200'>";
  content += "<g transform='translate(50,1200) scale(1, -1)'>";
  content += "<path  fill='currentColor' d='M1011 1210q19 0 33 -13l153 -153q13 -14 13 -33t-13 -33l-99 -92l-214 214l95 96q13 14 32 14zM1013 800l-615 -614l-214 214l614 614zM317 96l-333 -112l110 335z'></path>";
  content += "</g>";
  content += "</svg>";
  content += "</span>";
  content += "</button>";
  content += "</div>";
  for (var i = 0; i < 9; i++) {
    content += control_build_macro_button(i);
  }
  id('Macro_list').innerHTML = content;
}

function macro_command(target, filename) {
  var cmd = ""
  if (target == "ESP") {
    cmd = "$LocalFS/Run=" + filename;
  } else if (target == "SD") {
    files_print_filename(filename);
  } else if (target == "URI") {
    window.open(filename);
  } else {
    return;
  }
  //console.log(cmd);
  SendPrinterCommand(cmd);
}

const get_status = () => {
  sendRealtimeCmd('\x3f'); // '?'
}
