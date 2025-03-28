var ssid_item_scanwifi = -1;
var ssid_subitem_scanwifi = -1;
//scanwifi dialog
function scanwifidlg(item, subitem) {
    var modal = setActiveModal('scanwifidlg.html', scanwifidlg_close);
    if (modal == null) return;
    ssid_item_scanwifi = item;
    ssid_subitem_scanwifi = subitem;
    showModal();
    refresh_scanwifi();
}

function refresh_scanwifi() {
    displayBlock('AP_scan_loader');
    displayNone('AP_scan_list');
    displayBlock('AP_scan_status');
    id('AP_scan_status').innerHTML = translate("Scanning");
    displayNone('refresh_scanwifi_btn');
    //removeIf(production)
    var response_text = "{\"AP_LIST\":[{\"SSID\":\"HP-Setup>71-M277LaserJet\",\"SIGNAL\":\"90\",\"IS_PROTECTED\":\"0\"},{\"SSID\":\"NETGEAR_2GEXT_OFFICE2\",\"SIGNAL\":\"58\",\"IS_PROTECTED\":\"1\"},{\"SSID\":\"NETGEAR_2GEXT_OFFICE\",\"SIGNAL\":\"34\",\"IS_PROTECTED\":\"1\"},{\"SSID\":\"NETGEAR_2GEXT_COULOIR\",\"SIGNAL\":\"18\",\"IS_PROTECTED\":\"1\"},{\"SSID\":\"HP-Print-D3-ColorLaserJetPro\",\"SIGNAL\":\"14\",\"IS_PROTECTED\":\"0\"},{\"SSID\":\"external-wifi\",\"SIGNAL\":\"20\",\"IS_PROTECTED\":\"1\"},{\"SSID\":\"Livebox-4D0F\",\"SIGNAL\":\"24\",\"IS_PROTECTED\":\"1\"},{\"SSID\":\"SFR_2000\",\"SIGNAL\":\"20\",\"IS_PROTECTED\":\"1\"},{\"SSID\":\"SFR_0D90\",\"SIGNAL\":\"26\",\"IS_PROTECTED\":\"1\"},{\"SSID\":\"SFRWiFiFON\",\"SIGNAL\":\"18\",\"IS_PROTECTED\":\"0\"},{\"SSID\":\"SFRWiFiMobile\",\"SIGNAL\":\"18\",\"IS_PROTECTED\":\"1\"},{\"SSID\":\"FreeWifi\",\"SIGNAL\":\"16\",\"IS_PROTECTED\":\"0\"}]}";
    getscanWifiSuccess(response_text);
    return;
    //endRemoveIf(production)
    var url = "/command?plain=" + encodeURIComponent("[ESP410]");
    SendGetHttp(url, getscanWifiSuccess, getscanWififailed);
}

function process_scanWifi_answer(response_text) {
    var result = true;
    var content = "";
    try {
        var response = JSON.parse(response_text);
        if (typeof response.AP_LIST == 'undefined') {
            result = false;
        } else {
            var aplist = response.AP_LIST;
            //console.log("found " + aplist.length + " AP");
            aplist.sort(function(a, b) {
                return (parseInt(a.SIGNAL) < parseInt(b.SIGNAL)) ? -1 : (parseInt(a.SIGNAL) > parseInt(b.SIGNAL)) ? 1 : 0
            });
            for (var i = aplist.length - 1; i >= 0; i--) {
                content += "<tr>";
                content += "<td style='vertical-align:middle'>";
                content += aplist[i].SSID;
                content += "</td>";
                content += "<td style='text-align: center;vertical-align:middle;'>";
                content += aplist[i].SIGNAL;
                content += "%</td>";
                content += "<td style='vertical-align:middle'><center>";
                if (aplist[i].IS_PROTECTED == "1") content += get_icon_svg("lock");
                content += "</></td>";
                content += "<td>";
                content += "<button class='btn btn-primary' onclick='select_ap_ssid(\"" + aplist[i].SSID.replace("'","\\'").replace("\"","\\\"") + "\");'>";
                content += get_icon_svg("ok");
                content += "</button>";
                content += "</td>";
                content += "</tr>";
            }
        }
    } catch (e) {
        console.error("Parsing error:", e);
        result = false;
    }
    id('AP_scan_data').innerHTML = content;
    return result;
}

function select_ap_ssid(ssid_name) {
    var val = id("setting_" + ssid_item_scanwifi + "_" + ssid_subitem_scanwifi).value;
    id("setting_" + ssid_item_scanwifi + "_" + ssid_subitem_scanwifi).value = ssid_name;
    id("setting_" + ssid_item_scanwifi + "_" + ssid_subitem_scanwifi).focus();
    if (val != ssid_name)setsettingchanged(ssid_item_scanwifi, ssid_subitem_scanwifi);
    closeModal("Ok");
}

function getscanWifiSuccess(response) {
    if (!process_scanWifi_answer(response)) {
        getscanWififailed(406, translate("Wrong data"));
        return;
    }
    displayNone('AP_scan_loader');
    displayBlock('AP_scan_list');
    displayNone('AP_scan_status');
    displayBlock('refresh_scanwifi_btn');
}

function getscanWififailed(error_code, response) {
    console.log("Error " + error_code + " :" + response);
    displayNone('AP_scan_loader');
    displayBlock('AP_scan_status');
    id('AP_scan_status').innerHTML = translate("Failed:") + error_code + " " + response;
    displayBlock('refresh_scanwifi_btn');
}

function scanwifidlg_close(response) {
    //console.log(response);
}
