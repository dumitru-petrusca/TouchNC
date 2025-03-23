const events = [
  "click", "dblclick", "mousedown", "mouseup", "mousemove",
  "mouseenter", "mouseleave", "mouseover", "mouseout",
  "touchstart", "touchmove", "touchend", "touchcancel",
  "keydown", "keyup", "keypress",
  "focus", "blur", "contextmenu"
];

export function logEvents(e: HTMLElement) {
  events.forEach(eventType => {
    e.addEventListener(eventType, (event: Event) => {
      if (event instanceof TouchEvent) {
        console.log(`Event: ${e.id}, ${event.type}, ${event}`);
      } else if (event instanceof FocusEvent) {
        console.log(`Event: ${e.id}, ${event.type}, ${event}`);
      } else if (event instanceof PointerEvent) {
        console.log(`Event: ${e.id}, ${event.type}, ${event}`);
      } else {
        console.log(`Event: ${e.id}, ${event.type}, ${event}`);
      }
    });
  })
}
