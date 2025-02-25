import {toYAML} from './yaml';

test('toYAML', () => {
  let yml = toYAML("", JSON.parse(obj), "")
  expect(yml).toBe(yaml);
});


let yaml = `board: ESP32v4
name: Demo
meta: 
machine: MILL
host: demo

stepping:
  engine: I2S_STATIC
  idle_ms: 250
  pulse_us: 6
  dir_delay_us: 1
  disable_delay_us: 0
  segments: 12

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
        step_pin: I2SO.0
        direction_pin: I2SO.1
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

control:
  safety_door_pin: NO_PIN
  reset_pin: NO_PIN
  feed_hold_pin: NO_PIN
  cycle_start_pin: NO_PIN
  macro0_pin: NO_PIN
  macro1_pin: NO_PIN
  macro2_pin: NO_PIN
  macro3_pin: NO_PIN
  fault_pin: NO_PIN
  estop_pin: NO_PIN

coolant:
  flood_pin: I2SO.7
  mist_pin: I2SO.8
  delay_ms: 0

probe:
  pin: NO_PIN
  toolsetter_pin: NO_PIN
  check_mode_start: true
  hard_stop: false

macros:
  startup_line0: 
  startup_line1: 
  Macro0: 
  Macro1: 
  Macro2: 
  Macro3: 
  after_homing: 
  after_reset: 
  after_unlock: 

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

user_outputs:
  analog0_pin: NO_PIN
  analog1_pin: NO_PIN
  analog2_pin: NO_PIN
  analog3_pin: NO_PIN
  analog0_hz: 5000
  analog1_hz: 5000
  analog2_hz: 5000
  analog3_hz: 5000
  digital0_pin: NO_PIN
  digital1_pin: NO_PIN
  digital2_pin: NO_PIN
  digital3_pin: NO_PIN
  digital4_pin: NO_PIN
  digital5_pin: NO_PIN
  digital6_pin: NO_PIN
  digital7_pin: NO_PIN

user_inputs:
  analog0_pin: NO_PIN
  analog1_pin: NO_PIN
  analog2_pin: NO_PIN
  analog3_pin: NO_PIN
  digital0_pin: NO_PIN
  digital1_pin: NO_PIN
  digital2_pin: NO_PIN
  digital3_pin: NO_PIN
  digital4_pin: NO_PIN
  digital5_pin: NO_PIN
  digital6_pin: NO_PIN
  digital7_pin: NO_PIN

synchro:
  index_pin: gpio.26

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
  direction_pin: I2SO.9
  output_pin: gpio.15
  enable_pin: NO_PIN
  disable_with_s0: false
  s0_with_disable: true
  spinup_ms: 0
  spindown_ms: 0
  tool_num: 0
  off_on_alarm: false
  atc: atc_tool_table
  m6_macro: 
arc_tolerance_mm: 0.002
junction_deviation_mm: 0.01
verbose_errors: true
report_inches: false
enable_parking_override_control: false
use_line_numbers: false
planner_blocks: 16
`;


let obj = `{
  "board": "ESP32v4",
  "name": "Demo",
  "meta": "",
  "machine": "MILL",
  "host": "demo",
  "stepping": {
    "engine": "I2S_STATIC",
    "idle_ms": 250,
    "pulse_us": 6,
    "dir_delay_us": 1,
    "disable_delay_us": 0,
    "segments": 12
  },
  "i2so": {
    "bck_pin": "gpio.27",
    "data_pin": "gpio.13",
    "ws_pin": "gpio.14"
  },
  "i2c0": {
    "sda_pin": "gpio.22",
    "scl_pin": "gpio.21",
    "frequency": 100000
  },
  "spi": {
    "miso_pin": "gpio.19",
    "mosi_pin": "gpio.23",
    "sck_pin": "gpio.18"
  },
  "sdcard": {
    "cs_pin": "gpio.5",
    "card_detect_pin": "NO_PIN",
    "frequency_hz": 8000000
  },
  "axes": {
    "shared_stepper_disable_pin": "NO_PIN",
    "shared_stepper_reset_pin": "NO_PIN",
    "homing_runs": 2,
    "x": {
      "steps_per_mm": 500,
      "max_rate_mm_per_min": 1500,
      "acceleration_mm_per_sec2": 500,
      "max_travel_mm": 1000,
      "soft_limits": true,
      "homing": {
        "cycle": 0,
        "allow_single_axis": true,
        "positive_direction": true,
        "mpos_mm": 0,
        "feed_mm_per_min": 50,
        "seek_mm_per_min": 200,
        "settle_ms": 250,
        "seek_scaler": 1.1,
        "feed_scaler": 1.1
      },
      "mpg": {
        "a_pin": "gpio.32",
        "b_pin": "gpio.33",
        "reverse": false,
        "pulses_per_rev": 1000,
        "max_rpm": 250,
        "max_rate_factor": 0.75
      },
      "motor0": {
        "limit_neg_pin": "gpio.34:low",
        "limit_pos_pin": "gpio.35:low",
        "limit_all_pin": "NO_PIN",
        "hard_limits": true,
        "pulloff_mm": 1,
        "stepstick": {
          "step_pin": "I2SO.0",
          "direction_pin": "I2SO.1",
          "disable_pin": "NO_PIN",
          "ms1_pin": "NO_PIN",
          "ms2_pin": "NO_PIN",
          "ms3_pin": "NO_PIN",
          "reset_pin": "NO_PIN"
        }
      }
    },
    "y": {
      "steps_per_mm": 500,
      "max_rate_mm_per_min": 1500,
      "acceleration_mm_per_sec2": 500,
      "max_travel_mm": 1000,
      "soft_limits": false,
      "homing": {
        "cycle": 0,
        "allow_single_axis": true,
        "positive_direction": false,
        "mpos_mm": 0,
        "feed_mm_per_min": 50,
        "seek_mm_per_min": 200,
        "settle_ms": 250,
        "seek_scaler": 1.1,
        "feed_scaler": 1.1
      },
      "motor0": {
        "limit_neg_pin": "NO_PIN",
        "limit_pos_pin": "NO_PIN",
        "limit_all_pin": "NO_PIN",
        "hard_limits": false,
        "pulloff_mm": 1
      }
    },
    "z": {
      "steps_per_mm": 500,
      "max_rate_mm_per_min": 1500,
      "acceleration_mm_per_sec2": 500,
      "max_travel_mm": 1000,
      "soft_limits": false,
      "motor0": {
        "limit_neg_pin": "NO_PIN",
        "limit_pos_pin": "NO_PIN",
        "limit_all_pin": "NO_PIN",
        "hard_limits": false,
        "pulloff_mm": 1
      }
    }
  },
  "control": {
    "safety_door_pin": "NO_PIN",
    "reset_pin": "NO_PIN",
    "feed_hold_pin": "NO_PIN",
    "cycle_start_pin": "NO_PIN",
    "macro0_pin": "NO_PIN",
    "macro1_pin": "NO_PIN",
    "macro2_pin": "NO_PIN",
    "macro3_pin": "NO_PIN",
    "fault_pin": "NO_PIN",
    "estop_pin": "NO_PIN"
  },
  "coolant": {
    "flood_pin": "I2SO.7",
    "mist_pin": "I2SO.8",
    "delay_ms": 0
  },
  "probe": {
    "pin": "NO_PIN",
    "toolsetter_pin": "NO_PIN",
    "check_mode_start": true,
    "hard_stop": false
  },
  "macros": {
    "startup_line0": "",
    "startup_line1": "",
    "Macro0": "",
    "Macro1": "",
    "Macro2": "",
    "Macro3": "",
    "after_homing": "",
    "after_reset": "",
    "after_unlock": ""
  },
  "start": {
    "must_home": false,
    "deactivate_parking": false,
    "check_limits": true
  },
  "parking": {
    "enable": false,
    "axis": "Z",
    "target_mpos_mm": -5,
    "rate_mm_per_min": 800,
    "pullout_distance_mm": 5,
    "pullout_rate_mm_per_min": 250
  },
  "user_outputs": {
    "analog0_pin": "NO_PIN",
    "analog1_pin": "NO_PIN",
    "analog2_pin": "NO_PIN",
    "analog3_pin": "NO_PIN",
    "analog0_hz": 5000,
    "analog1_hz": 5000,
    "analog2_hz": 5000,
    "analog3_hz": 5000,
    "digital0_pin": "NO_PIN",
    "digital1_pin": "NO_PIN",
    "digital2_pin": "NO_PIN",
    "digital3_pin": "NO_PIN",
    "digital4_pin": "NO_PIN",
    "digital5_pin": "NO_PIN",
    "digital6_pin": "NO_PIN",
    "digital7_pin": "NO_PIN"
  },
  "user_inputs": {
    "analog0_pin": "NO_PIN",
    "analog1_pin": "NO_PIN",
    "analog2_pin": "NO_PIN",
    "analog3_pin": "NO_PIN",
    "digital0_pin": "NO_PIN",
    "digital1_pin": "NO_PIN",
    "digital2_pin": "NO_PIN",
    "digital3_pin": "NO_PIN",
    "digital4_pin": "NO_PIN",
    "digital5_pin": "NO_PIN",
    "digital6_pin": "NO_PIN",
    "digital7_pin": "NO_PIN"
  },
  "synchro": {
    "index_pin": "gpio.26"
  },
  "oled": {
    "report_interval_ms": 500,
    "i2c_num": 0,
    "i2c_address": 60,
    "width": 128,
    "height": 64,
    "flip": true,
    "mirror": false,
    "type": "SH1106",
    "radio_delay_ms": 1000
  },
  "PWM": {
    "pwm_hz": 5000,
    "direction_pin": "I2SO.9",
    "output_pin": "gpio.15",
    "enable_pin": "NO_PIN",
    "disable_with_s0": false,
    "s0_with_disable": true,
    "spinup_ms": 0,
    "spindown_ms": 0,
    "tool_num": 0,
    "off_on_alarm": false,
    "atc": "atc_tool_table",
    "m6_macro": ""
  },
  "arc_tolerance_mm": 0.002,
  "junction_deviation_mm": 0.01,
  "verbose_errors": true,
  "report_inches": false,
  "enable_parking_override_control": false,
  "use_line_numbers": false,
  "planner_blocks": 16
}`
