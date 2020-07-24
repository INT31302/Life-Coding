var db = require("./db");
var template = require("./template");
var url = require("url");
var qs = require("querystring");
var sanitizeHTML = require("sanitize-html");

exports.home = function (request, response) {
  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;
    var title = "Welcome";
    var description = "Hello, Node.js";
    var body = `<h2>${title}</h2><p>${description}</p>`;
    var list = template.topicList(topics);
    var search = template.searchForm(request);
    var html = template.html(
      title,
      search,
      list,
      body,
      `<a href="/create">create</a>`
    );
    response.writeHead(200);
    response.end(html); // 최종적으로 전송할 데이터
  });
};

exports.page = function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;
    db.query(
      `SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`,
      [queryData.id],
      function (err2, topic) {
        if (err2) throw err2;
        var title = topic[0].title;
        var description = topic[0].description;
        var list = template.topicList(topics);
        var search = template.searchForm(request);
        var body = `<h2>${sanitizeHTML(title)}</h2><p>${sanitizeHTML(
          description
        )}</p> by ${sanitizeHTML(topic[0].name)}`;
        var html = template.html(
          title,
          search,
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
      }
    );
  });
};

exports.search = function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var sql = db.query(
    `SELECT * FROM topic WHERE title LIKE ?`,
    [queryData.title + "%"],
    function (err, topics) {
      if (err) throw err;
      var title = "Search Result";
      var list = template.topicList(topics);
      var search = template.searchForm(request);
      var body = `<h2>${sanitizeHTML(title)}</h2>`;
      var html = template.html(title, search, body, list, ``);
      response.writeHead(200);
      response.end(html); // 최종적으로 전송할 데이터
    }
  );
};

exports.create = function (request, response) {
  db.query("SELECT * FROM topic", function (err, topics) {
    if (err) throw err;
    db.query("SELECT * FROM author", function (err2, authors) {
      if (err2) throw err2;
      var title = "Create";
      var list = template.topicList(topics);
      var search = template.searchForm(request);
      var html = template.html(
        title,
        search,
        list,
        `
            <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description"></textarea></p>
            <p>
            ${template.authorComboBox(authors)}
            </p>
            <p><input type="submit"></p></form>
            `,
        `<a href="/create">create</a>`
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};

exports.create__process = function (request, response) {
  var qs = require("querystring");
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
      INSERT INTO topic (title, description, created, author_id)
       VALUES(?, ?, NOW(), ?)`,
      [post.title, post.description, post.author],
      function (err, result) {
        if (err) throw err;
        response.writeHead(302, { Location: `/?id=${result.insertId}` });
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
    db.query("SELECT * FROM topic WHERE id=?", [queryData.id], function (
      err2,
      topic
    ) {
      if (err2) throw err2;
      db.query("SELECT*FROM author", function (err3, authors) {
        if (err3) throw err3;
        var list = template.topicList(topics);
        var search = template.searchForm(request);
        var html = template.html(
          sanitizeHTML(topic[0].title),
          search,
          list,
          `
              <form action="/update_process" method="post">
              <p><input type="hidden" name="id" value=${topic[0].id}></p>
              <p><input type="text" name="title" placeholder="title" value="${sanitizeHTML(
                topic[0].title
              )}"></p>
              <p><textarea name="description" placeholder="description" >${sanitizeHTML(
                topic[0].description
              )}</textarea></p>
              <p>${template.authorComboBox(authors, topic[0].author_id)}</p>
              <p><input type="submit"></p>
              `,
          `<a href="/create">create</a>
              <a href="/update?id=${topic[0].id}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  });
};

exports.update__process = function (request, response) {
  var qs = require("querystring");
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
    db.query(
      "UPDATE topic SET title=?, description=?, author_id=? WHERE id=?",
      [title, description, post.author, id],
      function (err, result) {
        if (err) throw err;
        response.writeHead(302, { Location: `/?id=${id}` });
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
    db.query("DELETE FROM topic WHERE id=?", post.id, function (err, result) {
      if (err) throw err;
      response.writeHead(302, { Location: `/` });
      response.end();
    });
  });
};
