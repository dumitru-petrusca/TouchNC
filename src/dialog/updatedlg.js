var update_ongoing = false;
var current_update_filename = "";
//update dialog
function updatedlg() {
    var modal = setActiveModal('updatedlg.html');
    if (modal == null) return;
    id("fw_file_name").innerHTML = translate("No file chosen");
    displayNone('prgfw');
    displayNone('uploadfw-button');
    id('updatemsg').innerHTML = "";
    id('fw-select').value = "";
    id('fw_update_dlg_title').innerHTML = translate("FluidNC Update");
    showModal();
}

function closeUpdateDialog(msg) {
    if (update_ongoing) {
        alertdlg(translate("Busy..."), translate("Update is ongoing, please wait and retry."));
        return;
    }
    closeModal(msg);
}

function checkupdatefile() {
    var files = id('fw-select').files;
    displayNone('updatemsg');
    if (files.length == 0) displayNone('uploadfw-button');
    else displayBlock('uploadfw-button');
    if (files.length > 0) {
        if (files.length == 1) {
            id("fw_file_name").innerHTML = files[0].value;
        } else {
            var tmp = translate("$n files");
            id("fw_file_name").innerHTML = tmp.replace("$n", files.length);
        }
    } else {
        id("fw_file_name").innerHTML = translate("No file chosen");
    }
}


function UpdateProgressDisplay(oEvent) {
    if (oEvent.lengthComputable) {
        var percentComplete = (oEvent.loaded / oEvent.total) * 100;
        id('prgfw').value = percentComplete;
        id('updatemsg').innerHTML = translate("Uploading ") + current_update_filename + " " + percentComplete.toFixed(0) + "%";
    } else {
        // Impossible because size is unknown
    }
}

function UploadUpdatefile() {
    confirmdlg(translate("Please confirm"), translate("Update Firmware ?"), StartUploadUpdatefile)
}



function StartUploadUpdatefile(response) {
    if (response != "yes") return;
    if (httpCommunicationLocked()) {
        alertdlg(translate("Busy..."), translate("Communications are currently locked, please wait and retry."));
        return;
    }
    var files = id('fw-select').files
    var formData = new FormData();
    var url = "/updatefw";
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var arg = "/" + file.value + "S";
        //append file size first to check updload is complete
        formData.append(arg, file.size);
        formData.append('myfile[]', file, "/" + file.value);
    }
    displayNone('fw-select_form');
    displayNone('uploadfw-button');
    update_ongoing = true;
    displayBlock('updatemsg');
    displayBlock('prgfw');
    if (files.length == 1) current_update_filename = files[0].value;
    else current_update_filename = "";
    id('updatemsg').innerHTML = translate("Uploading ") + current_update_filename;
    SendFileHttp(url, formData, UpdateProgressDisplay, updatesuccess, updatefailed)
}

function updatesuccess(response) {
    id('updatemsg').innerHTML = translate("Restarting, please wait....");
    id("fw_file_name").innerHTML = "";
    var i = 0;
    var interval;
    var x = id("prgfw");
    x.max = 10;
    interval = setInterval(function() {
        i = i + 1;
        var x = id("prgfw");
        x.value = i;
        id('updatemsg').innerHTML = translate("Restarting, please wait....") + (41 - i) + translate(" seconds");
        if (i > x.max) {
            update_ongoing = false;
            clearInterval(interval);
            location.reload();
        }
    }, 1000);
    //console.log(response);
}

function updatefailed(errorcode, response) {
    displayBlock('fw-select_form');
    displayNone('prgfw');
    id("fw_file_name").innerHTML = translate("No file chosen");
    displayNone('uploadfw-button');
    //id('updatemsg').innerHTML = "";
    id('fw-select').value = "";
    if (esp_error_code !=0){
        alertdlg (translate("Error") + " (" + esp_error_code + ")", esp_error_message);
        id('updatemsg').innerHTML = translate("Upload failed : ") + esp_error_message;
        esp_error_code = 0;
    } else {
       alertdlg (translate("Error"), "Error " + errorcode + " : " + response);
       id('updatemsg').innerHTML = translate("Upload failed : ") + errorcode + " :" + response;
    }
    console.log("Error " + errorcode + " : " + response);
    update_ongoing = false;
    SendGetHttp("/updatefw");
}
