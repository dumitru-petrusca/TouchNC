import {panel, textInput} from './ui';
import {button, getButton, getButtonValueAsString} from './button';
import {Icon, svgIcon} from './icons';
import {sendCommandAndGetStatus} from '../http/http';
import {css, cssClass} from './commonStyles';

export function mdi() {
  return panel('mdi', mdiRowClass, [
    mdiInput('mditext0'),
    mdiInput('mditext1'),
    mdiInput('mditext2'),
  ]);
}

function mdiInput(id: string) {
  let input = textInput(id, "GCode", "");
  input.addEventListener('keyup', mdiEnterKey);
  return panel('mdi', mdiInputClass, [
    button('mdi0', svgIcon(Icon.play), 'Submit GCode Command', btnMDI, id, mdiBtnClass),
    input,
  ]);
}

function btnMDI(e: Event) {
  let id = getButtonValueAsString(e);
  sendCommandAndGetStatus(getButton(id).value);  // value refers to the adjacent text entry box
}

const mdiEnterKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    let id = getButtonValueAsString(e);
    sendCommandAndGetStatus(id);
    (e.target as HTMLElement).blur();
  }
}

const mdiRowClass = cssClass("mdiRow", css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

const mdiInputClass = cssClass("mdiInput", css`
  display: grid;
  grid-template-columns: 1fr 8fr;
  width: 100%;
  max-width: 100%;
`)

const mdiBtnClass = cssClass("mdiBtn", css`
  background-color: lightcyan;;
`)

