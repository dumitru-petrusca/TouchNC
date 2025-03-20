import {row, textInput} from './ui';
import {button, getButton, getButtonValueAsString} from './button';
import {Icon, svgIcon} from './icons';
import {sendCommandAndGetStatus} from '../http/http';
import {css, cssClass} from './commonStyles';

export function mdi() {
  return row('mdi')
      .add("1fr", mdiInput('mditext0'))
      .add("1fr", mdiInput('mditext1'))
      .add("1fr", mdiInput('mditext2'))
      .build()
}

function mdiInput(id: string) {
  let input = textInput(id, "GCode", "");
  input.addEventListener('keyup', mdiEnterKey);
  return row().gap("0px")
      .add("1fr", button('mdi0', svgIcon(Icon.play), 'Submit GCode Command', btnMDI, id, mdiBtnClass))
      .add("8fr", input)
      .build()
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

const mdiBtnClass = cssClass("mdiBtn", css`
  background-color: lightcyan;;
`)

