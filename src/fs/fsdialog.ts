import {getElement, label, panel, setEnabled, setLabel} from '../ui/ui';
import {httpCommunicationLocked, serverUrl} from '../http/http';
import {FS, FSFile, FSResponse, FSType, toSizeString} from './fs';
import {closeModal, pushModal} from '../dialog/modaldlg';
import {AlertDialog} from '../dialog/alertdlg';
import {translate} from '../translate.js';
import {ConfirmDialog} from '../dialog/confirmdlg';
import {InputDialog} from '../dialog/inputdlg';
import {modalClass, titleClass, titleRowClass} from '../dialog/dialogStyles';
import {css, cssClass, transparentClass} from '../ui/commonStyles';
import {Consumer, EventHandler} from '../common/common';
import {btnIcon, button} from '../ui/button';
import {Icon, svgIcon} from '../ui/icons';

export class FSDialog {
  fs: FS
  action?: Consumer<FSFile>
  dialog: HTMLElement

  constructor(type: FSType, action?: Consumer<FSFile>) {
    this.action = action;
    this.fs = new FS(type);
    this.dialog = this.createFSDialog();
    document.body.appendChild(this.dialog)
    pushModal(this.dialog, () => document.body.removeChild(this.dialog))
    this.fs.loadFiles()
        .then(this.updateFiles.bind(this))
        .catch(reason => {
          this.close()
          new AlertDialog(translate("Error"), reason);
          throw reason;
        });
  }

  createFSDialog(): HTMLElement {
    return panel("", modalClass,
        panel("", filesContentClass, [
          panel("", titleRowClass, label("", this.fs.name, titleClass)),
          panel("", filePathRowClass, [
            button("", btnIcon(Icon.upload), "Upload File", this.uploadFile.bind(this)),
            button("", btnIcon(Icon.folderNew), "New", this.createDir.bind(this)),
            button("file-up", btnIcon(Icon.folderUp), "Go To Parent Folder", () => this.fs.cdParent().then(files => this.updateFiles(files))),
            label("file-path", "/"),
          ]),
          panel("files", filesClass, []),
          panel("", bottomRowClass, [
            label("fs-summary", "", titleClass),
            button("", "Close", "Close", this.close.bind(this))
          ])
        ])
    )
  }

  updateFiles(response: FSResponse) {
    let rows: HTMLElement[] = []
    for (let file of response.files) {
      if (file.isDir) {
        rows.push(panel("", filesRow, [
          svgIcon(Icon.folder, "1em", "1em", "black"), // icon
          button("", file.name, "", () => this.fs.cdChild(file).then(files => this.updateFiles(files)), "", transparentClass), // name
          label("", ""), // size
          label("", ""), // download
          button("", btnIcon(Icon.edit), "", () => this.rename(file)),
          button("", btnIcon(Icon.delete), "", () => this.delete(file))
        ]))
      } else {
        rows.push(panel("", filesRow, [
          svgIcon(Icon.file, "1em", "1em", "black"),
          this.action == null ?
              label("", file.name) :
              button("", file.name, "", () => this.fileSelected(file), "", transparentClass),
          label("", toSizeString(file.size)), // size
          button("", btnIcon(Icon.download), "", () => this.download(file)),
          button("", btnIcon(Icon.edit), "", () => this.rename(file)),
          button("", btnIcon(Icon.delete), "", () => this.delete(file))
        ]))
      }
    }
    getElement("files").replaceChildren(...rows)
    setLabel("file-path", this.fs.getCurrentPath())
    setEnabled("file-up", this.fs.getCurrentPath() != "/")
    setLabel("fs-summary", `${translate("Free:")} ${toSizeString(response.total - response.used)} / ${toSizeString(response.total)}`)
  }

  close() {
    if (this.fs.getUploadingFile() != "") {
      new AlertDialog(translate("Busy..."), translate("Upload is ongoing, please wait and retry."));
      return;
    }
    closeModal("");
  }

  createDir() {
    new InputDialog(translate("Enter Directory Name"), translate("Name:"), "", (fileName: string) => {
      if (fileName.length > 0) {
        this.fs.createDir(fileName).then(files => this.updateFiles(files))
      }
    });
  }

  download(file: FSFile) {
    let url = (this.fs.type == FSType.SDCard) ? "SD/" + file.path : file.path;

    // (window as any).electron.downloadFile(serverUrl(url))
    //     .then(() => console.log('Download started!'))
    //     .catch((error: Error) => console.error('Download failed:', error));

    const anchor = document.createElement("a");
    anchor.href = serverUrl(url);
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  delete(file: FSFile) {
    let type = file.isDir ? "folder" : "file"
    new ConfirmDialog(translate(`Delete ${type} ${file.name}?`),
        () => this.fs.deleteFile(file).then(files => this.updateFiles(files)));
  }

  rename(file: FSFile) {
    new InputDialog(translate("New File Name"), translate("Name:"), file.name, (newFileName: string) => {
      if (newFileName != null && newFileName != "") {
        this.fs.renameFile(file, newFileName).then(files => this.updateFiles(files))
      }
    });
  }

  fileSelected(file: FSFile) {
    this.close()
    this.action?.(file)
  }

  uploadProgressDisplay(e: ProgressEvent) {
    if (e.lengthComputable) {
      //TODO -implement
      // let percentComplete = (e.loaded / e.total) * 100;
    }
  }

  uploadFile() {
    if (httpCommunicationLocked()) {
      new AlertDialog(translate("Busy..."), translate("Communications are currently locked, please wait and retry."));
      return;
    }
    let fileDialog = openFileDialog(() => {
      let files = fileDialog.files
      if (files != null) {
        this.fs.uploadFile(files)
            .then(files => this.updateFiles(files))
            .catch(reason => console.log("Error " + reason))
        // , this.uploadProgressDisplay.bind(this), this.updateFiles.bind(this),
      }
    });
  }
}

function openFileDialog(action: EventHandler): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "file";
  input.style.display = "none";
  input.id = "file-select";
  input.name = "myfiles[]";
  input.multiple = false;
  input.onchange = action;
  document.body.appendChild(input);
  input.click()
  return input;
}

const filesContentClass = cssClass("filesContent", css`
  display: grid;
  grid-template-rows: auto auto auto auto;
  gap: 10px;
  border-radius: 10px;
  border: 2px solid #337AB7;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  margin: auto;
  padding: 10px;
  background-color: #fefefe;
  font-size: 3.2rem;
  width: fit-content;
`)

const filePathRowClass = cssClass("filePathRow", css`
  display: grid;
  grid-template-columns: 65px 65px 65px 1fr;
  gap: 10px;
  width: 100%;
  max-width: 100%;
`)

const filesRow = cssClass("filesRow", css`
  display: grid;
  grid-template-columns: 1fr 5fr 3fr 65px 65px 65px;
  width: 100%;
  max-width: 100%;
  gap: 10px;
  align-items: center;
`)

const bottomRowClass = cssClass("bottomRow", css`
  display: grid;
  grid-template-columns: 1fr 215px;
  width: 100%;
  max-width: 100%;
  gap: 10px;
`)

const filesClass = cssClass("files", css`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  height: auto;
  gap: 10px;
  overflow-y: scroll;
`)
