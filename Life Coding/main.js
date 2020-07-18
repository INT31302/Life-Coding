var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

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
  <a href="/create">create</a>
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
  } else if (pathname === "/create") {
    fs.readdir("./data", function (err, filelist) {
      // 파일리스트 불러오기
      var title = "WEB - create";
      var list = getFileListHTML(filelist);
      var template = templateHTML(
        title,
        list,
        `
        <form action="http://localhost:3000/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
        `
      );
      response.writeHead(200);
      response.end(template);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", function (data) {
      // 데이터 수신할 때 작동하는 이벤트
      body += data;
    });
    request.on("end", function () {
      // 데이터 수신이 끝났을 경우 작동하는 이벤트
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`./data/${title}`, description, "utf8", function (err) {
        if (err) throw err;
        console.log("The file has been saved");
        response.writeHead(302, {
          Location: `http://localhost:3000/?id=${title}`,
        });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
});

app.listen(3000);
