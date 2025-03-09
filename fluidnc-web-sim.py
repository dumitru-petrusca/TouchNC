#!/usr/bin/env python3

# Usage: ./fluidnc-web-sim.py [ FluidNC_IP_address ]
# Then browse to localhost:8080

# If the FluidNC_IP_address is omitted, fluidnc-web-sim will try to
# get the FluidNC IP address by resolving the address fluidnc.local

# This is a simple web server that serves index.html from a local file,
# and forwards other requests to a FluidNC system.
# It lets you test new WebUI builds without uploading index.html.gz to
# the FluidNC MCU.

# You might have to install some Python packages first, like zeroconf and flask
# For example "pip install flask zeroconf"

# It serves index.html directly from dist/index.html , which is where the
# WebUI build process puts that file.
#
# There is an alternate mode where this program can do some things directly,
# without needing a running FluidNC instance.  To enable the alternate mode,
# set the 'proxy' variable below to False.
#
# When proxy is False, this program serves file from the "test_files/" directory.
# Its subdirectories 'localfs/' and 'sd/' contain files that are presented as
# though they were in the FluidNC FLASH and SD card filesystems.
#
# The non-proxy-mode emulation is incomplete.  In particular, the following things
# are unimplemented:
#  - File upload
#  - OTA
#  - changing settings
#  - Running GCode - or anything that involves making FluidNC do any motion things
# But you can load the UI into your browser and do file downloads and whatnot

import asyncio
import json
import os
import shutil
import sys
import threading

import requests
import websockets
from flask import Flask
from flask import request
from flask import send_from_directory
from zeroconf import ServiceBrowser
from zeroconf import Zeroconf

app = Flask(__name__)
domain = 'localhost'
http_port = 8080
ws_port = 8081
fluidnc_websocket = '8081:localhost'
fluidnc_ip = ''
proxy = False
machine = 'MILL'

test_files = 'test_files'
connection_list = []
CONNECTIONS = []

g_response = "[GC:G1 G54 G17 G21 G90 G94 M5 M9 T0 F1000 S0]"
esp400resp = '''
{"EEPROM":[
    {"F":"nvs",
      "P":"Firmware/Build",
      "H":"Firmware/Build",
      "T":"S",
      "V":"",
      "S":"20",
      "M":"0"
    },
    {"F":"tree",
      "P":"/board",
      "H":"/board",
      "T":"S",
      "V":"None",
      "S":"255",
      "M":"0"
    }
]
}
'''


def esp800resp():
    return 'FW version: FluidNC v3.6.7 (Devt-5692a7c1-dirty) # FW target:fluidnc-embedded  # FW HW:Direct SD  ' \
           '# primary sd:/sd # secondary sd:none  # authentication:no ' \
           '# webcommunication: Sync: ' + fluidnc_websocket + ' # hostname:fluidnc # machine:' + machine + ' # axis:3'


def resolve_mdns(hostname):
    resolved_addresses = []

    class MyListener:
        def update_service(self, zc, the_type, name):
            pass

        def remove_service(self, zc, the_type, name):
            pass

        def add_service(self, zc, the_type, name):
            info = zc.get_service_info(the_type, name)
            if info:
                resolved_addresses.append(info.parsed_addresses()[0])

    zeroconf = Zeroconf()
    ServiceBrowser(zeroconf, '_http._tcp.local.', MyListener())

    try:
        zeroconf.get_service_info('_http._tcp.local.',
                                  hostname + '._http._tcp.local.')
    finally:
        zeroconf.close()

    return resolved_addresses


def file_entry(directory, filename):
    full_path = os.path.join(directory, filename)
    if os.path.isfile(full_path):
        size = os.path.getsize(full_path)
    else:
        size = -1
    return {
        'name': filename,
        'shortname': filename,
        'size': size,
        'datetime': ''
    }


def format_bytes(n):
    if n < 1024:
        return str(n) + ' B'
    n = n / 1024
    if n < 1024:
        return str(round(n, 2)) + ' KB'
    n = n / 1024
    if n < 1024:
        return str(round(n, 2)) + ' MB'
    n = n / 1024
    if n < 1024:
        return str(round(n, 2)) + ' GB'
    n = n / 1024
    return str(round(n, 2)) + ' TB'


def make_files_list(fs, subdir, status):
    print("mfl", fs, subdir)
    if len(subdir) and subdir[0] == '/':
        subdir = subdir[1:]
    directory = os.path.join(test_files, fs, subdir)
    print("dir", directory)
    diskusage = shutil.disk_usage(directory)
    disktotalsize = diskusage.total
    diskusedsize = diskusage.used
    files = {
        'files': [],
        'path': '',
        'total': format_bytes(disktotalsize),
        'used': '',
        'occupation': 0,
        'status': status
    }
    dirusedsize = 0
    for filename in os.listdir(directory):
        entry = file_entry(directory, filename)
        size = entry['size']
        files['files'].append(entry)
        if size != -1:
            dirusedsize = dirusedsize + size
    occupation = 100 * diskusedsize / disktotalsize
    files['used'] = format_bytes(diskusedsize)
    files['occupation'] = int(round(occupation, 0))
    return json.dumps(files)


def do_proxy(request):
    # print("url1", request.url)
    # Forward the request to the desired endpoint
    url = request.url.replace(request.host_url, 'http://' + fluidnc_ip + '/')
    # print("url2", url)
    try:
        response = requests.request(
            method=request.method,
            url=url,
            headers=request.headers,
            data=request.get_data(),
            cookies=request.cookies,
            stream=True
        )

        # Create a Flask response with the remote server's response data
        flask_response = response.raw

        # Set response headers
        headers = [(name, value) for name, value in response.headers.items()]
        flask_response.headers.extend(headers)

        return flask_response
    except requests.exceptions.RequestException as e:
        # Handle any errors that occur during the request
        error_message = {'error': str(e)}
        return error_message, 500


@app.route('/command')
def do_command():
    plain_val = request.args.get('plain')

    # Respond directly to ESP800 instead of proxying it to FluidNC, because
    # we want to provide the correct websocket address
    if plain_val == '[ESP800]':
        return esp800resp()

    if proxy:
        return do_proxy(request)

    # If not proxying, respond to a few commands
    if plain_val == '[ESP400]':
        return esp400resp
    command = request.args.get('commandText')
    if command is not None and command.strip() == '$G':
        # print("command: ", command)
        # print("Sending to ", len(CONNECTIONS))
        CONNECTIONS[0].send(g_response)
    return ""


def handle_files(fs, request):
    if proxy:
        return do_proxy(request)
    method = request.method
    action = request.args.get('action')
    filename = request.args.get('filename')
    path = request.args.get('path')
    print("handle_files", method, action, filename, path)
    if path is None:
        path = ''
    print("handle_files", action, filename, path)

    if filename is None or filename == 'all':
        filename = ''

    if len(path) and path[0] == '/':
        path = path[1:]
    if path == '':
        filepath = filename
    else:
        filepath = path + '/' + filename

    local_path = os.path.join(test_files, fs, filepath)
    if method == 'POST':
        status = 'Upload not implemented'
    else:
        status = 'Ok'
        if action == 'delete':
            print("Deleting", filepath)
            try:
                os.remove(local_path)
            except:
                status = 'Cannot delete ' + filepath
        elif action == 'deletedir':
            try:
                shutil.rmtree(local_path)
            except:
                status = 'Cannot delete ' + filepath
        elif action == 'createdir':
            try:
                os.mkdir(local_path)
            except:
                status = 'Cannot create ' + filepath

    if request.args.get('dontlist') is None:
        return make_files_list(fs, path, status)
    return ""


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    return handle_files('sd', request)


@app.route('/files', methods=['GET', 'POST'])
def do_files():
    return handle_files('localfs', request)


@app.route('/<path:filename>', methods=['GET'])
def do_get_file(filename):
    if proxy:
        return do_proxy(request)
    print("/ ", filename)
    if filename.startswith('SD/'):
        filename = filename[3:]
        return send_from_directory(os.path.join(test_files, 'sd'), filename)
    return send_from_directory(os.path.join(test_files, 'localfs'), filename)


@app.route('/', methods=['GET'])
def index():
    return send_from_directory('dist', 'index.html')


async def send_message(message):
    await asyncio.wait([
        connection.send(message) for connection in CONNECTIONS
    ])


async def handle_message(message, websocket):
    global connection_list
    for connection in CONNECTIONS:
        if connection != websocket:
            connection_list.append(connection)

    await asyncio.wait([
        connection.send(message) for connection in connection_list
    ])


# async def message_control(websocket):
#     print("WebSocket connected.")
#     CONNECTIONS.add(websocket)
#     try:
#         await websocket.send("Connected")
#         async for message in websocket:
#             await handle_message(message, websocket)
#     finally:
#         print("WebSocket disconnected.")
#         CONNECTIONS.remove(websocket)

async def message_control(websocket):
    print(f"WebSocket connection from: {websocket.remote_address}")
    CONNECTIONS.append(websocket)
    try:
        while True:
            await asyncio.sleep(0.05)  # Wait for 50 ms
            try:
                await websocket.send("<>")
            except websockets.exceptions.ConnectionClosedError:
                print(
                    f"Connection to {websocket.remote_address} closed during send")
                break
    except websockets.exceptions.ConnectionClosedError:
        print(f"Connection to {websocket.remote_address} closed unexpectedly")
    except Exception as e:
        print(f"Error: {e}")
    CONNECTIONS.remove(websocket)


def resolve_ip(ip):
    if ip.count(".") < 3:
        print('Resolving "' + ip + '"...')
        addresses = resolve_mdns(ip)
        if len(addresses) == 0:
            print(
                'Error: cannot resolve "' + ip + '". Specify the FluidNC IP address on the command line.')
            sys.exit(1)
        elif len(addresses) == 1:
            ip = addresses[0]
        else:
            print(ip,
                  ' resolves to multiple addresses, specify the IP address on the command line ',
                  addresses)
            sys.exit(1)
    return ip


def start_flask():
    app.run(port=http_port, debug=True, use_reloader=False)


async def main():
    threading.Thread(target=start_flask).start()
    async with websockets.serve(message_control, domain, ws_port,
                                subprotocols=['arduino']):
        print(f"WebSocket server started at ws://{domain}:{ws_port}")
        await asyncio.Future()  # Run forever
        print("The server is closed")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        proxy = True
        fluidnc_ip = resolve_ip(sys.argv[1])
        fluidnc_websocket = '81:' + fluidnc_ip
    if len(sys.argv) > 2:
        machine = sys.argv[2].upper()

    if proxy:
        print("\nStarting Flask server proxying to FluidNC @ ", fluidnc_ip)
    else:
        print("\nStarting non-proxying Flask server")

    asyncio.run(main())
