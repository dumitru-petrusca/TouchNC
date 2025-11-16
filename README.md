# TouchNC

## Credits
  This code is based on 
  https://github.com/luc-github/ESP3D-WEBUI and 
  https://github.com/MitchBradley/ESP3D-WEBUI.git for which I am grateful.

## Features
- Supports the FluidNC CNC controller
- DRO-like user experience, optimized for touch screens and tablets
- Support for manual CNC machine operation (requires MPGs on each axis and a modified FluidNC firmware)
- Support for CNC program execution
- Build-in tool table editor (requires a modified FluidNC firmware)
- Automatic re-connection if communication with FluidNC is lost
- Full-featured machine configuration editor
- Written in TypeScript using modern technology.
- Very small footprint (~40kB).

## Setup
1. Install NPM (https://nodejs.org)
2. npm install -g gulp-cli (may need sudo)
3. npm install --save-dev gulp

# Running
 * Demo  - gulp run --url http://10.0.0.122
 * Lathe - gulp run --url http://10.0.0.120
 * Mill  - gulp run --url http://192.168.2.2

## Installation
Build as described above and copy index.html.gz to the ESP32 SPIFFS.
If you break the UI you can delete the index.html.gz file in the terminal 
serial monitor using
```
$Localfs/Delete=index.html.gz
```
Refreshing the page will give a default page that allows you to upload a new index.html.gz.

## Issues / Questions
You can submit issues [here](https://github.com/dumitru-petrusca/TouchNC/issues)   

## Development
For quick local development you can build and start a local dev server with:
```
$  gulp package --lang en; python fluidnc-web-sim.py
$  gulp package --lang en; python fluidnc-web-sim.py 10.0.0.121
```
The UI is served on localhost:8080 and proxies web communication to either "fluidnc.local" or the provided FluidNC IP address.

## Contribution
Just submit PRs!
