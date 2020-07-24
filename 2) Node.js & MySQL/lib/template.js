var sanitizeHTML = require("sanitize-html");
var url = require("url");
module.exports = {
  html: function (title, search, list, body, control) {
    return `
    <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    <div>
    <a href="/author">author</a>
    ${search}
    </div>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
    `;
  },
  topicList: function (topics) {
    var list = "<ul>";
    for (var i = 0, len = topics.length; i < len; i++) {
      list += `<li><a href="/?id=${topics[i].id}">${sanitizeHTML(
        topics[i].title
      )}</a></li>`;
    }
    list += "</ul>";
    return list;
  },

  authorComboBox: function (authors, author_id) {
    var tag = "";
    for (var i = 0, len = authors.length; i < len; i++) {
      var selected = "";
      if (authors[i].id === author_id) selected = " selected";
      tag += `<option value="${authors[i].id}"${selected}>${sanitizeHTML(
        authors[i].name
      )}</option>`;
    }
    return `
    <select name ="author">
    ${tag}
    </select>
    `;
  },

  authorTable: function (authors) {
    var tag = "";
    for (var i = 0, len = authors.length; i < len; i++) {
      tag += `<tr>
        <td>${sanitizeHTML(authors[i].name)}</td>
        <td>${sanitizeHTML(authors[i].profile)}</td>
        <td><a href="/author/update?id=${authors[i].id}">update</a></td>
        <td><form action="/author/delete_process" method="post">
        <input type="hidden" name="id" value="${authors[i].id}">
        <input type="submit" value="delete">
        </form></td>
      </tr>
        `;
    }
    return tag;
  },
  searchForm: function (request) {
    var _url = request.url;
    var pathname = url.parse(_url, true).pathname;
    var queryData = url.parse(_url, true).query;
    var path = "";
    var name = "title";
    var value = "";
    if (pathname.startsWith("/author")) {
      path = "author/";
      name = "name";
      if (queryData.name !== undefined) {
        value = queryData.name;
      }
    } else {
      if (queryData.title !== undefined) {
        value = queryData.title;
      }
    }

    var form = `
    <form action="/${path}search" method="get">
    <input name="${name}" value="${value}">
    <input type="submit" value="Search">
  </form>`;
    return form;
  },
};
