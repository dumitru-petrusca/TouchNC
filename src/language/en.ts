//removeIf(en_lang_disabled)
//english
export var englishtrans = {
  "en": "English",
  "STA": "Client Station",
  "AP": "Access Point",
  "BT": "Bluetooth",
  "Hold:0": "Hold complete. Ready to resume.",
  "Hold:1": "Hold in-progress. Reset will throw an alarm.",
  "Door:0": "Door closed. Ready to resume.",
  "Door:1": "Machine stopped. Door still ajar. Can't resume until closed.",
  "Door:2": "Door opened. Hold (or parking retract) in-progress. Reset will throw an alarm.",
  "Door:3": "Door closed and resuming. Restoring from park, if applicable. Reset will throw an alarm.",
  "ALARM:1": "Hard limit has been triggered. Machine position is likely lost due to sudden halt. Re-homing is highly recommended.",
  "ALARM:2": "Soft limit alarm. G-code motion target exceeds machine travel. Machine position retained. Alarm may be safely unlocked, click the Reset Button.",
  "ALARM:3": "Reset while in motion. Machine position is likely lost due to sudden halt. Re-homing is highly recommended.",
  "ALARM:4": "Probe fail. Probe is not in the expected initial state before starting probe cycle.",
  "ALARM:5": "Probe fail. Probe did not contact the workpiece within the programmed travel for G38.2 and G38.4.",
  "ALARM:6": "Homing fail. The active homing cycle was reset.",
  "ALARM:7": "Homing fail. Safety door was opened during homing cycle.",
  "ALARM:8": "Homing fail. Pull off travel failed to clear limit switch. Try increasing pull-off setting or check wiring.",
  "ALARM:9": "Homing fail. Could not find limit switch within search distances. Try increasing max travel, decreasing pull-off distance, or check wiring.",
  "error:1": "G-code words consist of a letter and a value. Letter was not found.",
  "error:2": "Missing the expected G-code word value or numeric value format is not valid.",
  "error:3": "Grbl '$' system command was not recognized or supported.",
  "error:4": "Negative value received for an expected positive value.",
  "error:5": "Homing cycle failure. Homing is not enabled via settings.",
  "error:6": "Minimum step pulse time must be greater than 3usec.",
  "error:7": "An EEPROM read failed. Auto-restoring affected EEPROM to default values.",
  "error:8": "Grbl '$' command cannot be used unless Grbl is IDLE. Ensures smooth operation during a job.",
  "error:9": "G-code commands are locked out during alarm or jog state.",
  "error:10": "Soft limits cannot be enabled without homing also enabled.",
  "error:11": "Max characters per line exceeded. Received command line was not executed.",
  "error:12": "Grbl '$' setting value cause the step rate to exceed the maximum supported.",
  "error:13": "Safety door detected as opened and door state initiated.",
  "error:14": "Build info or startup line exceeded EEPROM line length limit. Line not stored.",
  "error:15": "Jog target exceeds machine travel. Jog command has been ignored.",
  "error:16": "Jog command has no '=' or contains prohibited g-code.",
  "error:17": "Laser mode requires PWM output.",
  "error:20": "Unsupported or invalid g-code command found in block.",
  "error:21": "More than one g-code command from same modal group found in block.",
  "error:22": "Feed rate has not yet been set or is undefined.",
  "error:23": "G-code command in block requires an integer value.",
  "error:24": "More than one g-code command that requires axis words found in block.",
  "error:25": "Repeated g-code word found in block.",
  "error:26": "No axis words found in block for g-code command or current modal state which requires them.",
  "error:27": "Line number value is invalid.",
  "error:28": "G-code command is missing a required value word.",
  "error:29": "G59.x work coordinate systems are not supported.",
  "error:30": "G53 only allowed with G0 and G1 motion modes.",
  "error:31": "Axis words found in block when no command or current modal state uses them.",
  "error:32": "G2 and G3 arcs require at least one in-plane axis word.",
  "error:33": "Motion command target is invalid.",
  "error:34": "Arc radius value is invalid.",
  "error:35": "G2 and G3 arcs require at least one in-plane offset word.",
  "error:36": "Unused value words found in block.",
  "error:37": "G43.1 dynamic tool length offset is not assigned to configured tool length axis.",
  "error:38": "Tool number greater than max supported value.",
  "error:60": "SD failed to mount",
  "error:61": "SD card failed to open file for reading",
  "error:62": "SD card failed to open directory",
  "error:63": "SD Card directory not found",
  "error:64": "SD Card file empty",
  "error:65": "File not found",
  "error:66": "Failed to open file",
  "error:67": "Device is busy",
  "error:68": "Failed to delete directory",
  "error:69": "Failed to delete file",
  "error:70": "Failed to rename file",
  "error:80": "Number out of range for setting",
  "error:81": "Invalid value for setting",
  "error:82": "Failed to create file",
  "error:83": "Failed to format filesystem",
  "error:90": "Failed to send message",
  "error:100": "Failed to store setting",
  "error:101": "Failed to get setting status",
  "error:110": "Authentication failed!",
  "error:111": "End of line",
  "error:112": "End of file",
  "error:113": "System Reset",
  "error:120": "Another interface is busy",
  "error:130": "Jog Cancelled",
  "error:150": "Bad Pin Specification",
  "error:151": "Bad Runtime Config Setting",
  "error:152": "Configuration is invalid. Check boot messages for ERR's.",
  "error:160": "File Upload Failed",
  "error:161": "File Download Failed",
  "error:162": "Read-only setting",
};
//endRemoveIf(en_lang_disabled)
