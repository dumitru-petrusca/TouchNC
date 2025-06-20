import {element, panel, textInput} from './ui';
import {Consumer, countCharInstances, EventHandler, Producer} from '../common/common';
import {btnClass, css, CssClass, cssClass} from './commonStyles';
import {closeModal, pushModal} from '../dialog/modaldlg';
import {modalClass} from '../dialog/dialogStyles';
import {button} from './button';

export enum NumpadType {
  INTEGER,
  FLOAT,
  IP
}

export class Numpad {
  maxDigits: number
  type: NumpadType;
  get: Producer<string>;
  set: Consumer<string>;
  goto?: Consumer<string>;
  dialog: HTMLElement
  value: HTMLInputElement

  constructor(type: NumpadType, get: Producer<string>, set: Consumer<string>, goto?: Consumer<string>, max: number = 255,) {
    this.type = type;
    this.set = set;
    this.get = get;
    this.goto = goto;
    this.maxDigits = max;

    this.value = textInput("numDisplay", "", "0", undefined, valueClass);
    this.value.disabled = true;

    this.dialog = panel("", modalClass,
        panel("numWrap", numpadClass, [
          btn("7", numberClass, this.digit.bind(this)),
          btn("8", numberClass, this.digit.bind(this)),
          btn("9", numberClass, this.digit.bind(this)),
          this.value,

          btn("4", numberClass, this.digit.bind(this)),
          btn("5", numberClass, this.digit.bind(this)),
          btn("6", numberClass, this.digit.bind(this)),
          btn("&#10502;", controlClass, this.delete.bind(this)),
          btn("Go", gotoClass, this.gotoValue.bind(this)),

          btn("1", numberClass, this.digit.bind(this)),
          btn("2", numberClass, this.digit.bind(this)),
          btn("3", numberClass, this.digit.bind(this)),
          btn("C", controlClass, this.reset.bind(this)),
          btn("Set", setClass, this.setValue.bind(this)),

          btn("0", numberClass, this.digit.bind(this)),
          btn(".", numberClass, this.dot.bind(this)),
          btn("+/-", numberClass, this.toggleSign.bind(this)),
          btn("Get", controlClass, this.getValue.bind(this)),
          btn("Cancel", cancelClass, closeModal)
        ])
    );

    document.body.appendChild(this.dialog);
    pushModal(this.dialog, () => document.body.removeChild(this.dialog))
  }

  digitv(n: number) {
    const current = this.value.value;
    if (current.length < this.maxDigits) {
      let sign = this.value.value.startsWith("-") ? "-" : ""
      if (current == "0" || current == "-0") {
        this.value.value = sign + n;
      } else {
        this.value.value += n;
      }
    }
  }

  digit(e: Event) {
    if (e.target != null) {
      let value = (e.target as HTMLElement).innerHTML;
      this.digitv(Number(value));
    }
  }

  toggleSign() {
    if (!this.value.value.startsWith("-")) {
      this.value.value = "-" + this.value.value;
    } else {
      this.value.value = this.value.value.substring(1);
    }
  }

  dot() {
    if (countCharInstances(this.value.value, '.') < this.maxDotCount()) {
      this.value.value += ".";
    }
  }

  private maxDotCount(): number {
    switch (this.type) {
      case NumpadType.INTEGER:
        return 0;
      case NumpadType.FLOAT:
        return 1;
      case NumpadType.IP:
        return 3;
    }
  }

  delete() {
    const length = this.value.value.length;
    if (length == 1) {
      this.value.value = "0";
    } else {
      this.value.value = this.value.value.substring(0, length - 1);
    }
  }

  reset() {
    this.value.value = "0";
  }

  getValue() {
    this.value.value = "" + this.get();
  }

  setValue() {
    this.set(this.value.value)
    closeModal();
  }

  gotoValue() {
    if (this.goto != null) {
      this.goto(this.value.value)
      closeModal();
    }
  }

  keyPress(event: KeyboardEvent) {
    event.preventDefault();
    switch (event.key) {
      case "Escape":
      case "q":
        closeModal();
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        this.digitv(Number(event.key));
        break;
      case '.':
        this.dot();
        break;
      case 'Backspace':
      case 'Del':
        this.delete();
        break;
      case 'x':
      case 'X':
        this.reset();
        break;
      case 'c':
      case 'C':
        this.reset();
        break;
      case 'g':
      case 'G':
        this.getValue();
        break;
      case 's':
      case 'S':
      case 'Enter':
        this.setValue();
        break;
    }
  }
}

const btn = (txt: string, css: CssClass, fn?: EventHandler) => {
  return button("", txt, "", fn, "", css)
};

export function numpadButton(id: string, title: string, value: string, type: NumpadType, set: Consumer<string>): HTMLButtonElement {
  const btn = element('button', id, btnClass, value) as HTMLButtonElement
  btn.title = title
  btn.onclick = function (_: Event) {
    new Numpad(type, () => btn.innerText, v => {
      btn.innerText = v
      set(v)
    })
  }
  return btn
}

const numpadClass = cssClass("numpad", css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  gap: 5px;
  width: 40%;
  border: 2px solid #337AB7;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  margin: auto;
  padding: 10px;
  background-color: #fefefe;
  font-size: 32px;
`)

const valueClass = cssClass("value", css`
  grid-column: span 3;
  text-align: right;
  font-size: 42px;
  background: lightcyan;
  height: 80px;
`)

const numberClass = cssClass("number", css`
  text-align: center;
  border: 1px solid #c1c1c1;
  background: white;
  height: 80px;
`)

const controlClass = cssClass("control", css`
  background: #ffecd7;
  height: 80px;
`)

const gotoClass = cssClass("goto", css`
  grid-column: span 2;
  background: lightcoral;
  height: 80px;
`)

const setClass = cssClass("set", css`
  grid-column: span 2;
  background: lightgreen;
  height: 80px;
`)

const cancelClass = cssClass("cancel", css`
  grid-column: span 2;
  background: lightgray;
  height: 80px;
`)
