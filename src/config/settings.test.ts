import {machineSettings, machineSettingsUI} from './machinesettings';

test('spindle type', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  let s = machineSettings.get("/_type");
  expect(s?.value).toBe("PWM")
});

test('flood pin', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  let s = machineSettings.get("/coolant/flood_pin");
  expect(s?.value).toBe("i2so.7")
});

test('PWM atc', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  let s = machineSettings.get("/PWM/atc");
  expect(s?.value).toBe("atc_tool_table")
});

test('PWM direction pin', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  let s = machineSettings.get("/PWM/direction_pin");
  expect(s?.value).toBe("i2so.9")
});

test('kinematics', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  let s = machineSettings.get("/kinematics/_type");
  expect(s?.value).toBe("Cartesian")
});

test('save settings', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  let s = machineSettings.serializeSettings();
  expect(s).toBe(
      `name: Demo
board: ESP32v4
host: demo
meta:
machine: MILL

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

axes:

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    motor0:
      limit_neg_pin: gpio.34
      limit_pos_pin: gpio.35
      limit_all_pin: NO_PIN
      hard_limits: true
      pulloff_mm: 1

      stepstick:
        step_pin: i2so.0
        direction_pin: i2so.1
        disable_pin: NO_PIN
        ms1_pin: NO_PIN
        ms2_pin: NO_PIN
        ms3_pin: NO_PIN
        reset_pin: NO_PIN

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

  y:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: false
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

synchro:
  index_pin: gpio.26

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

sdcard:
  cs_pin: gpio.5
  card_detect_pin: NO_PIN
  frequency_hz: 8000000

oled:
  report_interval_ms: 500
  i2c_num: 0
  i2c_address: 60
  width: 128
  height: 64
  flip: true
  mirror: false
  type: SH1106
  radio_delay_ms: 1000

PWM:
  pwm_hz: 5000
  direction_pin: i2so.9
  output_pin: gpio.15
  enable_pin: NO_PIN
  disable_with_s0: false
  s0_with_disable: true
  spinup_ms: 0
  spindown_ms: 0
  tool_num: 0
  speed_map: 0=0% 750=25% 1500=50% 3000=100%
  off_on_alarm: false
  M6_macro:
  atc: atc_tool_table

atc_tool_table:
`);
});

test('change ATC to manual', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  machineSettings.get("/PWM/atc")?.setValue("atc_manual");
  // machineSettings.get("/atc_manual/safe_z_mpos_mm")?.setValue(60);
  let s = machineSettings.serializeSettings();
  expect(s).toBe(
      `name: Demo
board: ESP32v4
host: demo
meta:
machine: MILL

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

axes:

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    motor0:
      limit_neg_pin: gpio.34
      limit_pos_pin: gpio.35
      limit_all_pin: NO_PIN
      hard_limits: true
      pulloff_mm: 1

      stepstick:
        step_pin: i2so.0
        direction_pin: i2so.1
        disable_pin: NO_PIN
        ms1_pin: NO_PIN
        ms2_pin: NO_PIN
        ms3_pin: NO_PIN
        reset_pin: NO_PIN

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

  y:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: false
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

synchro:
  index_pin: gpio.26

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

sdcard:
  cs_pin: gpio.5
  card_detect_pin: NO_PIN
  frequency_hz: 8000000

oled:
  report_interval_ms: 500
  i2c_num: 0
  i2c_address: 60
  width: 128
  height: 64
  flip: true
  mirror: false
  type: SH1106
  radio_delay_ms: 1000

PWM:
  pwm_hz: 5000
  direction_pin: i2so.9
  output_pin: gpio.15
  enable_pin: NO_PIN
  disable_with_s0: false
  s0_with_disable: true
  spinup_ms: 0
  spindown_ms: 0
  tool_num: 0
  speed_map: 0=0% 750=25% 1500=50% 3000=100%
  off_on_alarm: false
  M6_macro:
  atc: atc_manual

atc_manual:
  safe_z_mpos_mm: 50
  probe_seek_rate_mm_per_min: 200
  probe_feed_rate_mm_per_min: 80
  change_mpos_mm: 0, 0, 0
  ets_mpos_mm: 0, 0, 0
  ets_rapid_z_mpos_mm: 0
`);
});

test('switch spindle type', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  machineSettings.get("/_type")?.setValue("PWM");
  machineSettings.get("/PWM/direction_pin")?.setValue("i2so.10");
  machineSettings.get("/_type")?.setValue("H100");
  machineSettings.get("/H100/uart_num")?.setValue("2");
  let s = machineSettings.serializeSettings();
  expect(s).toBe(
      `name: Demo
board: ESP32v4
host: demo
meta:
machine: MILL

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

axes:

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    motor0:
      limit_neg_pin: gpio.34
      limit_pos_pin: gpio.35
      limit_all_pin: NO_PIN
      hard_limits: true
      pulloff_mm: 1

      stepstick:
        step_pin: i2so.0
        direction_pin: i2so.1
        disable_pin: NO_PIN
        ms1_pin: NO_PIN
        ms2_pin: NO_PIN
        ms3_pin: NO_PIN
        reset_pin: NO_PIN

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

  y:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: false
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

synchro:
  index_pin: gpio.26

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

sdcard:
  cs_pin: gpio.5
  card_detect_pin: NO_PIN
  frequency_hz: 8000000

oled:
  report_interval_ms: 500
  i2c_num: 0
  i2c_address: 60
  width: 128
  height: 64
  flip: true
  mirror: false
  type: SH1106
  radio_delay_ms: 1000

H100:
  uart_num: 2
  modbus_id: 1
  spinup_ms: 0
  spindown_ms: 0
  tool_num: 0
  speed_map: 0=0% 750=25% 1500=50% 3000=100%
  off_on_alarm: false
  M6_macro:
  atc: atc_tool_table

atc_tool_table:
`);
});

test('change x axis driver', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  machineSettings.get("/axes/x/motor0/_type")?.setValue("standard_stepper");
  let s = machineSettings.serializeSettings();
  expect(s).toBe(
      `name: Demo
board: ESP32v4
host: demo
meta:
machine: MILL

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

axes:

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    motor0:
      limit_neg_pin: gpio.34
      limit_pos_pin: gpio.35
      limit_all_pin: NO_PIN
      hard_limits: true
      pulloff_mm: 1

      standard_stepper:
        step_pin: i2so.0
        direction_pin: i2so.1
        disable_pin: NO_PIN

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

  y:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: false
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

synchro:
  index_pin: gpio.26

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

sdcard:
  cs_pin: gpio.5
  card_detect_pin: NO_PIN
  frequency_hz: 8000000

oled:
  report_interval_ms: 500
  i2c_num: 0
  i2c_address: 60
  width: 128
  height: 64
  flip: true
  mirror: false
  type: SH1106
  radio_delay_ms: 1000

PWM:
  pwm_hz: 5000
  direction_pin: i2so.9
  output_pin: gpio.15
  enable_pin: NO_PIN
  disable_with_s0: false
  s0_with_disable: true
  spinup_ms: 0
  spindown_ms: 0
  tool_num: 0
  speed_map: 0=0% 750=25% 1500=50% 3000=100%
  off_on_alarm: false
  M6_macro:
  atc: atc_tool_table

atc_tool_table:
`);
});

test('change coordinate system', () => {
  machineSettings.settings = machineSettings.parseSettings(settingsText, "tree")
  let kinematics = machineSettings.get("/kinematics/_type");
  kinematics?.setValue("Cartesian");
  let s = machineSettings.serializeSettings();
  expect(s).toBe(
      `name: Demo
board: ESP32v4
host: demo
meta:
machine: MILL

kinematics:

  Cartesian:

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

axes:

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    motor0:
      limit_neg_pin: gpio.34
      limit_pos_pin: gpio.35
      limit_all_pin: NO_PIN
      hard_limits: true
      pulloff_mm: 1

      stepstick:
        step_pin: i2so.0
        direction_pin: i2so.1
        disable_pin: NO_PIN
        ms1_pin: NO_PIN
        ms2_pin: NO_PIN
        ms3_pin: NO_PIN
        reset_pin: NO_PIN

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

  y:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: false
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

synchro:
  index_pin: gpio.26

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

sdcard:
  cs_pin: gpio.5
  card_detect_pin: NO_PIN
  frequency_hz: 8000000

oled:
  report_interval_ms: 500
  i2c_num: 0
  i2c_address: 60
  width: 128
  height: 64
  flip: true
  mirror: false
  type: SH1106
  radio_delay_ms: 1000

PWM:
  pwm_hz: 5000
  direction_pin: i2so.9
  output_pin: gpio.15
  enable_pin: NO_PIN
  disable_with_s0: false
  s0_with_disable: true
  spinup_ms: 0
  spindown_ms: 0
  tool_num: 0
  speed_map: 0=0% 750=25% 1500=50% 3000=100%
  off_on_alarm: false
  M6_macro:
  atc: atc_tool_table

atc_tool_table:
`);
});

test('UI', () => {
  machineSettings.parseSettings(settingsText, "tree")
  machineSettingsUI.createPanes()
});

let settingsText = `{"EEPROM":[ {"F":"nvs", "P":"Notification/Type", "H":"Notification/Type", "T":"B", "V":"0", "O":[ {"EMAIL":"2" }, {"LINE":"3" }, {"NONE":"0" }, {"PUSHOVER":"1" } ] }, {"F":"nvs", "P":"Notification/T1", "H":"Notification/T1", "T":"S", "V":"", "S":"63", "M":"0" }, {"F":"nvs", "P":"Notification/T2", "H":"Notification/T2", "T":"S", "V":"", "S":"63", "M":"0" }, {"F":"nvs", "P":"Notification/TS", "H":"Notification/TS", "T":"S", "V":"", "S":"127", "M":"0" }, {"F":"nvs", "P":"Telnet/Enable", "H":"Telnet/Enable", "T":"B", "V":"1", "O":[ {"OFF":"0" }, {"ON":"1" } ] }, {"F":"nvs", "P":"Telnet/Port", "H":"Telnet/Port", "T":"I", "V":"23", "S":"65001", "M":"1" }, {"F":"nvs", "P":"HTTP/BlockDuringMotion", "H":"HTTP/BlockDuringMotion", "T":"B", "V":"1", "O":[ {"OFF":"0" }, {"ON":"1" } ] }, {"F":"nvs", "P":"HTTP/Enable", "H":"HTTP/Enable", "T":"B", "V":"1", "O":[ {"OFF":"0" }, {"ON":"1" } ] }, {"F":"nvs", "P":"HTTP/Port", "H":"HTTP/Port", "T":"I", "V":"80", "S":"65001", "M":"1" }, {"F":"nvs", "P":"MDNS/Enable", "H":"MDNS/Enable", "T":"B", "V":"1", "O":[ {"OFF":"0" }, {"ON":"1" } ] }, {"F":"nvs", "P":"AP/Country", "H":"AP/Country", "T":"B", "V":"0", "O":[ {"01":"0" }, {"AT":"1" }, {"AU":"2" }, {"BE":"3" }, {"BG":"4" }, {"BR":"5" }, {"CA":"6" }, {"CH":"7" }, {"CN":"8" }, {"CY":"9" }, {"CZ":"10" }, {"DE":"11" }, {"DK":"12" }, {"EE":"13" }, {"ES":"14" }, {"FI":"15" }, {"FR":"16" }, {"GB":"17" }, {"GR":"18" }, {"HK":"19" }, {"HR":"20" }, {"HU":"21" }, {"IE":"22" }, {"IN":"23" }, {"IS":"24" }, {"IT":"25" }, {"JP":"26" }, {"KR":"27" }, {"LI":"28" }, {"LT":"29" }, {"LU":"30" }, {"LV":"31" }, {"MT":"32" }, {"MX":"33" }, {"NL":"34" }, {"NO":"35" }, {"NZ":"36" }, {"PL":"37" }, {"PT":"38" }, {"RO":"39" }, {"SE":"40" }, {"SI":"41" }, {"SK":"42" }, {"TW":"43" }, {"US":"44" } ] }, {"F":"nvs", "P":"AP/SSID", "H":"AP/SSID", "T":"S", "V":"FluidNC", "S":"32", "M":"0" }, {"F":"nvs", "P":"AP/Password", "H":"AP/Password", "T":"S", "V":"********", "S":"64", "M":"8" }, {"F":"nvs", "P":"AP/IP", "H":"AP/IP", "T":"A", "V":"192.168.0.1" }, {"F":"nvs", "P":"AP/Channel", "H":"AP/Channel", "T":"I", "V":"1", "S":"14", "M":"1" }, {"F":"nvs", "P":"Sta/Password", "H":"Sta/Password", "T":"S", "V":"********", "S":"64", "M":"8" }, {"F":"nvs", "P":"Sta/MinSecurity", "H":"Sta/MinSecurity", "T":"B", "V":"3", "O":[ {"OPEN":"0" }, {"WEP":"1" }, {"WPA-PSK":"2" }, {"WPA-WPA2-PSK":"4" }, {"WPA2-ENTERPRISE":"5" }, {"WPA2-PSK":"3" } ] }, {"F":"nvs", "P":"Sta/Netmask", "H":"Sta/Netmask", "T":"A", "V":"255.255.255.0" }, {"F":"nvs", "P":"Sta/Gateway", "H":"Sta/Gateway", "T":"A", "V":"10.0.0.1" }, {"F":"nvs", "P":"Sta/IP", "H":"Sta/IP", "T":"A", "V":"10.0.0.121" }, {"F":"nvs", "P":"Sta/IPMode", "H":"Sta/IPMode", "T":"B", "V":"0", "O":[ {"DHCP":"0" }, {"Static":"1" } ] }, {"F":"nvs", "P":"Sta/SSID", "H":"Sta/SSID", "T":"S", "V":"superhawk", "S":"32", "M":"0" }, {"F":"nvs", "P":"WiFi/PsMode", "H":"WiFi/PsMode", "T":"B", "V":"0", "O":[ {"Max":"2" }, {"Min":"1" }, {"None":"0" } ] }, {"F":"nvs", "P":"WiFi/Mode", "H":"WiFi/Mode", "T":"B", "V":"1", "O":[ {"AP":"2" }, {"Off":"0" }, {"STA":"1" }, {"STA>AP":"3" } ] }, {"F":"nvs", "P":"WiFi/FastScan", "H":"WiFi/FastScan", "T":"B", "V":"1", "O":[ {"OFF":"0" }, {"ON":"1" } ] }, {"F":"nvs", "P":"Hostname", "H":"Hostname", "T":"S", "V":"demo", "S":"32", "M":"1" }, {"F":"nvs", "P":"GCode/Echo", "H":"GCode/Echo", "T":"B", "V":"0", "O":[ {"OFF":"0" }, {"ON":"1" } ] }, {"F":"nvs", "P":"Start/Message", "H":"Start/Message", "T":"S", "V":"Grbl \\\\V [FluidNC \\\\B (\\\\R) \\\\H]", "S":"40", "M":"0" }, {"F":"nvs", "P":"Firmware/Build", "H":"Firmware/Build", "T":"S", "V":"", "S":"20", "M":"0" }, {"F":"nvs", "P":"SD/FallbackCS", "H":"SD/FallbackCS", "T":"I", "V":"-1", "S":"40", "M":"-1" }, {"F":"nvs", "P":"Report/Status", "H":"Report/Status", "T":"I", "V":"1", "S":"3", "M":"0" }, {"F":"nvs", "P":"Config/Filename", "H":"Config/Filename", "T":"S", "V":"config.yaml", "S":"50", "M":"1" }, {"F":"nvs", "P":"Message/Level", "H":"Message/Level", "T":"B", "V":"3", "O":[ {"Debug":"4" }, {"Error":"1" }, {"Info":"3" }, {"None":"0" }, {"Verbose":"5" }, {"Warning":"2" } ] }, {"F":"tree", "P":"/board", "H":"/board", "T":"S", "V":"ESP32v4", "S":"255", "M":"0" }, {"F":"tree", "P":"/name", "H":"/name", "T":"S", "V":"Demo", "S":"255", "M":"0" }, {"F":"tree", "P":"/meta", "H":"/meta", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/machine", "H":"/machine", "T":"S", "V":"MILL", "S":"255", "M":"0" }, {"F":"tree", "P":"/host", "H":"/host", "T":"S", "V":"demo", "S":"255", "M":"0" }, {"F":"tree", "P":"/stepping/engine", "H":"/stepping/engine", "T":"B", "V":"2", "O":[ {"Timed":"0" }, {"RMT":"1" }, {"I2S_STATIC":"2" }, {"I2S_STREAM":"3" } ] }, {"F":"tree", "P":"/stepping/idle_ms", "H":"/stepping/idle_ms", "T":"I", "V":"250", "S":"10000000", "M":"0" }, {"F":"tree", "P":"/stepping/pulse_us", "H":"/stepping/pulse_us", "T":"I", "V":"6", "S":"30", "M":"0" }, {"F":"tree", "P":"/stepping/dir_delay_us", "H":"/stepping/dir_delay_us", "T":"I", "V":"1", "S":"10", "M":"0" }, {"F":"tree", "P":"/stepping/disable_delay_us", "H":"/stepping/disable_delay_us", "T":"I", "V":"0", "S":"1000000", "M":"0" }, {"F":"tree", "P":"/stepping/segments", "H":"/stepping/segments", "T":"I", "V":"12", "S":"20", "M":"6" }, {"F":"tree", "P":"/i2so/bck_pin", "H":"/i2so/bck_pin", "T":"S", "V":"gpio.27", "S":"255", "M":"0" }, {"F":"tree", "P":"/i2so/data_pin", "H":"/i2so/data_pin", "T":"S", "V":"gpio.13", "S":"255", "M":"0" }, {"F":"tree", "P":"/i2so/ws_pin", "H":"/i2so/ws_pin", "T":"S", "V":"gpio.14", "S":"255", "M":"0" }, {"F":"tree", "P":"/i2c0/sda_pin", "H":"/i2c0/sda_pin", "T":"S", "V":"gpio.22", "S":"255", "M":"0" }, {"F":"tree", "P":"/i2c0/scl_pin", "H":"/i2c0/scl_pin", "T":"S", "V":"gpio.21", "S":"255", "M":"0" }, {"F":"tree", "P":"/i2c0/frequency", "H":"/i2c0/frequency", "T":"I", "V":"100000", "S":"-1", "M":"0" }, {"F":"tree", "P":"/spi/miso_pin", "H":"/spi/miso_pin", "T":"S", "V":"gpio.19", "S":"255", "M":"0" }, {"F":"tree", "P":"/spi/mosi_pin", "H":"/spi/mosi_pin", "T":"S", "V":"gpio.23", "S":"255", "M":"0" }, {"F":"tree", "P":"/spi/sck_pin", "H":"/spi/sck_pin", "T":"S", "V":"gpio.18", "S":"255", "M":"0" }, {"F":"tree", "P":"/sdcard/cs_pin", "H":"/sdcard/cs_pin", "T":"S", "V":"gpio.5", "S":"255", "M":"0" }, {"F":"tree", "P":"/sdcard/card_detect_pin", "H":"/sdcard/card_detect_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/sdcard/frequency_hz", "H":"/sdcard/frequency_hz", "T":"I", "V":"8000000", "S":"20000000", "M":"400000" }, {"F":"tree", "P":"/axes/shared_stepper_disable_pin", "H":"/axes/shared_stepper_disable_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/shared_stepper_reset_pin", "H":"/axes/shared_stepper_reset_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/homing_runs", "H":"/axes/homing_runs", "T":"I", "V":"2", "S":"5", "M":"1" }, {"F":"tree", "P":"/axes/x/steps_per_mm", "H":"/axes/x/steps_per_mm", "T":"R", "V":"500.000" }, {"F":"tree", "P":"/axes/x/max_rate_mm_per_min", "H":"/axes/x/max_rate_mm_per_min", "T":"R", "V":"1500.000" }, {"F":"tree", "P":"/axes/x/acceleration_mm_per_sec2", "H":"/axes/x/acceleration_mm_per_sec2", "T":"R", "V":"500.000" }, {"F":"tree", "P":"/axes/x/max_travel_mm", "H":"/axes/x/max_travel_mm", "T":"R", "V":"1000.000" }, {"F":"tree", "P":"/axes/x/soft_limits", "H":"/axes/x/soft_limits", "T":"B", "V":"1", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/x/mpg/a_pin", "H":"/axes/x/mpg/a_pin", "T":"S", "V":"gpio.32", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/mpg/b_pin", "H":"/axes/x/mpg/b_pin", "T":"S", "V":"gpio.33", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/mpg/reverse", "H":"/axes/x/mpg/reverse", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/x/mpg/pulses_per_rev", "H":"/axes/x/mpg/pulses_per_rev", "T":"I", "V":"1000", "S":"-1", "M":"0" }, {"F":"tree", "P":"/axes/x/mpg/max_rpm", "H":"/axes/x/mpg/max_rpm", "T":"R", "V":"250.000" }, {"F":"tree", "P":"/axes/x/mpg/max_rate_factor", "H":"/axes/x/mpg/max_rate_factor", "T":"R", "V":"0.750" }, {"F":"tree", "P":"/axes/x/motor0/limit_neg_pin", "H":"/axes/x/motor0/limit_neg_pin", "T":"S", "V":"gpio.34", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/limit_pos_pin", "H":"/axes/x/motor0/limit_pos_pin", "T":"S", "V":"gpio.35", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/limit_all_pin", "H":"/axes/x/motor0/limit_all_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/hard_limits", "H":"/axes/x/motor0/hard_limits", "T":"B", "V":"1", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/x/motor0/pulloff_mm", "H":"/axes/x/motor0/pulloff_mm", "T":"R", "V":"1.000" }, {"F":"tree", "P":"/axes/x/motor0/stepstick/step_pin", "H":"/axes/x/motor0/stepstick/step_pin", "T":"S", "V":"I2SO.0", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/stepstick/direction_pin", "H":"/axes/x/motor0/stepstick/direction_pin", "T":"S", "V":"I2SO.1", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/stepstick/disable_pin", "H":"/axes/x/motor0/stepstick/disable_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/stepstick/ms1_pin", "H":"/axes/x/motor0/stepstick/ms1_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/stepstick/ms2_pin", "H":"/axes/x/motor0/stepstick/ms2_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/stepstick/ms3_pin", "H":"/axes/x/motor0/stepstick/ms3_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/x/motor0/stepstick/reset_pin", "H":"/axes/x/motor0/stepstick/reset_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/y/steps_per_mm", "H":"/axes/y/steps_per_mm", "T":"R", "V":"500.000" }, {"F":"tree", "P":"/axes/y/max_rate_mm_per_min", "H":"/axes/y/max_rate_mm_per_min", "T":"R", "V":"1500.000" }, {"F":"tree", "P":"/axes/y/acceleration_mm_per_sec2", "H":"/axes/y/acceleration_mm_per_sec2", "T":"R", "V":"500.000" }, {"F":"tree", "P":"/axes/y/max_travel_mm", "H":"/axes/y/max_travel_mm", "T":"R", "V":"1000.000" }, {"F":"tree", "P":"/axes/y/soft_limits", "H":"/axes/y/soft_limits", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/y/homing/cycle", "H":"/axes/y/homing/cycle", "T":"I", "V":"0", "S":"6", "M":"-1" }, {"F":"tree", "P":"/axes/y/homing/allow_single_axis", "H":"/axes/y/homing/allow_single_axis", "T":"B", "V":"1", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/y/homing/positive_direction", "H":"/axes/y/homing/positive_direction", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/y/homing/mpos_mm", "H":"/axes/y/homing/mpos_mm", "T":"R", "V":"0.000" }, {"F":"tree", "P":"/axes/y/homing/feed_mm_per_min", "H":"/axes/y/homing/feed_mm_per_min", "T":"R", "V":"50.000" }, {"F":"tree", "P":"/axes/y/homing/seek_mm_per_min", "H":"/axes/y/homing/seek_mm_per_min", "T":"R", "V":"200.000" }, {"F":"tree", "P":"/axes/y/homing/settle_ms", "H":"/axes/y/homing/settle_ms", "T":"I", "V":"250", "S":"1000", "M":"0" }, {"F":"tree", "P":"/axes/y/homing/seek_scaler", "H":"/axes/y/homing/seek_scaler", "T":"R", "V":"1.100" }, {"F":"tree", "P":"/axes/y/homing/feed_scaler", "H":"/axes/y/homing/feed_scaler", "T":"R", "V":"1.100" }, {"F":"tree", "P":"/axes/y/motor0/limit_neg_pin", "H":"/axes/y/motor0/limit_neg_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/y/motor0/limit_pos_pin", "H":"/axes/y/motor0/limit_pos_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/y/motor0/limit_all_pin", "H":"/axes/y/motor0/limit_all_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/y/motor0/hard_limits", "H":"/axes/y/motor0/hard_limits", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/y/motor0/pulloff_mm", "H":"/axes/y/motor0/pulloff_mm", "T":"R", "V":"1.000" }, {"F":"tree", "P":"/axes/z/steps_per_mm", "H":"/axes/z/steps_per_mm", "T":"R", "V":"500.000" }, {"F":"tree", "P":"/axes/z/max_rate_mm_per_min", "H":"/axes/z/max_rate_mm_per_min", "T":"R", "V":"1500.000" }, {"F":"tree", "P":"/axes/z/acceleration_mm_per_sec2", "H":"/axes/z/acceleration_mm_per_sec2", "T":"R", "V":"500.000" }, {"F":"tree", "P":"/axes/z/max_travel_mm", "H":"/axes/z/max_travel_mm", "T":"R", "V":"1000.000" }, {"F":"tree", "P":"/axes/z/soft_limits", "H":"/axes/z/soft_limits", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/z/motor0/limit_neg_pin", "H":"/axes/z/motor0/limit_neg_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/z/motor0/limit_pos_pin", "H":"/axes/z/motor0/limit_pos_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/z/motor0/limit_all_pin", "H":"/axes/z/motor0/limit_all_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/axes/z/motor0/hard_limits", "H":"/axes/z/motor0/hard_limits", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/axes/z/motor0/pulloff_mm", "H":"/axes/z/motor0/pulloff_mm", "T":"R", "V":"1.000" }, {"F":"tree", "P":"/control/safety_door_pin", "H":"/control/safety_door_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/reset_pin", "H":"/control/reset_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/feed_hold_pin", "H":"/control/feed_hold_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/cycle_start_pin", "H":"/control/cycle_start_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/macro0_pin", "H":"/control/macro0_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/macro1_pin", "H":"/control/macro1_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/macro2_pin", "H":"/control/macro2_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/macro3_pin", "H":"/control/macro3_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/fault_pin", "H":"/control/fault_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/control/estop_pin", "H":"/control/estop_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/coolant/flood_pin", "H":"/coolant/flood_pin", "T":"S", "V":"I2SO.7", "S":"255", "M":"0" }, {"F":"tree", "P":"/coolant/mist_pin", "H":"/coolant/mist_pin", "T":"S", "V":"I2SO.8", "S":"255", "M":"0" }, {"F":"tree", "P":"/coolant/delay_ms", "H":"/coolant/delay_ms", "T":"I", "V":"0", "S":"10000", "M":"0" }, {"F":"tree", "P":"/probe/pin", "H":"/probe/pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/probe/toolsetter_pin", "H":"/probe/toolsetter_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/probe/check_mode_start", "H":"/probe/check_mode_start", "T":"B", "V":"1", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/probe/hard_stop", "H":"/probe/hard_stop", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/macros/startup_line0", "H":"/macros/startup_line0", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/macros/startup_line1", "H":"/macros/startup_line1", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/macros/Macro0", "H":"/macros/Macro0", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/macros/Macro1", "H":"/macros/Macro1", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/macros/Macro2", "H":"/macros/Macro2", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/macros/Macro3", "H":"/macros/Macro3", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/macros/after_homing", "H":"/macros/after_homing", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/macros/after_reset", "H":"/macros/after_reset", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/macros/after_unlock", "H":"/macros/after_unlock", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/start/must_home", "H":"/start/must_home", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/start/deactivate_parking", "H":"/start/deactivate_parking", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/start/check_limits", "H":"/start/check_limits", "T":"B", "V":"1", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/parking/enable", "H":"/parking/enable", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/parking/axis", "H":"/parking/axis", "T":"B", "V":"2", "O":[ {"X":"0" }, {"Y":"1" }, {"Z":"2" }, {"A":"3" }, {"B":"4" }, {"C":"5" } ] }, {"F":"tree", "P":"/parking/target_mpos_mm", "H":"/parking/target_mpos_mm", "T":"R", "V":"-5.000" }, {"F":"tree", "P":"/parking/rate_mm_per_min", "H":"/parking/rate_mm_per_min", "T":"R", "V":"800.000" }, {"F":"tree", "P":"/parking/pullout_distance_mm", "H":"/parking/pullout_distance_mm", "T":"R", "V":"5.000" }, {"F":"tree", "P":"/parking/pullout_rate_mm_per_min", "H":"/parking/pullout_rate_mm_per_min", "T":"R", "V":"250.000" }, {"F":"tree", "P":"/user_outputs/analog0_pin", "H":"/user_outputs/analog0_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/analog1_pin", "H":"/user_outputs/analog1_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/analog2_pin", "H":"/user_outputs/analog2_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/analog3_pin", "H":"/user_outputs/analog3_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/analog0_hz", "H":"/user_outputs/analog0_hz", "T":"I", "V":"5000", "S":"20000000", "M":"1" }, {"F":"tree", "P":"/user_outputs/analog1_hz", "H":"/user_outputs/analog1_hz", "T":"I", "V":"5000", "S":"20000000", "M":"1" }, {"F":"tree", "P":"/user_outputs/analog2_hz", "H":"/user_outputs/analog2_hz", "T":"I", "V":"5000", "S":"20000000", "M":"1" }, {"F":"tree", "P":"/user_outputs/analog3_hz", "H":"/user_outputs/analog3_hz", "T":"I", "V":"5000", "S":"20000000", "M":"1" }, {"F":"tree", "P":"/user_outputs/digital0_pin", "H":"/user_outputs/digital0_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/digital1_pin", "H":"/user_outputs/digital1_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/digital2_pin", "H":"/user_outputs/digital2_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/digital3_pin", "H":"/user_outputs/digital3_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/digital4_pin", "H":"/user_outputs/digital4_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/digital5_pin", "H":"/user_outputs/digital5_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/digital6_pin", "H":"/user_outputs/digital6_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_outputs/digital7_pin", "H":"/user_outputs/digital7_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/analog0_pin", "H":"/user_inputs/analog0_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/analog1_pin", "H":"/user_inputs/analog1_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/analog2_pin", "H":"/user_inputs/analog2_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/analog3_pin", "H":"/user_inputs/analog3_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/digital0_pin", "H":"/user_inputs/digital0_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/digital1_pin", "H":"/user_inputs/digital1_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/digital2_pin", "H":"/user_inputs/digital2_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/digital3_pin", "H":"/user_inputs/digital3_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/digital4_pin", "H":"/user_inputs/digital4_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/digital5_pin", "H":"/user_inputs/digital5_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/digital6_pin", "H":"/user_inputs/digital6_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/user_inputs/digital7_pin", "H":"/user_inputs/digital7_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/synchro/index_pin", "H":"/synchro/index_pin", "T":"S", "V":"gpio.26", "S":"255", "M":"0" }, {"F":"tree", "P":"/oled/report_interval_ms", "H":"/oled/report_interval_ms", "T":"I", "V":"500", "S":"5000", "M":"100" }, {"F":"tree", "P":"/oled/i2c_num", "H":"/oled/i2c_num", "T":"I", "V":"0", "S":"255", "M":"0" }, {"F":"tree", "P":"/oled/i2c_address", "H":"/oled/i2c_address", "T":"I", "V":"60", "S":"255", "M":"0" }, {"F":"tree", "P":"/oled/width", "H":"/oled/width", "T":"I", "V":"128", "S":"2147483647", "M":"0" }, {"F":"tree", "P":"/oled/height", "H":"/oled/height", "T":"I", "V":"64", "S":"2147483647", "M":"0" }, {"F":"tree", "P":"/oled/flip", "H":"/oled/flip", "T":"B", "V":"1", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/oled/mirror", "H":"/oled/mirror", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/oled/type", "H":"/oled/type", "T":"S", "V":"SH1106", "S":"255", "M":"0" }, {"F":"tree", "P":"/oled/radio_delay_ms", "H":"/oled/radio_delay_ms", "T":"I", "V":"1000", "S":"2147483647", "M":"0" }, {"F":"tree", "P":"/PWM/pwm_hz", "H":"/PWM/pwm_hz", "T":"I", "V":"5000", "S":"20000000", "M":"1" }, {"F":"tree", "P":"/PWM/direction_pin", "H":"/PWM/direction_pin", "T":"S", "V":"I2SO.9", "S":"255", "M":"0" }, {"F":"tree", "P":"/PWM/output_pin", "H":"/PWM/output_pin", "T":"S", "V":"gpio.15", "S":"255", "M":"0" }, {"F":"tree", "P":"/PWM/enable_pin", "H":"/PWM/enable_pin", "T":"S", "V":"NO_PIN", "S":"255", "M":"0" }, {"F":"tree", "P":"/PWM/disable_with_s0", "H":"/PWM/disable_with_s0", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/PWM/s0_with_disable", "H":"/PWM/s0_with_disable", "T":"B", "V":"1", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/PWM/spinup_ms", "H":"/PWM/spinup_ms", "T":"I", "V":"0", "S":"60000", "M":"0" }, {"F":"tree", "P":"/PWM/spindown_ms", "H":"/PWM/spindown_ms", "T":"I", "V":"0", "S":"60000", "M":"0" }, {"F":"tree", "P":"/PWM/tool_num", "H":"/PWM/tool_num", "T":"I", "V":"0", "S":"99999999", "M":"0" }, {"F":"tree", "P":"/PWM/off_on_alarm", "H":"/PWM/off_on_alarm", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/PWM/atc", "H":"/PWM/atc", "T":"S", "V":"atc_tool_table", "S":"255", "M":"0" }, {"F":"tree", "P":"/PWM/m6_macro", "H":"/PWM/m6_macro", "T":"S", "V":"", "S":"255", "M":"0" }, {"F":"tree", "P":"/arc_tolerance_mm", "H":"/arc_tolerance_mm", "T":"R", "V":"0.002" }, {"F":"tree", "P":"/junction_deviation_mm", "H":"/junction_deviation_mm", "T":"R", "V":"0.010" }, {"F":"tree", "P":"/verbose_errors", "H":"/verbose_errors", "T":"B", "V":"1", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/report_inches", "H":"/report_inches", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/enable_parking_override_control", "H":"/enable_parking_override_control", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/use_line_numbers", "H":"/use_line_numbers", "T":"B", "V":"0", "O":[ {"False":"0" }, {"True":"1" } ] }, {"F":"tree", "P":"/planner_blocks", "H":"/planner_blocks", "T":"I", "V":"16", "S":"120", "M":"10" } ] }`