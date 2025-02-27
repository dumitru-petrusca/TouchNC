import {parseResponse} from './fs';

test('parse response', () => {
  let r = parseResponse(json);
  expect(JSON.stringify(r))
      .toBe(`{"files":[{"name":"index.html.gz","path":"/index.html.gz","size":34336,"isDir":false},{"name":"favicon.ico","path":"/favicon.ico","size":15406,"isDir":false},{"name":"config.yaml","path":"/config.yaml","size":2283,"isDir":false},{"name":"macrocfg.json","path":"/macrocfg.json","size":1090,"isDir":false},{"name":"preferences.json","path":"/preferences.json","size":795,"isDir":false},{"name":"preferences2.json","path":"/preferences2.json","size":790,"isDir":false},{"name":"touchnc.json","path":"/touchnc.json","size":168,"isDir":false}],"total":196608,"used":77824}`)
});

let json = `
{
  "path": "",
  "total": "192.00 KB",
  "used": "76.00 KB",
  "occupation": "39",
  "status": "Ok",
  "files": [
    {
      "name": "config.yaml",
      "shortname": "config.yaml",
      "size": "2283",
      "datetime": ""
    },
    {
      "name": "favicon.ico",
      "shortname": "favicon.ico",
      "size": "15406",
      "datetime": ""
    },
    {
      "name": "index.html.gz",
      "shortname": "index.html.gz",
      "size": "34336",
      "datetime": ""
    },
    {
      "name": "macrocfg.json",
      "shortname": "macrocfg.json",
      "size": "1090",
      "datetime": ""
    },
    {
      "name": "preferences.json",
      "shortname": "preferences.json",
      "size": "795",
      "datetime": ""
    },
    {
      "name": "preferences2.json",
      "shortname": "preferences2.json",
      "size": "790",
      "datetime": ""
    },
    {
      "name": "touchnc.json",
      "shortname": "touchnc.json",
      "size": "168",
      "datetime": ""
    }
  ]
}`