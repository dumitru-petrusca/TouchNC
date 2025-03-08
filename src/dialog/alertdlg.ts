import {closeModal, pushModal} from './modaldlg';
import {label, panel} from '../ui/ui';
import {contentClass, modalClass, oneButtonRowClass, textRowClass, titleClass, titleRowClass} from './dialogStyles';
import {button} from '../ui/button';

export class AlertDialog {
  constructor(title: string, content: any) {
    let text: string = "" + content
    if (content instanceof Error) {
      text = content.message
    }
    let dialog = panel("", modalClass,
        panel("", contentClass, [
          panel("", titleRowClass, label("", title, titleClass)),
          panel("", textRowClass, label("", text)),
          panel("", oneButtonRowClass, button("", "Ok", "Ok", closeModal))
        ])
    );
    document.body.appendChild(dialog)
    pushModal(dialog, () => document.body.removeChild(dialog))
  }
}
