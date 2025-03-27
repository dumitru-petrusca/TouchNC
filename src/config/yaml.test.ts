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

test('complex case', () => {
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

test('iterate', () => {
  let yml = new YAML(configYaml)
  let s: string[] = []
  yml.forEach((path, value) => {
    s.push(`${path}=${value}`)
  })
  expect(s).toStrictEqual([
    "/name=Demo",
    "/board=ESP32v4",
    "/meta=",
    "/machine=MILL",
    "/arc_tolerance_mm=0.002",
    "/junction_deviation_mm=0.01",
    "/verbose_errors=true",
    "/report_inches=false",
    "/enable_parking_override_control=false",
    "/use_line_numbers=false",
    "/planner_blocks=16",
    "/start/must_home=false",
    "/start/deactivate_parking=false",
    "/start/check_limits=true",
    "/parking/enable=false",
    "/parking/axis=Z",
    "/parking/target_mpos_mm=-5",
    "/parking/rate_mm_per_min=800",
    "/parking/pullout_distance_mm=5",
    "/parking/pullout_rate_mm_per_min=250",
    "/coolant/flood_pin=i2so.7",
    "/coolant/mist_pin=i2so.8",
    "/coolant/delay_ms=0",
    "/probe/pin=NO_PIN",
    "/probe/toolsetter_pin=NO_PIN",
    "/probe/check_mode_start=true",
    "/probe/hard_stop=false",
    "/stepping/engine=I2S_STATIC",
    "/stepping/idle_ms=250",
    "/stepping/pulse_us=6",
    "/stepping/dir_delay_us=1",
    "/stepping/disable_delay_us=0",
    "/stepping/segments=12",
    "/kinematics/Cartesian=",
    "/axes/shared_stepper_disable_pin=NO_PIN",
    "/axes/shared_stepper_reset_pin=NO_PIN",
    "/axes/homing_runs=2",
    "/axes/x/steps_per_mm=500",
    "/axes/x/max_rate_mm_per_min=1500",
    "/axes/x/acceleration_mm_per_sec2=500",
    "/axes/x/max_travel_mm=1000",
    "/axes/x/soft_limits=true",
    "/axes/x/homing/cycle=0",
    "/axes/x/homing/allow_single_axis=true",
    "/axes/x/homing/positive_direction=true",
    "/axes/x/homing/mpos_mm=0",
    "/axes/x/homing/feed_mm_per_min=50",
    "/axes/x/homing/seek_mm_per_min=200",
    "/axes/x/homing/settle_ms=250",
    "/axes/x/homing/seek_scaler=1.1",
    "/axes/x/homing/feed_scaler=1.1",
    "/axes/x/mpg/a_pin=gpio.32",
    "/axes/x/mpg/b_pin=gpio.33",
    "/axes/x/mpg/reverse=false",
    "/axes/x/mpg/pulses_per_rev=1000",
    "/axes/x/mpg/max_rpm=250",
    "/axes/x/mpg/max_rate_factor=0.75",
    "/axes/x/motor0/limit_neg_pin=gpio.34:low",
    "/axes/x/motor0/limit_pos_pin=gpio.35:low",
    "/axes/x/motor0/limit_all_pin=NO_PIN",
    "/axes/x/motor0/hard_limits=true",
    "/axes/x/motor0/pulloff_mm=1",
    "/axes/x/motor0/stepstick/step_pin=i2so.0",
    "/axes/x/motor0/stepstick/direction_pin=i2so.1",
    "/axes/x/motor0/stepstick/disable_pin=NO_PIN",
    "/axes/x/motor0/stepstick/ms1_pin=NO_PIN",
    "/axes/x/motor0/stepstick/ms2_pin=NO_PIN",
    "/axes/x/motor0/stepstick/ms3_pin=NO_PIN",
    "/axes/x/motor0/stepstick/reset_pin=NO_PIN",
    "/axes/y/steps_per_mm=500",
    "/axes/y/max_rate_mm_per_min=1500",
    "/axes/y/acceleration_mm_per_sec2=500",
    "/axes/y/max_travel_mm=1000",
    "/axes/y/soft_limits=false",
    "/axes/y/homing/cycle=0",
    "/axes/y/homing/allow_single_axis=true",
    "/axes/y/homing/positive_direction=false",
    "/axes/y/homing/mpos_mm=0",
    "/axes/y/homing/feed_mm_per_min=50",
    "/axes/y/homing/seek_mm_per_min=200",
    "/axes/y/homing/settle_ms=250",
    "/axes/y/homing/seek_scaler=1.1",
    "/axes/y/homing/feed_scaler=1.1",
    "/axes/y/motor0/limit_neg_pin=NO_PIN",
    "/axes/y/motor0/limit_pos_pin=NO_PIN",
    "/axes/y/motor0/limit_all_pin=NO_PIN",
    "/axes/y/motor0/hard_limits=false",
    "/axes/y/motor0/pulloff_mm=1",
    "/axes/z/steps_per_mm=500",
    "/axes/z/max_rate_mm_per_min=1500",
    "/axes/z/acceleration_mm_per_sec2=500",
    "/axes/z/max_travel_mm=1000",
    "/axes/z/soft_limits=false",
    "/axes/z/motor0/limit_neg_pin=NO_PIN",
    "/axes/z/motor0/limit_pos_pin=NO_PIN",
    "/axes/z/motor0/limit_all_pin=NO_PIN",
    "/axes/z/motor0/hard_limits=false",
    "/axes/z/motor0/pulloff_mm=1",
    "/synchro/index_pin=gpio.26",
    "/i2c0/sda_pin=gpio.22",
    "/i2c0/scl_pin=gpio.21",
    "/i2c0/frequency=100000",
    "/spi/miso_pin=gpio.19",
    "/spi/mosi_pin=gpio.23",
    "/spi/sck_pin=gpio.18",
    "/i2so/bck_pin=gpio.27",
    "/i2so/data_pin=gpio.13",
    "/i2so/ws_pin=gpio.14",
    "/sdcard/cs_pin=gpio.5",
    "/sdcard/card_detect_pin=NO_PIN",
    "/sdcard/frequency_hz=8000000",
    "/oled/report_interval_ms=500",
    "/oled/i2c_num=0",
    "/oled/i2c_address=60",
    "/oled/width=128",
    "/oled/height=64",
    "/oled/flip=true",
    "/oled/mirror=false",
    "/oled/type=SH1106",
    "/oled/radio_delay_ms=1000",
    "/PWM/pwm_hz=5000",
    "/PWM/direction_pin=i2so.9",
    "/PWM/output_pin=gpio.15",
    "/PWM/enable_pin=NO_PIN",
    "/PWM/disable_with_s0=false",
    "/PWM/s0_with_disable=true",
    "/PWM/spinup_ms=0",
    "/PWM/spindown_ms=0",
    "/PWM/tool_num=0",
    "/PWM/speed_map=0=0% 750=25% 1500=50% 3000=100%",
    "/PWM/off_on_alarm=false",
    "/PWM/m6_macro=",
    "/PWM/atc=atc_manual",
    "/atc_manual/safe_z_mpos_mm=50",
    "/atc_manual/probe_seek_rate_mm_per_min=200",
    "/atc_manual/probe_feed_rate_mm_per_min=80",
    "/atc_manual/change_mpos_mm=0, 0, 0",
    "/atc_manual/ets_mpos_mm=100",
    "/atc_manual/ets_rapid_z_mpos_mm=0"
  ]);
});

export let configYaml =
    `name: Demo
board: ESP32v4
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
