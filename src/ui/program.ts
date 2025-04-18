import {FSFile, FSType} from '../fs/fs';
import {GCodeFile, messageChannel, positionChannel, stateChannel} from '../events/eventbus';
import {element, label, panel, setLabel} from './ui';
import {display} from '../toolpath/display';
import {currentState, pauseGCode, resumeGCode, reset, unlock, wposToXYZ} from '../machine/machine';
import {serverUrl, sendCommandAndGetStatus} from '../http/http';
import {button, setButton} from './button';
import {Icon, svgIcon} from './icons';
import {FSDialog} from '../fs/fsdialog';
import {css, cssClass, floatingButtonClass} from './commonStyles';

let gCodeFile: GCodeFile | undefined = undefined;

export const loadGCodeFile = (file: FSFile) => {
  gCodeFile = new GCodeFile(file);
  if (!gCodeFile.canDisplay()) {
    showGCode()
    return
  }
  setLabel('filename', file.path);
  let t1 = new Date().getTime()
  fetch(serverUrl(`/SD${file.path}`))
      .then(response => response.text())
      .then(gcode => {
        console.log("Leaded file in " + (new Date().getTime() - t1) / 1000.0 + "sec")
        positionChannel.register(_ => display.drawTool(wposToXYZ(currentState)))
        gCodeFile!.content = gcode;
        showGCode()
      });
};

const showGCode = () => {
  // setTextArea('gcode', gcode);
  if (gCodeFile!.canDisplay()) {
    display.setGcodeFile(gCodeFile!)
    display.showToolPath(wposToXYZ(currentState));
  } else {
    setLabel('filename', gCodeFile!.path + " (too large to show)");
    display.clear();
  }
  updateRunButtons();
};

export function updateRunButtons() {
  switch (currentState.name) {
    case 'Idle':
      let gCodeLoaded = gCodeFile != null && gCodeFile.content != '';
      setButton('btn-start', gCodeLoaded, Icon.play, runGCode);
      setButton('btn-pause', false, Icon.pause);
      break;
    case 'Run':
    case 'Jog':
    case 'Home':
      setButton('btn-start', false, Icon.play);
      setButton('btn-pause', true, Icon.pause, pauseGCode);
      break;
    case 'Sleep':
      setButton('btn-start', false, Icon.lockClosed);
      setButton('btn-pause', true, Icon.stop, reset);
      break;
    case 'Alarm':
      setButton('btn-start', true, Icon.lockClosed, unlock);
      setButton('btn-pause', true, Icon.stop, reset);
      break;
    case 'Door1':
      setButton('btn-start', false, Icon.play, resumeGCode);
      setButton('btn-pause', true, Icon.stop, reset);
      break;
    case 'Door0':
    case 'Hold':
      setButton('btn-start', true, Icon.play, resumeGCode);
      setButton('btn-pause', true, Icon.stop, reset);
      break;
    case 'Check':
      setButton('btn-start', true, Icon.play);
      setButton('btn-pause', true, Icon.stop, reset);
      break;
  }
  updateProgramProgress();
}

const runGCode = () => {
  if (gCodeFile != null) {
    sendCommandAndGetStatus('$sd/run=' + gCodeFile.path);
  }
};

export function toolPathPanel() {
  return panel('previewpane', previewPaneClass, [
    element('canvas', 'toolpath', toolPathClass, ''),
    label('filename', "", fileNameClass),
    button('open-gcode-file', svgIcon(Icon.file, "1.1em", "1.1em"), 'Open GCode File',
        () => new FSDialog(FSType.SDCard, (file) => loadGCodeFile(file)), "", floatingButtonClass)
  ]);
}

function updateProgramProgress() {
  setLabel('line', "" + currentState.sdPercent);
}

const previewPaneClass = cssClass("previewPane", css`
  position: relative;
  overflow: hidden;
  height: 100%;
`)

const toolPathClass = cssClass("toolPath", css`
  height: 100%;
  width: 100%;
  z-index: 0;
  user-select: none;
  overflow: hidden;
  box-sizing: border-box;
  border: 0.05rem solid #5755d9;
`)

const fileNameClass = cssClass("fileName", css`
  position: absolute;
  top: 0.01em;
  left: 0.2em;
  z-index: 1;
  user-select: none;
`)

stateChannel.register(updateRunButtons)
messageChannel.register(updateProgramProgress)
