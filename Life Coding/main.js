var http = require("http");
var fs = require("fs");
var url = require("url");

function templateHTML(title, list, body) {
  return `
  <!doctype html>
<html>
<head>
  <title>WEB1 - ${title}</title>
  <meta charset="utf-8">
</head>
<body>
  <h1><a href="/">WEB</a></h1>
  ${list}
  ${body}
</body>
</html>
  `;
}

function getFileListHTML(filelist) {
  var list = "<ul>";
  for (var i = 0; i < filelist.length; i++) {
    list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
  }
  list += "</ul>";
  return list;
}

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      // Home인 경우
      var title = "Welcome";
    } else {
      var title = queryData.id;
    }
    fs.readdir("./data", function (err, filelist) {
      // 파일리스트 불러오기
      var list = getFileListHTML(filelist);

      fs.readFile(`data/${title}`, "utf8", function (err, description) {
        // 파일 읽기
        if (queryData.id === undefined) {
          description = "Hello, Node.js";
        }
        var template = templateHTML(
          title,
          list,
          `<h2>${title}</h2><p>${description}</p>`
        );
        response.writeHead(200);
        response.end(template); // 최종적으로 전송할 데이터
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
});

app.listen(3000);
