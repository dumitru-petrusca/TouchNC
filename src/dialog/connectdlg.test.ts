import {parseFirmwareData} from './connectdlg';
import {MILL} from '../machine/machine';

test('parseFirmwareData', () => {
  let fw = parseFirmwareData("FW version: FluidNC v3.9.6 (my-changes-2-a524054c-dirty) # FW target:grbl-embedded  # FW HW:Direct SD  # primary sd:none # secondary sd:none  # authentication:no # webcommunication: Sync: 81 # hostname:demo # meta:machine=MILL # axis:3")
  expect(fw.machine).toEqual(MILL)
});
