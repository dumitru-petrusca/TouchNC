import {sendCommandAndGetStatus, sendCommand} from '../http/http';
import {button} from '../ui/button';
import {currentModal} from './modal';

export const createJogPanel = (id: string, name: string, axis: string, feedrate: number) => {
  let btn = button(id, name, `Move ${axis}`, null, axis);
  btn.addEventListener('pointerdown', handleDown(axis, feedrate));
  btn.addEventListener('pointerup', handleUp);
  btn.addEventListener('pointerout', handleUp);
  return btn
}

function handleDown(axis: string, feedrate: number) {
  return (event: Event) => {
    if (currentModal.units === "G20") {
      feedrate /= 25.4;
    }
    const cmd = '$J=G91F' + feedrate.toFixed(2) + axis + '1000\n';
    // tabletShowMessage("Jog: " + axis + ": " + cmd);
    sendCommandAndGetStatus(cmd);
  }
}

const handleUp = (event: Event) => {
  sendCommand('\x85');
}
