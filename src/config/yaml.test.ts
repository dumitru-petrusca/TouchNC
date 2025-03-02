import {toYAML, YAML} from './yaml';

test('field without value', () => {
  let yml = new YAML(`
name: "Demo"
meta: 
board: "ESP32v4"
`)
  expect(yml.get("/meta")).toBe("");
});

test('field without value 2', () => {
  let yml = new YAML(`
name: "Demo"
meta: 

board: "ESP32v4"
`)
  expect(yml.get("/meta")).toBe("");
});

test('aa', () => {
  let yml = new YAML(`
obj1:

  obj2: 
    field1: 
    field2: { } 
  field1: 
`)
  expect(JSON.stringify(yml.yml, null, 2)).toBe(`{
  "obj1": {
    "obj2": {
      "field1": "",
      "field2": {}
    },
    "field1": ""
  }
}`)
});

test('toYAML', () => {
  let yml = new YAML(configYaml);
  let ymlStr = toYAML("", yml.yml, "")
  expect(ymlStr).toBe(configYaml.replace("kinematics:\n\n", "kinematics:\n"));
});

test('getYamlValue', () => {
  let yml = new YAML(configYaml)
  expect(yml.get("/axes/x/motor0/stepstick/step_pin")).toBe("i2so.0");
  expect(yml.get("/axes/x/motor0/stepstick/step_pin2")).toBe(undefined);
  expect(yml.get("/axes/a/motor0/stepstick/step_pin")).toBe(undefined);
});

export let configYaml =
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
  atc: atc_manual

atc_manual:
  safe_z_mpos_mm: 50
  probe_seek_rate_mm_per_min: 200
  probe_feed_rate_mm_per_min: 80
  change_mpos_mm: 0, 0, 0
  ets_mpos_mm: 100
  ets_rapid_z_mpos_mm: 0
`;
