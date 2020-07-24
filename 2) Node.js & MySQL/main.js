var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template");
var path = require("path");
var sanitizeHtml = require("sanitize-html");
var mysql = require("mysql");
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "427549",
  database: "opentutorials",
});
db.connect();

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      db.query("SELECT * FROM topic", function (err, topics) {
        if (err) throw err;
        var title = "Welcome";
        var description = "Hello, Node.js";
        var body = `<h2>${title}</h2><p>${description}</p>`;
        var list = template.list(topics);
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
      db.query("SELECT * FROM topic", function (err, topics) {
        if (err) throw err;
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function (
          err2,
          topic
        ) {
          if (err2) throw err2;
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.list(topics);
          var body = `<h2>${title}</h2><p>${description}</p>`;
          var html = template.html(
            title,
            list,
            body,
            `<a href="/create">create</a>
      <a href="/update?id=${queryData.id}">update</a>
      <form action="delete_process" method="post">
      <input type="hidden" name="id" value="${queryData.id}">
      <input type="submit" value="delete">
      </form>`
          );
          response.writeHead(200);
          response.end(html); // 최종적으로 전송할 데이터
        });
      });
    }
  } else if (pathname === "/create") {
    db.query("SELECT * FROM topic", function (err, topics) {
      if (err) throw err;
      var title = "Create";
      var list = template.list(topics);
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
      var filteredTitle = sanitizeHtml(path.parse(post.title).base);
      var title = filteredTitle;
      var sanitizedDescription = sanitizeHtml(post.description);
      var description = sanitizedDescription;
      db.query(
        `
      INSERT INTO topic (title, description, created, author_id)
       VALUES(?, ?, NOW(), ?)`,
        [title, description, 1],
        function (err, result) {
          if (err) throw err;
          response.writeHead(302, { Location: `/?id=${result.insertId}` });
          response.end();
        }
      );
    });
  } else if (pathname === "/update") {
    db.query("SELECT * FROM topic", function (err, topics) {
      if (err) throw err;
      db.query("SELECT * FROM topic WHERE id=?", [queryData.id], function (
        err2,
        topic
      ) {
        if (err2) throw err2;
        var title = topic[0].title;
        var id = topic[0].id;
        var description = topic[0].description;
        var list = template.list(topics);
        var html = template.html(
          title,
          list,
          `
          <form action="/update_process" method="post">
          <p><input type="hidden" name="id" value=${id}></p>
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p><textarea name="description" placeholder="description" >${description}</textarea></p>
          <p><input type="submit"></p>
          `,
          `<a href="/create">create</a>
          <a href="/update?id=${id}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
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
      var filteredId = path.parse(post.id).base;
      var filteredTitle = sanitizeHtml(path.parse(post.title).base);
      var id = filteredId;
      var title = filteredTitle;
      var description = sanitizeHtml(post.description);
      db.query(
        "UPDATE topic SET title=?, description=? WHERE id=?",
        [title, description, id],
        function (err, result) {
          if (err) throw err;
          response.writeHead(302, { Location: `/?id=${id}` });
          response.end();
        }
      );
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
      db.query("DELETE FROM topic WHERE id=?", [filteredId], function (
        err,
        result
      ) {
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
