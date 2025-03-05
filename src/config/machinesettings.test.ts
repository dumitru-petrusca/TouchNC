import {MachineSettings, machineSettings, machineSettingsUI} from './machinesettings';
import {configYaml} from './yaml.test';
import {getElement, panel} from '../ui/ui';
import {SettingsUI} from './settingsui';

test('spindle type', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  let s = machineSettings.get("/_type");
  expect(s?.value).toBe("PWM")
});

test('flood pin', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  let s = machineSettings.get("/coolant/flood_pin");
  expect(s?.value).toBe("i2so.7")
});

test('PWM atc', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  let s = machineSettings.get("/PWM/atc");
  expect(s?.value).toBe("atc_manual")
});

test('PWM direction pin', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  let s = machineSettings.get("/PWM/direction_pin");
  expect(s?.value).toBe("i2so.9")
});

test('pin with direction', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  let s = machineSettings.get("/axes/x/motor0/limit_neg_pin");
  expect(s?.value).toBe("gpio.34:low")
});

test('kinematics', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  let s = machineSettings.get("/kinematics/_type");
  expect(s?.value).toBe("Cartesian")
});

test('save settings', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  let s = machineSettings.serializeSettings();
  expect(s).toBe(configYaml);
});

test('change ATC to tool table', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  machineSettings.get("/PWM/atc")!.setValue("atc_tool_table");
  // machineSettings.get("/atc_manual/safe_z_mpos_mm")?.setValue(60);
  let s = machineSettings.serializeSettings();
  expect(s).toBe(
      `name: Demo
board: ESP32v4
host: demo
meta:
machine: MILL
arc_tolerance_mm: 0.002
junction_deviation_mm: 0.01
verbose_errors: true
report_inches: false
enable_parking_override_control: false
use_line_numbers: false
planner_blocks: 16

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

probe:
  pin: NO_PIN
  toolsetter_pin: NO_PIN
  check_mode_start: true
  hard_stop: false

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

kinematics:

  Cartesian:

axes:
  shared_stepper_disable_pin: NO_PIN
  shared_stepper_reset_pin: NO_PIN
  homing_runs: 2

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: true
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

    motor0:
      limit_neg_pin: gpio.34:low
      limit_pos_pin: gpio.35:low
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

    motor0:
      limit_neg_pin: NO_PIN
      limit_pos_pin: NO_PIN
      limit_all_pin: NO_PIN
      hard_limits: false
      pulloff_mm: 1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    motor0:
      limit_neg_pin: NO_PIN
      limit_pos_pin: NO_PIN
      limit_all_pin: NO_PIN
      hard_limits: false
      pulloff_mm: 1

synchro:
  index_pin: gpio.26

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

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
  m6_macro:
  atc: atc_tool_table

atc_tool_table:
`);
});

test('switch spindle type', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
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
arc_tolerance_mm: 0.002
junction_deviation_mm: 0.01
verbose_errors: true
report_inches: false
enable_parking_override_control: false
use_line_numbers: false
planner_blocks: 16

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

probe:
  pin: NO_PIN
  toolsetter_pin: NO_PIN
  check_mode_start: true
  hard_stop: false

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

kinematics:

  Cartesian:

axes:
  shared_stepper_disable_pin: NO_PIN
  shared_stepper_reset_pin: NO_PIN
  homing_runs: 2

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: true
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

    motor0:
      limit_neg_pin: gpio.34:low
      limit_pos_pin: gpio.35:low
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

    motor0:
      limit_neg_pin: NO_PIN
      limit_pos_pin: NO_PIN
      limit_all_pin: NO_PIN
      hard_limits: false
      pulloff_mm: 1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    motor0:
      limit_neg_pin: NO_PIN
      limit_pos_pin: NO_PIN
      limit_all_pin: NO_PIN
      hard_limits: false
      pulloff_mm: 1

synchro:
  index_pin: gpio.26

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

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
  m6_macro:
  atc: atc_manual

atc_manual:
  safe_z_mpos_mm: 50
  probe_seek_rate_mm_per_min: 200
  probe_feed_rate_mm_per_min: 80
  change_mpos_mm: 0, 0, 0
  ets_mpos_mm: 100
  ets_rapid_z_mpos_mm: 0
`);
});

test('change x axis driver', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  machineSettings.get("/axes/x/motor0/_type")?.setValue("standard_stepper");
  let s = machineSettings.serializeSettings();
  expect(s).toBe(
      `name: Demo
board: ESP32v4
host: demo
meta:
machine: MILL
arc_tolerance_mm: 0.002
junction_deviation_mm: 0.01
verbose_errors: true
report_inches: false
enable_parking_override_control: false
use_line_numbers: false
planner_blocks: 16

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

probe:
  pin: NO_PIN
  toolsetter_pin: NO_PIN
  check_mode_start: true
  hard_stop: false

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

kinematics:

  Cartesian:

axes:
  shared_stepper_disable_pin: NO_PIN
  shared_stepper_reset_pin: NO_PIN
  homing_runs: 2

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: true
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

    motor0:
      limit_neg_pin: gpio.34:low
      limit_pos_pin: gpio.35:low
      limit_all_pin: NO_PIN
      hard_limits: true
      pulloff_mm: 1

      standard_stepper:
        step_pin: i2so.0
        direction_pin: i2so.1
        disable_pin: NO_PIN

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

    motor0:
      limit_neg_pin: NO_PIN
      limit_pos_pin: NO_PIN
      limit_all_pin: NO_PIN
      hard_limits: false
      pulloff_mm: 1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    motor0:
      limit_neg_pin: NO_PIN
      limit_pos_pin: NO_PIN
      limit_all_pin: NO_PIN
      hard_limits: false
      pulloff_mm: 1

synchro:
  index_pin: gpio.26

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

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
  m6_macro:
  atc: atc_manual

atc_manual:
  safe_z_mpos_mm: 50
  probe_seek_rate_mm_per_min: 200
  probe_feed_rate_mm_per_min: 80
  change_mpos_mm: 0, 0, 0
  ets_mpos_mm: 100
  ets_rapid_z_mpos_mm: 0
`);
});

test('change coordinate system', () => {
  machineSettings.settings = machineSettings.parseSettings(configYaml)
  let kinematics = machineSettings.get("/kinematics/_type");
  kinematics?.setValue("parallel_delta");
  let s = machineSettings.serializeSettings();
  expect(s).toBe(
      `name: Demo
board: ESP32v4
host: demo
meta:
machine: MILL
arc_tolerance_mm: 0.002
junction_deviation_mm: 0.01
verbose_errors: true
report_inches: false
enable_parking_override_control: false
use_line_numbers: false
planner_blocks: 16

start:
  must_home: false
  deactivate_parking: false
  check_limits: true

parking:
  enable: false
  axis: Z
  target_mpos_mm: -5
  rate_mm_per_min: 800
  pullout_distance_mm: 5
  pullout_rate_mm_per_min: 250

coolant:
  flood_pin: i2so.7
  mist_pin: i2so.8
  delay_ms: 0

probe:
  pin: NO_PIN
  toolsetter_pin: NO_PIN
  check_mode_start: true
  hard_stop: false

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

kinematics:

  parallel_delta:
    crank_mm: 70
    base_triangle_mm: 179.437
    linkage_mm: 133.5
    end_effector_triangle_mm: 86.603
    kinematic_segment_len_mm: 1
    homing_mpos_radians: 0, 0, 0
    soft_limits: false
    max_z_mm: 0
    use_servos: true

axes:
  shared_stepper_disable_pin: NO_PIN
  shared_stepper_reset_pin: NO_PIN
  homing_runs: 2

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: true

    homing:
      cycle: 0
      allow_single_axis: true
      positive_direction: true
      mpos_mm: 0
      feed_mm_per_min: 50
      seek_mm_per_min: 200
      settle_ms: 250
      seek_scaler: 1.1
      feed_scaler: 1.1

    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250
      max_rate_factor: 0.75

    motor0:
      limit_neg_pin: gpio.34:low
      limit_pos_pin: gpio.35:low
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

    motor0:
      limit_neg_pin: NO_PIN
      limit_pos_pin: NO_PIN
      limit_all_pin: NO_PIN
      hard_limits: false
      pulloff_mm: 1

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    soft_limits: false

    motor0:
      limit_neg_pin: NO_PIN
      limit_pos_pin: NO_PIN
      limit_all_pin: NO_PIN
      hard_limits: false
      pulloff_mm: 1

synchro:
  index_pin: gpio.26

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21
  frequency: 100000

spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18

i2so:
  bck_pin: gpio.27
  data_pin: gpio.13
  ws_pin: gpio.14

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
  m6_macro:
  atc: atc_manual

atc_manual:
  safe_z_mpos_mm: 50
  probe_seek_rate_mm_per_min: 200
  probe_feed_rate_mm_per_min: 80
  change_mpos_mm: 0, 0, 0
  ets_mpos_mm: 100
  ets_rapid_z_mpos_mm: 0
`);
});

test('UI', () => {
  machineSettings.parseSettings(configYaml)
  machineSettingsUI.createPanes()
});

test('spindle type UI', () => {
  setupUI();
  let e = getElement("/_type") as HTMLSelectElement;
  let selected = e.options.item(Number(e.value))?.text;
  expect(selected).toBe("PWM")
});

test('load with varying case', () => {
  machineSettings.settings = machineSettings.parseSettings(configYamlCased)
});

function setupUI() {
  let ms = new MachineSettings()
  ms.settings = ms.parseSettings(configYaml)
  let msUI = new SettingsUI(ms, "machineSettings")
  let elements = msUI.createPanes();
  document.body.appendChild(panel("", null, elements))
}

let a = `name: "Demo"
host: "demo"
machine: MILL
board: "ESP32v4"

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  dir_delay_us: 1
  pulse_us: 6
  disable_delay_us: 0

start:
  check_limits: true
  must_home: false
  deactivate_parking: false

control:
  safety_door_pin: NO_PIN

# SD Card
spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18
sdcard:
  cs_pin: gpio.5
  card_detect_pin: NO_PIN
  frequency_hz: 8000000

i2c0:
  sda_pin: gpio.22
  scl_pin: gpio.21

oled:
  type: "SH1106"
  width: 128
  height: 64
  i2c_num: 0
  i2c_address: 60
  radio_delay_ms: 1000

synchro:
  index_pin: gpio.26

i2so:
  data_pin: gpio.13
  ws_pin: gpio.14
  bck_pin: gpio.27

coolant:
    flood_pin: i2so.7
    mist_pin: i2so.8
    delay_ms: 0

atc_tool_table:

pwm:
  pwm_hz: 5000
  direction_pin: i2so.9
  output_pin: gpio.15
  enable_pin: NO_PIN
  disable_with_s0: false
  s0_with_disable: true
  spinup_ms: 0
  spindown_ms: 0
  tool_num: 0
  speed_map: 0=0.000% 1000=100.000%
  off_on_alarm: false
  atc: atc_tool_table
  M6_macro:


axes:

  #  1 rot = 6.35 mm = 200 * 10 steps = 2000 steps
  #          1.00 mm =                     x steps
  #  x = 1.00 * 2000 / 6.35 = 314.96 steps/mm, ~0.003 mm/step
  #  127 mm/s, ~40000 step/s

  x:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500.0
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    homing:
      mpos_mm: 0.0
      positive_direction: true
    motor0:
      limit_neg_pin: gpio.34:low
      limit_pos_pin: gpio.35:low
      hard_limits: true
      stepstick:
        step_pin: i2so.0
        direction_pin: i2so.1
    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: false
      pulses_per_rev: 1000
      max_rpm: 250.0
      max_rate_factor: 0.75

  y:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500.0
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
    homing:
      mpos_mm: 0.0
      positive_direction: false

  z:
    steps_per_mm: 500
    max_rate_mm_per_min: 1500.0
    acceleration_mm_per_sec2: 500
    max_travel_mm: 1000
`

let configYamlCased = `name: "Epoxy Granite Mill"
host: "mill"
machine: MILL
board: "ESP32v4"


#wifi:
#  ssid: "superhawk"
#  password: "java1092"
#  ip: "10.0.0.121"
#  gateway: "10.0.0.1"
#  netmask: "255.255.255.0"


# System Controls
start:
  check_limits: true
  must_home: false
  deactivate_parking: false


control:
  estop_pin: gpio.12:pd


# SD Card
spi:
  miso_pin: gpio.19
  mosi_pin: gpio.23
  sck_pin: gpio.18
sdcard:
  cs_pin: gpio.5
  card_detect_pin: NO_PIN
  frequency_hz: 8000000


# OLED Display. It does not work in FluidTerm. Comment out during debugging.
i2c0:
  sda_pin: gpio.13
  scl_pin: gpio.14
oled:
  type: "SH1106"
  i2c_num: 0
  i2c_address: 60
  width: 128
  height: 64
  radio_delay_ms: 1000

atc_tool_table:

#uart1:
#  rxd_pin: gpio.25
#  rts_pin: gpio.26
#  txd_pin: gpio.27
#  baud: 9600
#  mode: 8N1

# Spindle VFD (H100)
#H100:
#  uart_num: 1
#  modbus_id: 1
#  spinup_ms: 0
#  spindown_ms: 0
#  tool_num: 0
#  speed_map: 0=0% 750=25% 1500=50% 3000=100%
#  off_on_alarm: false
#  M6_macro:
#  atc: atc_tool_table

pwm:
  pwm_hz: 5000
  direction_pin: i2so.9
  output_pin: gpio.15
  enable_pin: NO_PIN
  disable_with_s0: false
  s0_with_disable: true
  spinup_ms: 0
  spindown_ms: 0
  tool_num: 0
  speed_map: 0=0.000% 1000=100.000%
  off_on_alarm: false
  M6_macro:
  atc: atc_tool_table

# I2SO Outputs (step/dir)
i2so:
  bck_pin: gpio.4
  ws_pin: gpio.0
  data_pin: gpio.2
stepping:
  engine: I2S_STATIC
  idle_ms: 10000
  dir_delay_us: 1
  pulse_us: 6
  disable_delay_us: 0


axes:

  x:
    # 4 mm pitch
    steps_per_mm: 500
    max_rate_mm_per_min: 4000
    acceleration_mm_per_sec2: 400
    max_travel_mm: 1000
    homing:
      mpos_mm: 0.0
      positive_direction: false
    motor0:
      # Using pin 1 (UART0 TX) causes FluidTerm to hang. Comment out during debugging.
      limit_neg_pin: gpio.1:low
      limit_pos_pin: gpio.22:low
      hard_limits: false
      stepstick:
        step_pin: i2so.4
        direction_pin: i2so.5:low
    mpg:
      a_pin: gpio.36
      b_pin: gpio.39
      reverse: false
      pulses_per_rev: 500
      max_rpm: 240.0
      max_rate_factor: 0.5


  y:
    # 5 mm pitch
    steps_per_mm: 400
    max_rate_mm_per_min: 4000
    acceleration_mm_per_sec2: 400
    max_travel_mm: 1000
    homing:
      mpos_mm: 0.0
      positive_direction: false
    motor0:
      limit_neg_pin: gpio.3:low
      limit_pos_pin: gpio.21:low
      hard_limits: false
      stepstick:
        step_pin: i2so.2
        direction_pin: i2so.3:low
    mpg:
      a_pin: gpio.34
      b_pin: gpio.35
      reverse: true
      pulses_per_rev: 500
      max_rpm: 240.0
      max_rate_factor: 0.5


  z:
    steps_per_mm: 314.96
    max_rate_mm_per_min: 3000
    acceleration_mm_per_sec2: 400
    max_travel_mm: 1000
    homing:
      mpos_mm: 0.0
      positive_direction: true
    motor0:
      limit_neg_pin: gpio.17:low
      limit_pos_pin: gpio.16:low
      hard_limits: false
      stepstick:
        step_pin: i2so.0
        direction_pin: i2so.1
    mpg:
      a_pin: gpio.32
      b_pin: gpio.33
      reverse: true
      pulses_per_rev: 500
      max_rpm: 240.0
      max_rate_factor: 0.5
`