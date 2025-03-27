import {closeModal, pushModal} from './modaldlg';
import {label, panel} from '../ui/ui';
import {contentClass, modalClass, titleClass, titleRowClass, twoButtonRowStyle} from './dialogStyles';
import {Consumer} from '../common/common';
import {button} from '../ui/button';

export class ConfirmDialog {
  action?: Consumer<void>;
  dialog: HTMLElement

  constructor(text: string, action?: Consumer<void>) {
    this.action = action;
    this.dialog = this.createDialog(text);
    document.body.appendChild(this.dialog)
    pushModal(this.dialog, () => document.body.removeChild(this.dialog))
  }

  createDialog(text: string): HTMLElement {
    return panel("", modalClass,
        panel("", contentClass, [
          panel("", titleRowClass, label("", text, titleClass)),
          panel("", twoButtonRowStyle, [
            button("", "Yes", "Yes", () => this.close("yes")),
            button("", "No", "No", () => this.close("no"))
          ])
        ])
    )
  }

  close(answer: string) {
    closeModal("");
    if (answer == "yes") {
      this.action?.()
    }
  }
}
