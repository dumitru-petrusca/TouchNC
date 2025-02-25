import {getElement} from '../ui/ui';
import {Function2} from '../common';

let modalStack: Modal[] = [];

interface Modal {
  element: HTMLElement;
  closeFn: Function2<any>
}

export function setActiveModal(htmlTemplate: string, closeFn: Function2<any> = null) {
  if (htmlTemplate == null) {
    return null;
  }
  modalStack.push({
    element: getElement(htmlTemplate),
    closeFn: closeFn
  })
  return getActiveModal();
}

export function pushModal(element: HTMLElement, closeFn: Function2<any> = null): void {
  modalStack.push({
    element: element,
    closeFn: closeFn
  })
  showModal()
}

export function getActiveModal(): Modal | null {
  return modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;
}

export function showModal() {
  const modal = getActiveModal();
  if (modal != null) {
    modal.element.style.display = "block";
  }
}

export function closeModal(value: any = null) {
  const modal = getActiveModal();
  if (modal != null) {
    modal.element.style.display = "none";
    modalStack.pop();
    if (modal.closeFn != null) {
      modal.closeFn(value);
    }
  }
}

(window as any).closeModal = closeModal