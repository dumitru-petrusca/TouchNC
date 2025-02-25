function cameraformataddress() {
    var saddress = id('camera_webaddress').value;
    var saddressl = saddress.trim().toLowerCase();
    saddress = saddress.trim();
    if (saddress.length > 0) {
        if (!(saddressl.indexOf("https://") != -1 || saddressl.indexOf("http://") != -1 || saddressl.indexOf("rtp://") != -1 || saddressl.indexOf("rtps://") != -1 || saddressl.indexOf("rtp://") != -1)) {
            saddress = "http://" + saddress;
        }
    }
    id('camera_webaddress').value = saddress;
}

function camera_loadframe() {
    var saddress = id('camera_webaddress').value;
    saddress = saddress.trim();
    if (saddress.length == 0) {
        id('camera_frame').src = "";
        displayNone('camera_frame_display');
        displayNone('camera_detach_button');
    } else {
        cameraformataddress();
        id('camera_frame').src = id('camera_webaddress').value;
        displayBlock('camera_frame_display');
        displayTable('camera_detach_button');
    }
}

function camera_OnKeyUp(event) {
    if (event.keyCode == 13) {
        camera_loadframe();
    }
    return true;
}


function camera_saveaddress() {
    cameraformataddress();
    preferenceslist[0].camera_address = htmlEncode(id('camera_webaddress').value);
    SavePreferences(true);
}

function htmlEncode(str) {
    let i = str.length, encoding = [];
    while (i--) {
        let c = str.charCodeAt(i);
        if (c < 65 || c > 127 || (c > 90 && c < 97)) {
            if (c == 65533) c = 176;
            encoding[i] = '&#' + c + ';';
        } else {
            encoding[i] = str[i];
        }
    }
    return encoding.join('');
}


function camera_detachcam() {
    var webaddress = id('camera_frame').src;
    id('camera_frame').src = "";
    displayNone('camera_frame_display');
    displayNone('camera_detach_button');
    window.open(webaddress);
}

function camera_GetAddress() {
    if (typeof(preferenceslist[0].camera_address) !== 'undefined') {
        id('camera_webaddress').value = decodeHtml(preferenceslist[0].camera_address);
    } else id('camera_webaddress').value = "";
}
