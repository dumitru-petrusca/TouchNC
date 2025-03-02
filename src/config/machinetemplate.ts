import {bool, cloneSetting, float, group, int, pinI, pinIO, pinO, position, select, Setting, SettingAttr, SettingGroup, string} from './settings';
import {YAML} from './yaml';

let motor = {
  limit_neg_pin: pinI(),
  limit_pos_pin: pinI(),
  limit_all_pin: pinI(),
  hard_limits: bool(false),
  pulloff_mm: float(1, 0.1, 100000.0),
  driver: {
    _attributes: SettingAttr.VIRTUAL | SettingAttr.ONE_OF,
    _type: group("this", SettingAttr.VIRTUAL),
    standard_stepper: {
      step_pin: pinO(),
      direction_pin: pinO(),
      disable_pin: pinI(),
    },
    stepstick: {
      step_pin: pinO(),
      direction_pin: pinO(),
      disable_pin: pinI(),
      ms1_pin: pinIO(),
      ms2_pin: pinIO(),
      ms3_pin: pinIO(),
      reset_pin: pinI(),
    }
    //TODO-dp other types of motors
  }
}

let axis = {
  steps_per_mm: float(80, 0.001, 100000.0),
  max_rate_mm_per_min: float(1000, 0.001, 250000.0),
  acceleration_mm_per_sec2: float(25, 0.001, 100000.0),
  max_travel_mm: float(1000, 0.1, 10000000.0),
  soft_limits: bool(false),
  homing: {
    cycle: int(0, -1, 6),
    allow_single_axis: bool(true),
    positive_direction: bool(true),
    mpos_mm: float(0, -1e6, 1e6),
    feed_mm_per_min: float(50, 1.0, 100000.0),
    seek_mm_per_min: float(200, 1.0, 100000.0),
    settle_ms: int(250, 0, 1000),
    seek_scaler: float(1.1, 1.0, 100.0),
    feed_scaler: float(1.1, 1.0, 100.0),
  },
  mpg: {
    a_pin: pinI(),
    b_pin: pinI(),
    reverse: bool(false),
    pulses_per_rev: int(1000, 0, 20000),
    max_rpm: int(250, 0, 1000),
    max_rate_factor: float(0.75, 0.01, 1),
  },
  motor0: motor,
  motor1: motor
}

let i2c = {
  sda_pin: pinIO(),
  scl_pin: pinIO(),
  frequency: int(100000, 0, 20000000)
}

let vfd = {
  uart_num: int(-1, 0, 1e7),
  modbus_id: int(1, 0, 247),
  spinup_ms: int(0, 0, 60000),
  spindown_ms: int(0, 0, 60000),
  tool_num: int(-1, 0, 99999999),
  speed_map: string("0=0% 750=25% 1500=50% 3000=100%", 0, 256),
  off_on_alarm: bool(false),
  m6_macro: string("", 0, 256),
  atc: group("/atc"),
}

let uart = {
  rxd_pin: pinIO(),
  rts_pin: pinIO(),
  txd_pin: pinIO(),
  baud: int(115200, 2400, 10000000),
  mode: select("8N1", ["8N1", "8E1", "8O1", "8N2", "7N1", "7E1", "7O1"]),
}

let uart_channel = {
  report_interval_ms: int(0, 0, 1e6),
  uart_num: int(0, 0, 2),
  message_level: select("Verbose", ["None", "Error", "Warn", "Info", "Debug", "Verbose"]),
}

let onOffSpindle = {
  output_pin: pinO(),
  enable_pin: pinI(),
  disable_with_s0: bool(false),
  s0_with_disable: bool(true),
  spinup_ms: int(0, 0, 60000),
  spindown_ms: int(0, 0, 60000),
  tool_num: int(-1, 0, 99999999),
  speed_map: string("0=0% 750=25% 1500=50% 3000=100%", 0, 256),
  off_on_alarm: bool(false),
  m6_macro: string("", 0, 256),
  atc: group("/atc"),
};

export let configTemplate = {
  general: {
    _attributes: SettingAttr.VIRTUAL,
    name: string("None", 0, 32),
    board: string("None", 0, 32),
    host: string("fluidnc", 0, 32),
    meta: string("", 0, 32),
    machine: select("MILL", ["MILL", "LATHE"])
  },

  various: {
    _attributes: SettingAttr.VIRTUAL,
    arc_tolerance_mm: float(0.002, 0.001, 1.0),
    junction_deviation_mm: float(0.01, 0.01, 1),
    verbose_errors: bool(true),
    report_inches: bool(false),
    enable_parking_override_control: bool(false),
    use_line_numbers: bool(false),
    planner_blocks: int(16, 10, 120),
  },

  start: {
    must_home: bool(true),
    deactivate_parking: bool(false),
    check_limits: bool(true),
  },

  parking: {
    enable: bool(false),
    axis: int(2, 0, 5),
    target_mpos_mm: float(-5, -1e6, 1e6),
    rate_mm_per_min: float(800, 0, 1e6),
    pullout_distance_mm: float(5, 0, 3e38),
    pullout_rate_mm_per_min: float(250, 0, 1e6)
  },

  coolant: {
    flood_pin: pinO(),
    mist_pin: pinO(),
    delay_ms: int(0, 0, 10000),
  },

  probe: {
    pin: pinI(),
    toolsetter_pin: pinI(),
    check_mode_start: bool(true),
    hard_stop: bool(false),
  },

  stepping: {
    engine: select("RMT_ENGINE", ["TIMED", "RMT_ENGINE", "I2S_STATIC", "I2S_STREAM"]),
    idle_ms: int(255, 0, 10000000),
    pulse_us: int(4, 0, 30),
    dir_delay_us: int(0, 0, 10),
    disable_delay_us: int(0, 0, 1000000),
    segments: int(12, 6, 20),
  },

  kinematics: {
    _attributes: SettingAttr.ONE_OF,
    _type: group("this", SettingAttr.VIRTUAL),

    Cartesian: {},
    midtbot: {},
    CoreXY: {},
    WallPlotter: {
      left_axis: int(0, -1e6, 1e6),
      left_anchor_x: float(-100, -1e6, 1e6),
      left_anchor_y: float(100, -1e6, 1e6),
      right_axis: int(1, -1e6, 1e6),
      right_anchor_x: float(100, -1e6, 1e6),
      right_anchor_y: float(100, -1e6, 1e6),
      segment_length: float(10, -1e6, 1e6),
    },
    parallel_delta: {
      crank_mm: float(70, 50.0, 500.0),
      base_triangle_mm: float(179.437, 20.0, 500.0),
      linkage_mm: float(133.50, 20.0, 500.0),
      end_effector_triangle_mm: float(86.603, 20.0, 500.0),
      kinematic_segment_len_mm: float(1, 0.05, 20.0),
      homing_mpos_radians: position(-1e6, 1e6),
      soft_limits: bool(false),
      max_z_mm: float(0, -10000.0, 0.0),
      use_servos: bool(true),
    },
  },

  axes: {
    shared_stepper_disable_pin: pinI(),
    shared_stepper_reset_pin: pinI(),
    homing_runs: int(2, 1, 5),
    x: axis,
    y: axis,
    z: axis,
    // a: axis,
    // b: axis,
    // c: axis,
  },

  macros: {
    startup_line0: string("", 0, 256),
    startup_line1: string("", 0, 256),
    Macro0: string("", 0, 256),
    Macro1: string("", 0, 256),
    Macro2: string("", 0, 256),
    Macro3: string("", 0, 256),
    after_homing: string("", 0, 256),
    after_reset: string("", 0, 256),
    after_unlock: string("", 0, 256),
  },

  // Input / Output

  control: {
    safety_door_pin: pinI(),
    reset_pin: pinI(),
    feed_hold_pin: pinI(),
    cycle_start_pin: pinI(),
    macro0_pin: pinI(),
    macro1_pin: pinI(),
    macro2_pin: pinI(),
    macro3_pin: pinI(),
    fault_pin: pinI(),
    estop_pin: pinI(),
  },

  status_outputs: {
    report_interval_ms: int(500, 100, 5000),
    idle_pin: pinO(),
    run_pin: pinO(),
    hold_pin: pinO(),
    alarm_pin: pinO(),
  },

  user_outputs: {
    analog0_pin: pinO(),
    analog1_pin: pinO(),
    analog2_pin: pinO(),
    analog3_pin: pinO(),
    analog0_hz: int(5000, 1, 20000000),
    analog1_hz: int(5000, 1, 20000000),
    analog2_hz: int(5000, 1, 20000000),
    analog3_hz: int(5000, 1, 20000000),
    digital0_pin: pinO(),
    digital1_pin: pinO(),
    digital2_pin: pinO(),
    digital3_pin: pinO(),
    digital4_pin: pinO(),
    digital5_pin: pinO(),
    digital6_pin: pinO(),
    digital7_pin: pinO(),
  },

  user_inputs: {
    analog0_pin: pinI(),
    analog1_pin: pinI(),
    analog2_pin: pinI(),
    analog3_pin: pinI(),
    digital0_pin: pinI(),
    digital1_pin: pinI(),
    digital2_pin: pinI(),
    digital3_pin: pinI(),
    digital4_pin: pinI(),
    digital5_pin: pinI(),
    digital6_pin: pinI(),
    digital7_pin: pinI(),
  },

  // Lathe

  synchro: {
    index_pin: pinI(),
  },

  // Hardware

  i2c0: i2c,
  i2c1: i2c,

  uart1: uart,
  uart2: uart,
  uart3: uart,

  uart_channel1: uart_channel,
  uart_channel2: uart_channel,

  spi: {
    miso_pin: pinIO(),
    mosi_pin: pinIO(),
    sck_pin: pinIO(),
  },

  i2so: {
    bck_pin: pinIO(),
    data_pin: pinIO(),
    ws_pin: pinIO(),
  },

  sdcard: {
    cs_pin: pinIO(),
    card_detect_pin: pinIO(),
    frequency_hz: int(8000000, 400000, 20000000),
  },

  oled: {
    report_interval_ms: int(500, 100, 5000),
    i2c_num: int(0, 0, 1),
    i2c_address: int(0x3c, 0, 1e6),
    width: int(64, 0, 1e6),
    height: int(48, 0, 1e6),
    flip: bool(true),
    mirror: bool(false),
    type: select("SH1106", ["SH1106"]),
    radio_delay_ms: int(0, 0, 1e6)
  },

  spindle: {
    _attributes: SettingAttr.VIRTUAL | SettingAttr.ONE_OF,
    _type: group("this", SettingAttr.VIRTUAL),

    Null: {},
    DAC: {},  // TODO add spindle

    H100: vfd,
    Huanyang: vfd,
    YL620: vfd,
    SiemensV20: vfd,
    NowForever: vfd,
    H2A: vfd,
    DanfossVLT2800: vfd,

    PWM: {
      pwm_hz: int(5000, 1, 20000000),
      direction_pin: pinO(),
      output_pin: pinO(),
      enable_pin: pinO(),
      disable_with_s0: bool(false),
      s0_with_disable: bool(true),
      spinup_ms: int(0, 0, 60000),
      spindown_ms: int(0, 0, 60000),
      tool_num: int(-1, 0, 99999999),
      speed_map: string("0=0% 750=25% 1500=50% 3000=100%", 0, 256),
      off_on_alarm: bool(false),
      m6_macro: string("", 0, 256),
      atc: group("/atc"),
    },

    BESC: {
      pwm_hz: int(5000, 1, 20000000),
      direction_pin: pinI(),
      output_pin: pinO(),
      enable_pin: pinI(),
      disable_with_s0: bool(false),
      s0_with_disable: bool(true),
      spinup_ms: int(0, 0, 60000),
      spindown_ms: int(0, 0, 60000),
      tool_num: int(-1, 0, 99999999),
      speed_map: string("0=0% 750=25% 1500=50% 3000=100%", 0, 256),
      off_on_alarm: bool(false),
      m6_macro: string("", 0, 256),
      atc: group("/atc"),
      min_pulse_us: int(900, 500, 3000),
      max_pulse_us: int(2200, 500, 3000),
    },

    Laser: {
      pwm_hz: int(5000, 1000, 100000),
      output_pin: pinO(),
      enable_pin: pinI(),
      disable_with_s0: bool(false),
      s0_with_disable: bool(true),
      spinup_ms: int(0, 0, 60000),
      spindown_ms: int(0, 0, 60000),
      tool_num: int(-1, 0, 99999999),
      speed_map: string("0=0% 750=25% 1500=50% 3000=100%", 0, 256),
      off_on_alarm: bool(false),
      m6_macro: string("", 0, 256),
      atc: group("/atc"),
    },

    _10v: {
      forward_pin: pinI(),
      reverse_pin: pinI(),
      pwm_hz: int(5000, 1, 20000000),
      direction_pin: pinI(),
      output_pin: pinO(),
      enable_pin: pinI(),
      disable_with_s0: bool(false),
      s0_with_disable: bool(true),
      spinup_ms: int(0, 0, 60000),
      spindown_ms: int(0, 0, 60000),
      tool_num: int(-1, 0, 99999999),
      speed_map: string("0=0% 750=25% 1500=50% 3000=100%", 0, 256),
      off_on_alarm: bool(false),
      m6_macro: string("", 0, 256),
      atc: group("/atc"),
    },

    HBridge: {
      pwm_hz: int(5000, 1, 20000000),
      output_cw_pin: pinO(),
      output_ccw_pin: pinO(),
      enable_pin: pinI(),
      disable_with_s0: bool(false),
      spinup_ms: int(0, 0, 60000),
      spindown_ms: int(0, 0, 60000),
      tool_num: int(-1, 0, 99999999),
      speed_map: string("0=0% 750=25% 1500=50% 3000=100%", 0, 256),
      off_on_alarm: bool(false),
      m6_macro: string("", 0, 256),
      atc: group("/atc"),
    },

    OnOff: onOffSpindle,
    Relay: onOffSpindle,
  },

  atc: {
    _attributes: SettingAttr.VIRTUAL | SettingAttr.ONE_OF | SettingAttr.HIDDEN,
    atc_manual: {
      safe_z_mpos_mm: float(50, -100000, 100000),
      probe_seek_rate_mm_per_min: float(200, 1, 10000),
      probe_feed_rate_mm_per_min: float(80, 1, 10000),
      change_mpos_mm: position(-1e6, 1e6),
      ets_mpos_mm: position(-1e6, 1e6),
      ets_rapid_z_mpos_mm: float(0, -1e6, 1e6),
    },
    atc_tool_table: {},
  }
}

function _createGroupTemplates(obj: any, path: string, parent: SettingGroup): SettingGroup[] {
  let groups = []
  for (const key of Object.keys(obj)) {
    let childObj = obj[key]
    if (childObj instanceof Setting) {
      let name = path + "/" + key;
      let setting = cloneSetting(childObj).setName(name).setParent(parent);
      parent.settings.push(setting)
    } else if (typeof childObj == "object") {
      let group = new SettingGroup(path + "/" + key, childObj._attributes).setParent(parent);
      groups.push(group);
      let holder = group.isOneOf() ? group.groups : groups
      let path2 = group.isVirtual() ? path : path + "/" + key;
      holder.push(..._createGroupTemplates(childObj, path2, group))
    }
  }
  return groups
}

export function createGroupTemplate(): SettingGroup {
  let root = new SettingGroup("", SettingAttr.VIRTUAL);
  let groups = _createGroupTemplates(configTemplate, "", root);
  root.groups.push(...groups)
  return root
}