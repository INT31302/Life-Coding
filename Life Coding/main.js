var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

function templateHTML(title, list, body, control) {
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
  ${control}
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
    fs.readdir("./data", function (err, filelist) {
      // 파일리스트 불러오기
      var list = getFileListHTML(filelist);
      if (queryData.id === undefined) {
        // Home인 경우
        var title = "Welcome";
      } else {
        var title = queryData.id;
      }
      fs.readFile(`data/${title}`, "utf8", function (err, description) {
        // 파일 읽기
        var control;
        var body = `<h2>${title}</h2><p>${description}</p>`;

        if (queryData.id === undefined) {
          description = "Hello, Node.js";
          control = `<a href="/create">create</a>`;
        } else {
          control = `<a href="/create">create</a>
          <a href="/update?id=${title}">update</a>`;
        }
        var template = templateHTML(title, list, body, control);
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
        <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
        `,
        ``
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
  } else if (pathname === "/update") {
    fs.readdir("./data", function (err, filelist) {
      // 파일리스트 불러오기
      var list = getFileListHTML(filelist);
      var title = queryData.id;
      fs.readFile(`data/${title}`, "utf8", function (err, description) {
        // 파일 읽기
        var control;
        var body = `
        <form action="/update_process" method="post">
        <input type="hidden", name ="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value=${title}></p>
        <p><textarea name="description" placeholder="description">${description}</textarea></p>
        <p><input type="submit"></p>
        `;

        control = `<a href="/create">create</a>
          <a href="/update?id=${title}">update</a>`;
        var template = templateHTML(title, list, body, control);
        response.writeHead(200);
        response.end(template); // 최종적으로 전송할 데이터
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function (data) {
      // 데이터 수신할 때 작동하는 이벤트
      body += data;
    });
    request.on("end", function () {
      // 데이터 수신이 끝났을 경우 작동하는 이벤트
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (err) {
        fs.writeFile(`./data/${title}`, description, "utf8", function (err) {
          if (err) throw err;
          console.log("The file has been saved");
          response.writeHead(302, {
            Location: `http://localhost:3000/?id=${title}`,
          });
          response.end();
        });
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
});

app.listen(3000);
