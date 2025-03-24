import {element, getElement, label, panel} from '../ui/ui';
import {btnClass, css, cssClass} from '../ui/commonStyles';
import {contentClass, modalClass, titleClass, titleRowClass, twoButtonRowStyle} from '../dialog/dialogStyles';
import {closeModal, pushModal} from '../dialog/modaldlg';
import {NO_PIN, PinSetting, SelectOption} from './settings';
import {Consumer} from '../common';
import {button} from '../ui/button';

let OD = new SelectOption("od", "Open Drain", 0)
let PU = new SelectOption("pu", "Pull Up", 1)
let PD = new SelectOption("pd", "Pull Down", 2)
let BIAS = [OD, PU, PD]

let AH = new SelectOption("high", "Active High", 0)
let AL = new SelectOption("low", "Active Low", 1)
let ACTIVE = [AH, AL]

class Pin {
  name: string = NO_PIN
  bias: string = OD.text
  active: string = AH.text
}

function parsePinValue(value: string): Pin {
  let pin = new Pin()
  let s = value.split(":").map(s => s.trim());
  if (s.length == 1) {
    pin.name = s[0].trim()
  }
  if (s.length == 2) {
    pin.name = s[0].trim()
    if (s[1] == PU.text || s[1] == PD.text) {
      pin.bias = s[1].trim()
    } else {
      pin.active = s[1].trim()
    }
  }
  if (s.length == 3) {
    pin.name = s[0].trim()
    pin.bias = s[1].trim()
    pin.active = s[2].trim()
  }
  return pin
}

export class PinDialog {
  pin: PinSetting;

  constructor(title: string, pin: PinSetting, set: Consumer<string>) {
    this.pin = pin;
    let p = parsePinValue(pin.getValue());
    let dialog = panel("", modalClass,
        panel("", contentClass, [
          panel("", titleRowClass, label("", title, titleClass)),
          panel("", controlRowClass, [
            this.pinNumber(p.name),
            this.bias(p.bias),
            this.active(p.active),
          ]),
          panel("", twoButtonRowStyle, [
            button("", "Ok", "Ok", () => {
              set(this.value())
              closeModal("")
            }),
            button("", "Cancel", "Cancel", () => closeModal(""))
          ])
        ])
    )
    document.body.appendChild(dialog);
    pushModal(dialog, () => document.body.removeChild(dialog))
  }

  pinNumber(value: string) {
    const e = element("select", "pin_name", btnClass, undefined, undefined) as HTMLSelectElement;
    this.pin.pins.forEach((pin, i) => {
      const option = document.createElement("option") as HTMLOptionElement
      option.value = "" + i;
      option.text = pin;
      option.textContent = pin;
      e.appendChild(option);
      if (value == pin) {
        e.value = "" + i
      }
    });
    return e
  }

  bias(value: string) {
    const e = element("select", "pin_bias", btnClass, undefined, undefined) as HTMLSelectElement;
    [OD, PU, PD].forEach((o, i) => {
      const option = document.createElement("option") as HTMLOptionElement
      option.value = "" + i;
      option.text = o.displayText;
      option.textContent = o.displayText;
      e.appendChild(option);
      if (value == o.text) {
        e.value = "" + i
      }
    });
    return e
  }

  active(value: string) {
    const e = element("select", "pin_active", btnClass, undefined, undefined) as HTMLSelectElement;
    [AH, AL].forEach((o, i) => {
      const option = document.createElement("option") as HTMLOptionElement
      option.value = "" + i;
      option.text = o.displayText;
      option.textContent = o.displayText;
      e.appendChild(option);
      if (value == o.text) {
        e.value = "" + i
      }
    });
    return e
  }

  private value() {
    let bias = BIAS[(getElement("pin_bias") as HTMLSelectElement).selectedIndex];
    let active = ACTIVE[(getElement("pin_active") as HTMLSelectElement).selectedIndex];
    let v = this.pin.pins[(getElement("pin_name") as HTMLSelectElement).selectedIndex];
    if (v == NO_PIN) {
      return NO_PIN
    }
    if (bias != OD) {
      v += ":" + bias.text
    }
    if (active != AH) {
      v += ":" + active.text
    }
    return v;
  }
}

export function pinButton(id: string, title: string, pin: PinSetting, set: Consumer<string>): HTMLButtonElement {
  const btn = element('button', id, btnClass, pin.value) as HTMLButtonElement
  btn.onclick = function (_: Event) {
    new PinDialog(title, pin, value => {
      btn.innerText = value
      set(value)
    })
  }
  return btn
}

export const controlRowClass = cssClass("controlRow", css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)
