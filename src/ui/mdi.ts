import { textInput } from './ui';
import { button, getButton, getButtonValueAsString, getParentButton } from './button';
import { Icon, svgIcon } from './icons';
import { sendCommandAndGetStatus } from '../http/http';
import { css, cssClass } from './commonStyles';
import { row } from './panel';

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
    .add("1fr", button('btn_' + id, svgIcon(Icon.play), 'Submit GCode Command', btnMDI, id, mdiBtnClass))
    .add("8fr", input)
    .build()
}

function btnMDI(e: Event) {
  let id = getButtonValueAsString(e);
  sendCommandAndGetStatus(getButton(id).value);  // value refers to the adjacent text entry box
  flashButton(getParentButton(e));
}

const mdiEnterKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    let input = e.target as HTMLInputElement;
    sendCommandAndGetStatus(input.value);
    input.blur();

    // Find the associated button and flash it
    const btn = document.getElementById('btn_' + input.id);
    flashButton(btn);
  }
}

function flashButton(btn: HTMLElement | null) {
  if (btn) {
    btn.style.backgroundColor = "#88dd88"; // slight green
    setTimeout(() => {
      btn.style.backgroundColor = "";
    }, 200);
  }
}

const mdiBtnClass = cssClass("mdiBtn", css`
  background-color: lightcyan;
  height: 40px;
`)

