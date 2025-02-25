import {parseLine} from './parser';
import {Modal2} from './types';
import {Coordinate} from '../events/eventbus';

type AddArc = (modal: Modal2, start: Coordinate, end: Coordinate, center: Coordinate, rotations: number) => void;
type AddLine = (modal: Modal2, start: Coordinate, end: Coordinate) => void;

export class Toolpath {
  addArc: AddArc;
  addLine: AddLine
  motionMode = 'G0';
  g92offset = new Coordinate(0, 0, 0)
  position = new Coordinate(0, 0, 0)
  modal = new Modal2()

  constructor(position: Coordinate, modal: Modal2, addLine: AddLine, addArcCurve: AddArc) {
    this.setPosition(position);
    this.modal = Object.assign({}, modal);
    this.addLine = addLine;
    this.addArc = addArcCurve;
  }

  offsetG92(pos: Coordinate): Coordinate {
    return new Coordinate(pos.x + this.g92offset.x, pos.y + this.g92offset.y, pos.z + this.g92offset.z)
  }

  offsetAddLine(start: Coordinate, end: Coordinate) {
    this.addLine(this.modal, this.offsetG92(start), this.offsetG92(end));
  }

  offsetAddArcCurve(start: Coordinate, end: Coordinate, center: Coordinate, rotations: number) {
    this.addArc(this.modal, this.offsetG92(start), this.offsetG92(end), this.offsetG92(center), rotations);
  }

  handlers = {
    // G0: Rapid Linear Move
    'G0': (params: any) => {
      this.modal.motion = 'G0';
      const v2 = this.translate(params.X, params.Y, params.Z, this.isRelativeDistance())
      this.offsetAddLine(this.position, v2);
      this.setPosition(v2);
    },
    // G1: Linear Move
    // Usage
    //   G1 Xnnn Ynnn Znnn Ennn Fnnn Snnn
    // Parameters
    //   Xnnn The position to move to on the X axis
    //   Ynnn The position to move to on the Y axis
    //   Znnn The position to move to on the Z axis
    //   Fnnn The feedrate per minute of the move between the starting point and ending point (if supplied)
    //   Snnn Flag to check if an endstop was hit (S1 to check, S0 to ignore, S2 see note, default is S0)
    // Examples
    //   G1 X12 (move to 12mm on the X axis)
    //   G1 F1500 (Set the feedrate to 1500mm/minute)
    //   G1 X90.6 Y13.8 E22.4 (Move to 90.6mm on the X axis and 13.8mm on the Y axis while extruding 22.4mm of material)
    //
    'G1': (params: any) => {
      this.modal.motion = 'G1';
      const v1 = new Coordinate(this.position.x, this.position.y, this.position.z)
      const v2 = this.translate(params.X, params.Y, params.Z, this.isRelativeDistance())
      this.offsetAddLine(v1, v2);
      this.setPosition(v2);
    },
    // G2 & G3: Controlled Arc Move
    // Usage
    //   G2 Xnnn Ynnn Innn Jnnn Ennn Fnnn (Clockwise Arc)
    //   G3 Xnnn Ynnn Innn Jnnn Ennn Fnnn (Counter-Clockwise Arc)
    // Parameters
    //   Xnnn The position to move to on the X axis
    //   Ynnn The position to move to on the Y axis
    //   Innn The point in X space from the current X position to maintain a constant distance from
    //   Jnnn The point in Y space from the current Y position to maintain a constant distance from
    //   Fnnn The feedrate per minute of the move between the starting point and ending point (if supplied)
    // Examples
    //   G2 X90.6 Y13.8 I5 J10 E22.4 (Move in a Clockwise arc from the current point to point (X=90.6,Y=13.8),
    //   with a center point at (X=current_X+5, Y=current_Y+10), extruding 22.4mm of material between starting and stopping)
    //   G3 X90.6 Y13.8 I5 J10 E22.4 (Move in a Counter-Clockwise arc from the current point to point (X=90.6,Y=13.8),
    //   with a center point at (X=current_X+5, Y=current_Y+10), extruding 22.4mm of material between starting and stopping)
    // Referring
    //   http://linuxcnc.org/docs/2.5/html/gcode/gcode.html#sec:G2-G3-Arc
    //   https://github.com/grbl/grbl/issues/236
    'G2': (params: any) => {
      this.modal.motion = 'G2';
      const v1 = this.position.copy()
      const v2 = this.translate(params.X, params.Y, params.Z, this.isRelativeDistance())
      const v0 = new Coordinate( // fixed point
          this.translateI(params.I),
          this.translateJ(params.J),
          this.translateK(params.K)
      )
      const targetPosition = new Coordinate(v2.x, v2.y, v2.z);

      if (this.isXYPlane()) { // XY-plane
        [v1.x, v1.y, v1.z] = [v1.x, v1.y, v1.z];
        [v2.x, v2.y, v2.z] = [v2.x, v2.y, v2.z];
        [v0.x, v0.y, v0.z] = [v0.x, v0.y, v0.z];
      } else if (this.isZXPlane()) { // ZX-plane
        [v1.x, v1.y, v1.z] = [v1.z, v1.x, v1.y];
        [v2.x, v2.y, v2.z] = [v2.z, v2.x, v2.y];
        [v0.x, v0.y, v0.z] = [v0.z, v0.x, v0.y];
      } else if (this.isYZPlane()) { // YZ-plane
        [v1.x, v1.y, v1.z] = [v1.y, v1.z, v1.x];
        [v2.x, v2.y, v2.z] = [v2.y, v2.z, v2.x];
        [v0.x, v0.y, v0.z] = [v0.y, v0.z, v0.x];
      } else {
        console.error('The plane mode is invalid', this.modal.plane);
        return;
      }

      if (params.R) {
        const radius = this.translateR(Number(params.R) || 0);
        const x = v2.x - v1.x;
        const y = v2.y - v1.y;
        const distance = Math.sqrt(x * x + y * y);
        let height = -Math.sqrt(4 * radius * radius - x * x - y * y) / 2;
        const offsetX = x / 2 - y / distance * height;
        const offsetY = y / 2 + x / distance * height;
        v0.x = v1.x + offsetX;
        v0.y = v1.y + offsetY;
      }

      this.offsetAddArcCurve(v1, v2, v0, params.P ? Number(params.P) : 1);
      this.setPosition(targetPosition);
    },
    'G3': (params: any) => {
      this.modal.motion = 'G3';
      const v1 = this.position;
      const v2 = this.translate(params.X, params.Y, params.Z, this.isRelativeDistance())
      const v0 = new Coordinate( // fixed point
          this.translateI(params.I),
          this.translateJ(params.J),
          this.translateK(params.K)
      )
      const targetPosition = new Coordinate(v2.x, v2.y, v2.z)

      if (this.isXYPlane()) { // XY-plane
        [v1.x, v1.y, v1.z] = [v1.x, v1.y, v1.z];
        [v2.x, v2.y, v2.z] = [v2.x, v2.y, v2.z];
        [v0.x, v0.y, v0.z] = [v0.x, v0.y, v0.z];
      } else if (this.isZXPlane()) { // ZX-plane
        [v1.x, v1.y, v1.z] = [v1.z, v1.x, v1.y];
        [v2.x, v2.y, v2.z] = [v2.z, v2.x, v2.y];
        [v0.x, v0.y, v0.z] = [v0.z, v0.x, v0.y];
      } else if (this.isYZPlane()) { // YZ-plane
        [v1.x, v1.y, v1.z] = [v1.y, v1.z, v1.x];
        [v2.x, v2.y, v2.z] = [v2.y, v2.z, v2.x];
        [v0.x, v0.y, v0.z] = [v0.y, v0.z, v0.x];
      } else {
        console.error('The plane mode is invalid', this.modal.plane);
        return;
      }

      if (params.R) {
        const radius = this.translateR(Number(params.R) || 0);
        const x = v2.x - v1.x;
        const y = v2.y - v1.y;
        const distance = Math.sqrt(x * x + y * y);
        let height = Math.sqrt(4 * radius * radius - x * x - y * y) / 2;
        if (radius < 0) {
          height = -height;
        }
        const offsetX = x / 2 - y / distance * height;
        const offsetY = y / 2 + x / distance * height;
        v0.x = v1.x + offsetX;
        v0.y = v1.y + offsetY;
      }

      this.offsetAddArcCurve(v1, v2, v0, params.P ? Number(params.P) : 1);
      this.setPosition(targetPosition);
    },
    // G4: Dwell
    // Parameters
    //   Pnnn Time to wait, in milliseconds
    // Example
    //   G4 P200
    'G4': (_: any) => {
    },
    // G10: Coordinate System Data Tool and Work Offset Tables
    'G10': (_: any) => {
    },
    // G17..19: Plane Selection
    // G17: XY (default)
    'G17': (_: any) => {
      this.modal.plane = 'G17';
    },
    // G18: XZ
    'G18': (_: any) => {
      this.modal.plane = 'G18';
    },
    // G19: YZ
    'G19': (_: any) => {
      this.modal.plane = 'G19'
    },
    // G20: Use inches for length units
    'G20': (_: any) => {
      this.modal.units = 'G20'
    },
    // G21: Use millimeters for length units
    'G21': (_: any) => {
      this.modal.units = 'G21'
    },
    // G38.x: Straight Probe
    // G38.2: Probe toward workpiece, stop on contact, signal error if failure
    'G38.2': (_: any) => {
      this.modal.motion = 'G38.2'
    },
    // G38.3: Probe toward workpiece, stop on contact
    'G38.3': (_: any) => {
      this.modal.motion = 'G38.3'
    },
    // G38.4: Probe away from workpiece, stop on loss of contact, signal error if failure
    'G38.4': (_: any) => {
      this.modal.motion = 'G38.4'
    },
    // G38.5: Probe away from workpiece, stop on loss of contact
    'G38.5': (_: any) => {
      this.modal.motion = 'G38.5'
    },
    // G43.1: Tool Length Offset
    'G43.1': (_: any) => {
      this.modal.tlo = 'G43.1'
    },
    // G49: No Tool Length Offset
    'G49': () => {
      this.modal.tlo = 'G49'
    },
    // G54..59: Coordinate System Select
    'G54': () => {
      this.modal.wcs = 'G54'
    },
    'G55': () => {
      this.modal.wcs = 'G55'
    },
    'G56': () => {
      this.modal.wcs = 'G56'
    },
    'G57': () => {
      this.modal.wcs = 'G57'
    },
    'G58': () => {
      this.modal.wcs = 'G58'
    },
    'G59': () => {
      this.modal.wcs = 'G59'
    },
    // G80: Cancel Canned Cycle
    'G80': () => {
      this.modal.motion = 'G80'
    },
    // G90: Set to Absolute Positioning
    // Example
    //   G90
    // All coordinates from now on are absolute relative to the origin of the machine.
    'G90': () => {
      this.modal.distance = 'G90'
    },
    // G91: Set to Relative Positioning
    // Example
    //   G91
    // All coordinates from now on are relative to the last position.
    'G91': () => {
      this.modal.distance = 'G91'
    },
    // G92: Set Position
    // Parameters
    //   This command can be used without any additional parameters.
    //   Xnnn new X axis position
    //   Ynnn new Y axis position
    //   Znnn new Z axis position
    // Example
    //   G92 X10
    // Allows programming of absolute zero point, by reseting the current position to the params specified.
    // This would set the machine's X coordinate to 10. No physical motion will occur.
    // A G92 without coordinates will reset all axes to zero.
    'G92': (params: any) => {
      // A G92 without coordinates will reset all axes to zero.
      if ((params.X == undefined) && (params.Y == undefined) && (params.Z == undefined)) {
        this.position.x += this.g92offset.x;
        this.g92offset.x = 0;
        this.position.y += this.g92offset.y;
        this.g92offset.y = 0;
        this.position.z += this.g92offset.z;
        this.g92offset.z = 0;
      } else {
        // The calls to translateX/Y/Z() below are necessary for inch/mm conversion
        // params.X/Y/Z must be interpreted as absolute positions, hence the "false"
        if (params.X != undefined) {
          const xmm = this.translateX(params.X, false);
          this.g92offset.x += this.position.x - xmm;
          this.position.x = xmm;
        }
        if (params.Y != undefined) {
          const ymm = this.translateY(params.Y, false);
          this.g92offset.y += this.position.y - ymm;
          this.position.y = ymm;
        }
        if (params.Z != undefined) {
          const zmm = this.translateX(params.Z, false);
          this.g92offset.z += this.position.z - zmm;
          this.position.z = zmm;
        }
      }
    },
    // G92.1: Cancel G92 offsets
    // Parameters
    //   none
    'G92.1': (_: any) => {
      this.position.x += this.g92offset.x;
      this.g92offset.x = 0;
      this.position.y += this.g92offset.y;
      this.g92offset.y = 0;
      this.position.z += this.g92offset.z;
      this.g92offset.z = 0;
    },
    // G93: Inverse Time Mode
    // In inverse time feed rate mode, an F word means the move should be completed in
    // [one divided by the F number] minutes.
    // For example, if the F number is 2.0, the move should be completed in half a minute.
    'G93': () => {
      this.modal.feedMode = 'G93'
    },
    // G94: Units per Minute Mode
    // In units per minute feed rate mode, an F word on the line is interpreted to mean the
    // controlled point should move at a certain number of inches per minute,
    // millimeters per minute or degrees per minute, depending upon what length units
    // are being used and which axis or axes are moving.
    'G94': () => {
      this.modal.feedMode = 'G94'
    },
    // G94: Units per Revolution Mode
    // In units per rev feed rate mode, an F word on the line is interpreted to mean the
    // controlled point should move at a certain number of inches per spindle revolution,
    // millimeters per spindle revolution or degrees per spindle revolution, depending upon
    // what length units are being used and which axis or axes are moving.
    'G95': () => {
      this.modal.feedMode = 'G95'
    },
    // M0: Program Pause
    'M0': () => {
      this.modal.program = 'M0'
    },
    // M1: Program Pause
    'M1': () => {
      this.modal.program = 'M1'
    },
    // M2: Program End
    'M2': () => {
      this.modal.program = 'M3'
    },
    // M30: Program End
    'M30': () => {
      this.modal.program = 'M30'
    },
    // Spindle Control
    // M3: Start the spindle turning clockwise at the currently programmed speed
    'M3': (_: any) => {
      this.modal.spindle = 'M3'
    },
    // M4: Start the spindle turning counterclockwise at the currently programmed speed
    'M4': (_: any) => {
      this.modal.spindle = 'M4'
    },
    // M5: Stop the spindle from turning
    'M5': () => {
      this.modal.spindle = 'M5'
    },
    // M6: Tool Change
    'M6': (params: any) => {
      if (params && params.T != undefined) {
        this.modal.tool = params.T;
      }
    },
    // Coolant Control
    // M7: Turn mist coolant on
    'M7': () => {
      const coolants = this.modal.coolant.split(',');
      if (coolants.indexOf('M7') >= 0) {
        return;
      }
      this.modal.coolant = coolants.indexOf('M8') >= 0 ? 'M7,M8' : 'M7'
    },
    // M8: Turn flood coolant on
    'M8': () => {
      const coolants = this.modal.coolant.split(',');
      if (coolants.indexOf('M8') >= 0) {
        return;
      }
      this.modal.coolant = coolants.indexOf('M7') >= 0 ? 'M7,M8' : 'M8'
    },
    // M9: Turn all coolant off
    'M9': () => {
      this.modal.coolant = 'M9'
    },
    'T': (tool: number) => {
      if (tool != undefined) {
        this.modal.tool = tool;
      }
    }
  };

  isImperialUnits() { // inches
    return this.modal.units == 'G20';
  }

  isRelativeDistance() {
    return this.modal.distance == 'G91';
  }

  isXYPlane() {
    return this.modal.plane == 'G17';
  }

  isZXPlane() {
    return this.modal.plane == 'G18';
  }

  isYZPlane() {
    return this.modal.plane == 'G19';
  }

  setPosition(p: Coordinate) {
    this.position.x = p.x;
    this.position.y = p.y;
    this.position.z = p.z;
  }

  translatePosition(position: number, newPosition: number, relative: boolean) {
    if (newPosition == undefined) {
      return position;
    }
    newPosition = this.isImperialUnits() ? newPosition * 25.4 : newPosition;
    newPosition = Number(newPosition);
    if (Number.isNaN(newPosition)) {
      return position;
    }
    return relative ? position + newPosition : newPosition;
  }

  translateX(x: number, relative: boolean) {
    return this.translatePosition(this.position.x, x, relative);
  }

  translateY(y: number, relative: boolean) {
    return this.translatePosition(this.position.y, y, relative);
  }

  translateZ(z: number, relative: boolean) {
    return this.translatePosition(this.position.z, z, relative);
  }

  translate(x: number, y: number, z: number, relative: boolean) {
    return new Coordinate(
        this.translatePosition(this.position.x, x, relative),
        this.translatePosition(this.position.y, y, relative),
        this.translatePosition(this.position.z, z, relative)
    )
  }

  translateI(i: number) {
    return this.translateX(i, true);
  }

  translateJ(j: number) {
    return this.translateY(j, true);
  }

  translateK(k: number) {
    return this.translateZ(k, true);
  }

  translateR(r: number) {
    r = Number(r);
    if (Number.isNaN(r)) {
      return 0;
    }
    return this.isImperialUnits() ? r * 25.4 : r;
  }

  loadFromLinesSync = (lines: string[]) => {
    let t1 = new Date().getTime()
    for (let line of lines) {
      line = line.trim();
      if (line.length != 0) {
        parseLine(line, this);
      }
    }
    console.log("Rendered file in " + (new Date().getTime() - t1)/1000.0 + "sec")
  }
}
