var db = require("./db");
var template = require("./template");
var url = require("url");
var qs = require("querystring");
var sanitizeHTML = require("sanitize-html");

exports.home = function (request, response) {
  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;
    db.query("SELECT * FROM author", function (err2, authors) {
      var title = "Author List";
      var table = `<table>
      <tr>
          <td>name</td>
          <td>profile</td>
          <td>update</td>
          <td>delete</td>
      </tr>
      ${template.authorTable(authors)}
    </table>
    <style>
      table{
          border-collapse:collapse;
      }
      td{
          border:1px solid black;
          padding:3px;
      }
      </style>
      `;
      var body = `<h2>${sanitizeHTML(title)}</h2><p>${table}</p>`;
      var control = `<form action="/author/create_process" method="post">
      <p><input type="text" name="name" placeholder="name"></p>
      <p><textarea name="profile" placeholder="profile"></textarea></p>
      <p><input type="submit" value="update"></p></form>`;
      var list = template.topicList(topics);
      var html = template.html(title, list, control, body);
      response.writeHead(200);
      response.end(html); // 최종적으로 전송할 데이터
    });
  });
};

exports.create__process = function (request, response) {
  var body = "";
  request.on("data", function (data) {
    // 데이터 수신할 때 작동하는 이벤트
    body += data;
  });
  request.on("end", function () {
    // 데이터 수신이 끝났을 경우 작동하는 이벤트
    var post = qs.parse(body);
    db.query(
      `
      INSERT INTO author (name, profile)
       VALUES(?, ?)`,
      [post.name, post.profile],
      function (err, result) {
        if (err) throw err;
        response.writeHead(302, { Location: `/author` });
        response.end();
      }
    );
  });
};

exports.update = function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;
    db.query("SELECT * FROM author", function (err2, authors) {
      if (err2) throw err2;
      db.query("SELECT * FROM author WHERE id=?", [queryData.id], function (
        err3,
        author
      ) {
        if (err3) throw err3;
        var title = "Author List";
        var table = `<table>
                <tr>
                    <td>name</td>
                    <td>profile</td>
                    <td>update</td>
                    <td>delete</td>
                </tr>
                ${template.authorTable(authors)}
              </table>
              <style>
                table{
                    border-collapse:collapse;
                }
                td{
                    border:1px solid black;
                    padding:3px;
                }
                </style>
                `;
        var control = `<form action="/author/update_process" method="post">
        <p><input type="hidden" name="id" value=${author[0].id}></p>
        <p><input type="text" name="name" placeholder="name" value="${sanitizeHTML(
          author[0].name
        )}"></p>
        <p><textarea name="profile" placeholder="profile">${sanitizeHTML(
          author[0].profile
        )}</textarea></p>
        <p><input type="submit" value="update"></p></form>`;
        var body = `<h2>${title}</h2><p>${table}</p>`;
        var list = template.topicList(topics);
        var html = template.html(title, list, control, body);
        response.writeHead(200);
        response.end(html); // 최종적으로 전송할 데이터
      });
    });
  });
};

exports.update__process = function (request, response) {
  var body = "";
  request.on("data", function (data) {
    // 데이터 수신할 때 작동하는 이벤트
    body += data;
  });
  request.on("end", function () {
    // 데이터 수신이 끝났을 경우 작동하는 이벤트
    var post = qs.parse(body);
    var id = post.id;
    var name = post.name;
    var profile = post.profile;
    db.query(
      "UPDATE author SET name=?, profile=? WHERE id=?",
      [name, profile, id],
      function (err, result) {
        if (err) throw err;
        response.writeHead(302, { Location: `/author` });
        response.end();
      }
    );
  });
};

exports.delete__process = function (request, response) {
  var body = "";
  request.on("data", function (data) {
    // 데이터 수신할 때 작동하는 이벤트
    body += data;
  });
  request.on("end", function () {
    // 데이터 수신이 끝났을 경우 작동하는 이벤트
    var post = qs.parse(body);
    var id = post.id;
    db.query("DELETE FROM topic WHERE author_id=?", [id], function (
      err,
      result
    ) {
      if (err) throw err;
      db.query("DELETE FROM author WHERE id=?", [id], function (err2, result2) {
        if (err2) throw err2;
        response.writeHead(302, { Location: `/author` });
        response.end();
      });
    });
  });
};
