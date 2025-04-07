enum JogState {
  NONE,
  JOGGING,
  STOPPING
}

export class JogDebouncer {
  readonly debounceDelayMs: number
  readonly startAction: () => void;
  readonly endAction: () => void;
  state: JogState = JogState.NONE
  stoppingTimeout?: NodeJS.Timeout

  constructor(debounceDelayMs: number, startAction: () => void, endAction: () => void) {
    this.debounceDelayMs = debounceDelayMs
    this.startAction = startAction;
    this.endAction = endAction;
  }

  handleStart() {
    switch (this.state) {
      case JogState.NONE: // start the jog
        this.state = JogState.JOGGING
        this.startAction()
        console.log(`handleStart - NONE - start jog`)
        break
      case JogState.JOGGING: // we're already jogging, ignore the event
        console.log(`handleStart - JOGGING - ignore`)
        break
      case JogState.STOPPING: // cancel the stopping state and resume jogging
        clearTimeout(this.stoppingTimeout)
        this.state = JogState.JOGGING
        console.log(`handleStart - STOPPING - revert to jogging`)
        break
    }
  }

  handleEnd() {
    switch (this.state) {
      case JogState.NONE: // we're not jogging, ignore
        console.log(`handleEnd - NONE - not jogging`)
        break
      case JogState.JOGGING: // stop the jog
        this.stoppingTimeout = setTimeout(() => {
          this.endAction()
          this.state = JogState.NONE
        }, this.debounceDelayMs);
        console.log(`handleEnd - JOGGING - cancel jog`)
        break
      case JogState.STOPPING: // we're already stopping, ignore
        console.log(`handleEnd - STOPPED - already stopping`)
        break
    }
  }

  registerListener(button: HTMLButtonElement) {
    button.addEventListener("pointerdown", () => this.handleStart());
    window.addEventListener("pointerup", () => this.handleEnd(), {capture: true});
  }
}
