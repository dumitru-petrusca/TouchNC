import {Coordinate2, currentState, wposToXYZ, xHomeDir, xHomePos, xMaxTravel, yHomeDir, yHomePos, yMaxTravel} from '../machine/machine';
import {ifPresent, isInputFocused} from '../ui/ui';
import {Toolpath} from './toolpath';
import {Modal2} from './types';
import {Coordinate, GCodeFile} from '../events/eventbus';

const toolRadius = 6;
const toolRectWH = toolRadius * 2 + 4;  // Slop to encompass the entire image area
const shrink = 0.90;
let inset = 30;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let tpUnits = 'G21';
let tpBbox = {
  min: {
    x: Infinity,
    y: Infinity
  },
  max: {
    x: -Infinity,
    y: -Infinity
  },
  isSet: false
};
let tool = new Coordinate2(0, 0);
let toolSave: ImageData | null;
let initialMoves = true;
let xOffset = 0;
let yOffset = 0;
let scaler = 1;
let xx = 0, xy = 0, xz = 0, yx = 0, yy = 0, yz = 0;  // The coefficients determine the projection matrix.
let theta: number = 30, phi: number = 30

const resetBbox = () => {
  tpBbox.min.x = Infinity;
  tpBbox.min.y = Infinity;
  tpBbox.max.x = -Infinity;
  tpBbox.max.y = -Infinity;
  tpBbox.isSet = false;
};

const drawOrigin = (radius: number) => {
  const po = projection(new Coordinate(0, 0, 0));
  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.arc(po.x, po.y, radius, 0, Math.PI * 2, false);
  ctx.moveTo(-radius * 1.5, 0);
  ctx.lineTo(radius * 1.5, 0);
  ctx.moveTo(0, -radius * 1.5);
  ctx.lineTo(0, radius * 1.5);
  ctx.stroke();
};

function haveBoundary() {
  return xHomePos != Infinity && yHomePos != Infinity;
}

const drawMachineBounds = () => {
  if (!haveBoundary()) {
    return;
  }

  const xMin = (xHomeDir == 1) ? xHomePos - xMaxTravel : xHomePos;
  const yMin = (yHomeDir == 1) ? yHomePos - yMaxTravel : yHomePos;

  const xMax = xMin + xMaxTravel;
  const yMax = yMin + yMaxTravel;

  const wcoX = currentState.mpos![0] - currentState.wpos[0];
  const wcoY = currentState.mpos![1] - currentState.wpos[1];
  const p0 = projection(new Coordinate(xMin - wcoX, yMin - wcoY, 0));
  const p1 = projection(new Coordinate(xMin - wcoX, yMax - wcoY, 0));
  const p2 = projection(new Coordinate(xMax - wcoX, yMax - wcoY, 0));
  const p3 = projection(new Coordinate(xMax - wcoX, yMin - wcoY, 0));

  tpBbox.min.x = Math.min(tpBbox.min.x, p0.x, p1.x);
  tpBbox.min.y = Math.min(tpBbox.min.y, p0.y, p3.y);
  tpBbox.max.x = Math.max(tpBbox.max.x, p2.x, p3.x);
  tpBbox.max.y = Math.max(tpBbox.max.y, p1.y, p2.y);
  tpBbox.isSet = true;

  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p0.x, p0.y);
  ctx.strokeStyle = "green";
  ctx.stroke();
};

const initDisplayer = () => {
  if (canvas == null) {
    ifPresent('toolpath', (e) => {
      canvas = e as HTMLCanvasElement;
      // canvas.addEventListener("mouseup", updateGcodeViewerAngle);
      window.addEventListener('keydown', handleKeyDown2);
      ctx = canvas.getContext("2d", {willReadFrequently: true})!;
      console.log("TP = " + ctx)
      ctx.lineWidth = 0.1;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'blue';
    });
  }
};

function handleKeyDown2(event: KeyboardEvent) {
  if (!isInputFocused) {
    switch (event.key) {
      case "ArrowRight":
        display.redraw(10, 0)
        event.preventDefault();
        break;
      case "ArrowLeft":
        display.redraw(-10, 0)
        event.preventDefault();
        break;
      case "ArrowUp":
        display.redraw(0, 10)
        event.preventDefault();
        break;
      case "ArrowDown":
        display.redraw(0, -10)
        event.preventDefault();
        break;
    }
  }
}

const clearCanvas = () => {
  initDisplayer();

  // Reset the transform and clear the canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  let tpRect = (canvas.parentNode as HTMLElement).getBoundingClientRect();
  canvas.width = tpRect.width ? tpRect.width : 400;
  canvas.height = tpRect.height ? tpRect.height : 400;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const transformCanvas = () => {
  toolSave = null;

  clearCanvas();

  if (!tpBbox.isSet) {
    scaler = 1;
    xOffset = 0;
    yOffset = 0;
    return;
  }

  let imageWidth = tpBbox.max.x - tpBbox.min.x;
  let imageHeight = tpBbox.max.y - tpBbox.min.y;
  if (imageWidth == 0) {
    imageWidth = 1;
  }
  if (imageHeight == 0) {
    imageHeight = 1;
  }
  const scaleX = (canvas.width - inset * 2) / imageWidth;
  const scaleY = (canvas.height - inset * 2) / imageHeight;
  const minScale = Math.min(scaleX, scaleY);

  scaler = Math.abs(minScale * shrink);
  xOffset = inset - tpBbox.min.x * scaler;
  yOffset = (canvas.height - inset) - tpBbox.min.y * (-scaler);

  // Canvas coordinates of image bounding box top and right
  // const imageTop = scaler * imageHeight;
  // const imageRight = scaler * imageWidth;

  // Show the X and Y limit coordinates of the GCode program.
  // We do this before scaling because after we invert the Y coordinate,
  // text would be displayed upside-down.
  // tp.fillStyle = "black";
  // tp.font = "14px Ariel";
  // tp.textAlign = "center";
  // tp.textBaseline = "bottom";
  // tp.fillText(formatLimit(tpBbox.min.y), imageRight/2, canvas.height-inset);
  // tp.textBaseline = "top";
  // tp.fillText(formatLimit(tpBbox.max.y), imageRight/2, canvas.height-inset - imageTop);
  // tp.textAlign = "left";
  // tp.textBaseline = "center";
  // tp.fillText(formatLimit(tpBbox.min.x), inset, canvas.height-inset - imageTop/2);
  // tp.textAlign = "right";
  // tp.textBaseline = "center";
  // tp.fillText(formatLimit(tpBbox.max.x), inset+imageRight, canvas.height-inset - imageTop/2);
  // Transform the path coordinate system so the image fills the canvas
  // with a small inset, and +Y goes upward.
  // The net transform from image space (x,y) to pixel space (x',y') is:
  //   x' =  scaler*x + xOffset
  //   y' = -scaler*y + yOffset
  // We use setTransform() instead of a sequence of scale() and translate() calls
  // because we need to perform the transform manually for getImageData(), which
  // uses pixel coordinates, and there is no standard way to read back the current
  // transform matrix.

  ctx.setTransform(scaler, 0, 0, -scaler, xOffset, yOffset);
  ctx.lineWidth = 0.5 / scaler;
  drawOrigin(imageWidth * 0.04);
};

const bboxHandlers = {
  addLine: (modal: Modal2, start: Coordinate, end: Coordinate) => {
    // Update tpUnits in case it changed in a previous line
    tpUnits = modal.units;

    const ps = projection(start);
    const pe = projection(end);

    tpBbox.min.x = Math.min(tpBbox.min.x, ps.x, pe.x);
    tpBbox.min.y = Math.min(tpBbox.min.y, ps.y, pe.y);
    tpBbox.max.x = Math.max(tpBbox.max.x, ps.x, pe.x);
    tpBbox.max.y = Math.max(tpBbox.max.y, ps.y, pe.y);
    tpBbox.isSet = true;
  },
  addArcCurve: (modal: Modal2, start: Coordinate, end: Coordinate, center: Coordinate) => {
    // To determine the precise bounding box of a circular arc we
    // must account for the possibility that the arc crosses one or
    // more axes.  If so, the bounding box includes the "bulges" of
    // the arc across those axes.

    // Update units in case it changed in a previous line
    tpUnits = modal.units;

    if (modal.motion == 'G2') {  // clockwise
      const tmp = start;
      start = end;
      end = tmp;
    }

    const ps = projection(start);
    const pc = projection(center);
    const pe = projection(end);

    // Coordinates relative to the center of the arc
    const sx = ps.x - pc.x;
    const sy = ps.y - pc.y;
    const ex = pe.x - pc.x;
    const ey = pe.y - pc.y;

    const radius = Math.hypot(sx, sy);

    // Axis crossings - plus and minus x and y
    let px = false;
    let py = false;
    let mx = false;
    let my = false;

    // There are ways to express this decision tree in fewer lines
    // of code by converting to alternate representations like angles,
    // but this way is probably the most computationally efficient.
    // It avoids any use of transcendental functions.  Every path
    // through this decision tree is either 4 or 5 simple comparisons.
    if (ey >= 0) {              // End in upper half plane
      if (ex > 0) {             // End in quadrant 0 - X+ Y+
        if (sy >= 0) {          // Start in upper half plane
          if (sx > 0) {         // Start in quadrant 0 - X+ Y+
            if (sx <= ex) {     // wraparound
              px = py = mx = my = true;
            }
          } else {              // Start in quadrant 1 - X- Y+
            mx = my = px = true;
          }
        } else {                // Start in lower half plane
          if (sx > 0) {         // Start in quadrant 3 - X+ Y-
            px = true;
          } else {              // Start in quadrant 2 - X- Y-
            my = px = true;
          }
        }
      } else {                  // End in quadrant 1 - X- Y+
        if (sy >= 0) {          // Start in upper half plane
          if (sx > 0) {         // Start in quadrant 0 - X+ Y+
            py = true;
          } else {              // Start in quadrant 1 - X- Y+
            if (sx <= ex) {     // wraparound
              px = py = mx = my = true;
            }
          }
        } else {                // Start in lower half plane
          if (sx > 0) {         // Start in quadrant 3 - X+ Y-
            px = py = true;
          } else {              // Start in quadrant 2 - X- Y-
            my = px = py = true;
          }
        }
      }
    } else {                    // ey < 0 - end in lower half plane
      if (ex > 0) {             // End in quadrant 3 - X+ Y+
        if (sy >= 0) {          // Start in upper half plane
          if (sx > 0) {         // Start in quadrant 0 - X+ Y+
            py = mx = my = true;
          } else {              // Start in quadrant 1 - X- Y+
            mx = my = true;
          }
        } else {                // Start in lower half plane
          if (sx > 0) {         // Start in quadrant 3 - X+ Y-
            if (sx >= ex) {      // wraparound
              px = py = mx = my = true;
            }
          } else {              // Start in quadrant 2 - X- Y-
            my = true;
          }
        }
      } else {                  // End in quadrant 2 - X- Y+
        if (sy >= 0) {          // Start in upper half plane
          if (sx > 0) {         // Start in quadrant 0 - X+ Y+
            py = mx = true;
          } else {              // Start in quadrant 1 - X- Y+
            mx = true;
          }
        } else {                // Start in lower half plane
          if (sx > 0) {         // Start in quadrant 3 - X+ Y-
            px = py = mx = true;
          } else {              // Start in quadrant 2 - X- Y-
            if (sx >= ex) {      // wraparound
              px = py = mx = my = true;
            }
          }
        }
      }
    }
    const maxX = px ? pc.x + radius : Math.max(ps.x, pe.x);
    const maxY = py ? pc.y + radius : Math.max(ps.y, pe.y);
    const minX = mx ? pc.x - radius : Math.min(ps.x, pe.x);
    const minY = my ? pc.y - radius : Math.min(ps.y, pe.y);

    const minZ = Math.min(start.z, end.z);
    const maxZ = Math.max(start.z, end.z);

    const p0 = projection(new Coordinate(minX, minY, minZ));
    const p1 = projection(new Coordinate(minX, maxY, minZ));
    const p2 = projection(new Coordinate(maxX, maxY, minZ));
    const p3 = projection(new Coordinate(maxX, minY, minZ));
    const p4 = projection(new Coordinate(minX, minY, maxZ));
    const p5 = projection(new Coordinate(minX, maxY, maxZ));
    const p6 = projection(new Coordinate(maxX, maxY, maxZ));
    const p7 = projection(new Coordinate(maxX, minY, maxZ));

    tpBbox.min.x = Math.min(tpBbox.min.x, p0.x, p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x);
    tpBbox.min.y = Math.min(tpBbox.min.y, p0.y, p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y);
    tpBbox.max.x = Math.max(tpBbox.max.x, p0.x, p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x);
    tpBbox.max.y = Math.max(tpBbox.max.y, p0.y, p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y);
    tpBbox.isSet = true;
  }
};

const displayHandlers = {
  addLine: (modal: Modal2, start: Coordinate, end: Coordinate) => {
    const motion = modal.motion;
    if (motion == 'G0') {
      ctx.strokeStyle = initialMoves ? 'red' : 'green';
    } else {
      ctx.strokeStyle = 'blue';
      // Don't cancel initialMoves on no-motion G1 (e.g. G1 F30) or on Z-only moves
      if (start.x != end.x || start.y != end.y) {
        initialMoves = false;
      }
    }

    const ps = projection(start);
    const pe = projection(end);
    ctx.beginPath();
    // tp.moveTo(start.x, start.y);
    // tp.lineTo(end.x, end.y);
    ctx.moveTo(ps.x, ps.y);
    ctx.lineTo(pe.x, pe.y);
    ctx.stroke();
  },
  addArcCurve: (modal: Modal2, start: Coordinate, end: Coordinate, center: Coordinate, rotations: number) => {
    const deltaX1 = start.x - center.x;
    const deltaY1 = start.y - center.y;
    const radius = Math.hypot(deltaX1, deltaY1);
    const deltaX2 = end.x - center.x;
    const deltaY2 = end.y - center.y;
    let theta1 = Math.atan2(deltaY1, deltaX1);
    let theta2 = Math.atan2(deltaY2, deltaX2);
    const cw = modal.motion == "G2";
    if (!cw && theta2 < theta1) {
      theta2 += Math.PI * 2;
    } else if (cw && theta2 > theta1) {
      theta2 -= Math.PI * 2;
    }
    if (theta1 == theta2) {
      theta2 += Math.PI * ((cw) ? -2 : 2);
    }
    if (rotations > 1) {
      theta2 += (rotations - 1) * Math.PI * ((cw) ? -2 : 2);
    }

    initialMoves = false;

    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    const deltaTheta = theta2 - theta1;
    const n = 10 * Math.ceil(Math.abs(deltaTheta) / Math.PI);
    const dt = (deltaTheta) / n;
    const dz = (end.z - start.z) / n;
    const ps = projection(start);
    ctx.moveTo(ps.x, ps.y);
    let next = new Coordinate(0, 0, 0)
    let theta = theta1;
    next.z = start.z;
    for (let i = 0; i < n; i++) {
      theta += dt;
      next.x = center.x + radius * Math.cos(theta);
      next.y = center.y + radius * Math.sin(theta);
      next.z += dz;
      const pe = projection(next);
      ctx.lineTo(pe.x, pe.y);
    }
    ctx.stroke();
  },
};

// Arrow notation does not work here because arrow functions are not linked to an
// object prototype, hence the prototype assignments below will fail
class ToolPathDisplay {
  private gcodeFile: GCodeFile | null = null

  setGcodeFile(gCodeFile: GCodeFile) {
    this.gcodeFile = gCodeFile;
  }

  showToolPath(initialPosition: Coordinate) {
    console.log("showToolPath")
    this.clear()
    updateView(0, 0)
    resetBbox();

    let drawBounds = false;
    if (drawBounds) {
      drawMachineBounds(); //Adds the machine bounds to the bounding box
    }

    const gcodeLines = this.gcodeFile!.content.split('\n');
    new Toolpath(initialPosition, new Modal2(), bboxHandlers.addLine, bboxHandlers.addArcCurve).loadFromLinesSync(gcodeLines);
    transformCanvas();
    if (!tpBbox.isSet) {
      return;
    }
    initialMoves = true;
    new Toolpath(initialPosition, new Modal2(), displayHandlers.addLine, displayHandlers.addArcCurve).loadFromLinesSync(gcodeLines);
    this.drawTool(initialPosition);
    if (drawBounds) {
      drawMachineBounds();
    }
  }

  redraw(dTheta: number, dPhi: number) {
    updateView(dTheta, dPhi)
    this.showToolPath(wposToXYZ(currentState));
  };

  drawTool(tp: Coordinate) {
    if (toolSave != null) {
      ctx.putImageData(toolSave, tool.x, tool.y);
    }

    const p = projection(tp);
    tool.x = scaler * p.x + xOffset - toolRadius - 2;
    tool.y = -scaler * p.y + yOffset - toolRadius - 2;
    toolSave = ctx.getImageData(tool.x, tool.y, toolRectWH, toolRectWH);

    ctx.beginPath();
    ctx.strokeStyle = 'magenta';
    ctx.fillStyle = 'magenta';
    ctx.arc(p.x, p.y, toolRadius / scaler, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.stroke();
  }

  clear() {
    clearCanvas();
  }
}

const projection = (wpos: Coordinate): Coordinate2 => {
  return new Coordinate2(
      wpos.x * xx + wpos.y * xy + wpos.z * xz,
      wpos.x * yx + wpos.y * yy + wpos.z * yz
  )
};

function updateView(dTheta: number, dPhi: number) {
  theta += dTheta;
  phi += dPhi;

  let thetaRad = Math.PI * theta / 180
  let phiRad = Math.PI * phi / 180

  xx = Math.cos(thetaRad);
  xy = Math.sin(thetaRad);
  xz = 0.0;
  yx = -Math.cos(thetaRad) * Math.sin(phiRad);
  yy = Math.cos(thetaRad) * Math.cos(phiRad);
  yz = Math.sin(phiRad);
}

export const display = new ToolPathDisplay();
