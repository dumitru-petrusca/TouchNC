import {element, label, panel} from '../ui/ui';
import {btnClass, css, cssClass} from '../ui/commonStyles';
import {contentClass, modalClass, titleClass, titleRowClass, twoButtonRowStyle} from '../dialog/dialogStyles';
import {closeModal, pushModal} from '../dialog/modaldlg';
import {PinSetting, SelectOption} from './settings';
import {Consumer} from '../common/common';
import {button} from '../ui/button';
import {machineSettings} from './machinesettings';
import {esp32, NO_PIN, NO_PIN_CONFIG, NO_PIN_TEXT, parsePinConfig, Pin, PinActive, PinBias, PinCap, pinComparator, PinConfig} from './esp32';
import {List} from '../common/list';

export class PinDialog {
  pin: Pin;
  pinElement = element("select", "pin_bias", btnClass, undefined, _ => {
    this.pin = this.value().pin
    this.updateBiasOptions()
  }) as HTMLSelectElement;
  biasElement = element("select", "pin_name", btnClass, undefined, undefined) as HTMLSelectElement;
  activeElement = element("select", "pin_active", btnClass, undefined, undefined) as HTMLSelectElement;
  private caps: PinCap;
  private active: PinActive;
  private bias: PinBias;

  constructor(title: string, pinSetting: PinSetting, set: Consumer<PinConfig>) {
    this.pin = pinSetting.pin();
    this.caps = pinSetting.caps;
    this.bias = pinSetting.bias();
    this.active = pinSetting.active();
    this.addPinOptions();
    this.updateBiasOptions();
    this.addActiveOptions();
    let dialog = panel("", modalClass,
        panel("", contentClass, [
          panel("", titleRowClass, label("", title, titleClass)),
          panel("", controlRowClass, [this.pinElement, this.biasElement, this.activeElement]),
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

  addPinOptions() {
    let pins = esp32.getPins(this.caps)
        .remove(machineSettings.getUsedPins())
        .addAll(NO_PIN, this.pin)
        .sortedList(pinComparator)
        .map(p => optionElement(p.toString(), p.toString()))
    this.pinElement.replaceChildren(...pins)
    this.pinElement.value = this.pin.toString()
  }

  updateBiasOptions() {
    let biasList = new List<SelectOption>()
        .push(new SelectOption(0, "od", "Open Drain"))
        .pushIf(this.pin.hasCaps(PinCap.PullUp), () => new SelectOption(1, "pu", "Pull Up"))
        .pushIf(this.pin.hasCaps(PinCap.PullDown), () => new SelectOption(2, "pd", "Pull Down"))
        .map(o => optionElement(o.value, o.text))
    this.biasElement.replaceChildren(...biasList)
    if (biasList.find(b => b.value == this.bias) == undefined) {
      this.bias = "od"
    }
    this.biasElement.value = this.bias
  }

  addActiveOptions() {
    let ACTIVE = [new SelectOption(0, "high", "Active High"), new SelectOption(1, "low", "Active Low")]
    this.activeElement.replaceChildren(...ACTIVE.map(o => optionElement(o.value, o.text)))
    this.activeElement.value = this.active
  }

  value(): PinConfig {
    let bias = this.biasElement.selectedOptions.item(0)?.value
    let active = this.activeElement.selectedOptions.item(0)?.value
    let v = this.pinElement.selectedOptions.item(0)?.value!
    if (v == NO_PIN_TEXT) {
      return NO_PIN_CONFIG
    }
    if (bias != "od") {
      v += ":" + bias
    }
    if (active != "ah") {
      v += ":" + active
    }
    return parsePinConfig(v);
  }
}

function optionElement(value: string, text: string) {
  const option = document.createElement("option") as HTMLOptionElement
  option.value = value;
  option.text = text;
  return option
}

export function pinButton(id: string, title: string, pinSetting: PinSetting, set: Consumer<PinConfig>): HTMLButtonElement {
  const btn = element('button', id, btnClass, pinSetting.stringValue()) as HTMLButtonElement
  btn.onclick = function (_: Event) {
    new PinDialog(title, pinSetting, value => {
      btn.innerText = value.toString()
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
