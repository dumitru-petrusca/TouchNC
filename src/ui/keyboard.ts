import { getElement, isInputFocused} from './ui';
import {getButton} from './button';

let ctrlDown = false;

export const handleKeyDown = (event: KeyboardEvent) => {
  // When we are in a modal input field like the MDI text boxes
  // or the numeric entry boxes, disable keyboard jogging so those
  // keys can be used for text editing.
  if (getElement('tablettab').style.display === 'none') {
    return;
  }
  if (isInputFocused) {
    return;
  }
  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      break;
    case "ArrowLeft":
      event.preventDefault();
      break;
    case "ArrowUp":
      event.preventDefault();
      break;
    case "ArrowDown":
      event.preventDefault();
      break;
    case "PageUp":
      event.preventDefault();
      break;
    case "PageDown":
      event.preventDefault();
      break;
    case "Escape":
    case "Pause":
      getButton('btn-pause').click();
      break;
    case "Shift":
      break;
    case "Control":
      ctrlDown = true;
      break;
    case "Alt":
      break;
    case "=": // = is unshifted + on US keyboards
    case "+":
      event.preventDefault();
      break;
    case '-':
      event.preventDefault();
      break;
    case 'keydown':
    case 'keyup':
      break;
    default:
      // console.log(event);
      break;
  }
};

export const handleKeyUp = (event: KeyboardEvent) => {
  if (getElement('tablettab').style.display === 'none') {
    return;
  }
  if (isInputFocused) {
    return;
  }
  switch (event.key) {
    case "Alt":
      break;
    case "Shift":
      break;
    case "Control":
      ctrlDown = false;
      break;
  }
};

