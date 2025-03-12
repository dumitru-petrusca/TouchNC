import {sendHttpRequest} from '../http/http';

export enum FSType {
  Local,
  SDCard
}

export class FSFile {
  name: string
  path: string
  size: number
  isDir: boolean

  constructor(name: string, path: string, size: number, isDir: boolean) {
    this.name = name;
    this.path = path;
    this.size = size;
    this.isDir = isDir;
  }
}

export class FSResponse {
  files: FSFile[]
  total: number
  used: number

  constructor(files: FSFile[], total: number, used: number) {
    this.files = files;
    this.total = total;
    this.used = used;
  }
}

export type FSResponseFn = (response: FSResponse) => void

export class FS {
  public readonly name: string
  public readonly type: FSType
  private readonly baseUrl: string
  private currentPath: string
  private uploadingFile = "";

  constructor(type: FSType) {
    this.type = type;
    this.currentPath = "/";
    this.name = type == FSType.Local ? "FluidNC" : "SD Card"
    this.baseUrl = type == FSType.Local ? "/files" : "/upload"
  }

  cd(path: string): Promise<FSResponse> {
    this.currentPath = path
    console.log("Current path: " + this.currentPath)
    return this.loadFiles()
  }

  cdParent(): Promise<FSResponse> {
    let pos = this.currentPath.lastIndexOf("/", this.currentPath.length - 2)
    return this.cd(this.currentPath.slice(0, pos + 1))
  }

  cdChild(dir: FSFile): Promise<FSResponse> {
    return this.cd(this.currentPath + dir.name + "/")
  }

  loadFiles(): Promise<FSResponse> {
    return this.sendFileCommand('list', 'all');
  }

  renameFile(file: FSFile, newFileName: string): Promise<FSResponse> {
    return this.sendFileCommand('rename', file.name, newFileName);
  }

  deleteFile(file: FSFile): Promise<FSResponse> {
    let cmd = file.isDir ? "deletedir" : "delete";
    return this.sendFileCommand(cmd, file.name);
  }

  createDir(fileName: string): Promise<FSResponse> {
    return this.sendFileCommand("createdir", fileName.trim())
  }

  uploadFile(files: FileList): Promise<FSResponse> {
    let form = new FormData();
    form.append('path', this.currentPath);
    for (let i = 0; i < files.length; i++) {
      let file = files.item(i);
      if (file != null) {
        form.append(this.currentPath + files[i].name + "S", String(file.size));  // append file size first to check updload is complete
        form.append('myfile[]', files[i], this.currentPath + files[i].name);
      }
    }
    this.uploadingFile = files.length == 1 ? files[0].name : "";
    return fetch(this.baseUrl, {method: 'POST', body: form})
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          this.uploadingFile = ""
          return response.text()
        })
        .then(text => text.replace("\"status\":\"Ok\"", "\"status\":\"Upload done\""))
        .then(text => parseResponse(text))
        .catch(reason => {
          this.uploadingFile = ""
          throw new Error(reason)
        });
  }

  sendFileCommand(action: string, fileName: string, newFileName: string = ""): Promise<FSResponse> {
    let url = `${this.baseUrl}?action=${action}&filename=${encodeURI(fileName)}&path=${encodeURI(this.currentPath)}`;
    if (action == "rename") {
      url += `&newname=${encodeURI(newFileName)}`
    }
    return sendHttpRequest(url).then(value => Promise.resolve(parseResponse(value)))
  }

  getUploadingFile() {
    return this.uploadingFile;
  }

  getCurrentPath() {
    return this.currentPath
  }
}

class JsFile {
  name: string = ""
  size: number = -1
}

export function parseResponse(responseText: string): FSResponse {
  let response = JSON.parse(responseText);
  let files: FSFile[] = []
  for (let i = 0; i < response.files.length; i++) {
    let file = response.files[i] as JsFile;
    if (!fileHidden(file.name)) {
      let path = String(response.path) + "/" + file.name;
      if (!path.startsWith("/")) {
        path = "/" + path;
      }
      files.push(new FSFile(file.name, path, Number(file.size), Number(file.size) == -1))
    }
  }
  files.sort(function (f1: FSFile, f2: FSFile): number {
    return f1.size != f2.size ?
        f2.size - f1.size :
        f1.name.toLowerCase().localeCompare(f2.name.toLowerCase());
  });
  return new FSResponse(files, parseSize(response.total), parseSize(response.used))
}

function fileHidden(fileName: string) {
  return fileName.startsWith(".") || fileName == "System Volume Information";
}

function parseSize(size: string) {
  const [val, unit] = size.split(" ")
  switch (unit) {
    case "GB":
      return Number(val) * 1024 * 1024 * 1024;
    case "MB":
      return Number(val) * 1024 * 1024;
    case "KB":
      return Number(val) * 1024;
    default:
      return Number(val)
  }
}

export function toSizeString(size: number) {
  if (size >= 1024 * 1024 * 1024) {
    return (size / (1024 * 1024 * 1024)).toFixed(1) + "G"
  }
  if (size >= 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + "M"
  }
  if (size >= 1024) {
    return (size / 1024).toFixed(1) + "K"
  }
  return size.toFixed(0)
}

