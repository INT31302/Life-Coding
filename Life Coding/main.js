var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template");
var path = require("path");
var sanitizeHtml = require("sanitize-html");

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (err, filelist) {
        // 파일리스트 불러오기
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = template.list(filelist);
        var html = template.html(
          title,
          list,
          body,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html); // 최종적으로 전송할 데이터
      });
    } else {
      fs.readdir("./data", function (err, filelist) {
        // 파일리스트 불러오기
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
          // 파일 읽기
          var title = queryData.id;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description);
          var list = template.list(filelist);
          var body = `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`;
          var html = template.html(
            sanitizedTitle,
            list,
            body,
            `<a href="/create">create</a>
      <a href="/update?id=${sanitizedTitle}">update</a>
      <form action="delete_process" method="post">
      <input type="hidden" name="id" value="${sanitizedTitle}">
      <input type="submit" value="delete">
      </form>`
          );
          response.writeHead(200);
          response.end(html); // 최종적으로 전송할 데이터
        });
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (err, filelist) {
      // 파일리스트 불러오기
      var title = "WEB - create";
      var list = template.list(filelist);
      var html = template.html(
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
      response.end(html);
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
          Location: `/?id=${title}`,
        });
        response.end();
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", function (err, filelist) {
      // 파일리스트 불러오기
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
        // 파일 읽기
        var title = queryData.id;
        var list = template.list(filelist);
        var control;
        var body = `
        <form action="/update_process" method="post">
        <input type="hidden", name ="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value=${title}></p>
        <p><textarea name="description" placeholder="description">${description}</textarea></p>
        <p><input type="submit"></p>
        `;
        control = `<a href="/create">create</a>
          <a href="/update?id=${title}">update</a>
          <form action="delete_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <input type="submit" value="delete">
          </form>`;
        var html = template.html(title, list, body, control);
        response.writeHead(200);
        response.end(html); // 최종적으로 전송할 데이터
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
            Location: `/?id=${title}`,
          });
          response.end();
        });
      });
    });
  } else if (pathname == "/delete_process") {
    var body = "";
    request.on("data", function (data) {
      // 데이터 수신할 때 작동하는 이벤트
      body += data;
    });
    request.on("end", function () {
      // 데이터 수신이 끝났을 경우 작동하는 이벤트
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function (err) {
        if (err) throw err;
        response.writeHead(302, { Location: `/` });
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
