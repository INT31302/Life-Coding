const owner = require("./Owner");

exports.html = (
  title,
  list,
  body,
  control,
  authStatusUI = '<a href="/login">login</a>'
) => {
  return `
    <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
  <h1><a href="/">WEB</a></h1>
  ${authStatusUI}
    ${list}
    ${control}
    ${body}
  </body>
  </html>
    `;
};

exports.list = (filelist) => {
  var list = "<ul>";
  for (var i = 0; i < filelist.length; i++) {
    list += `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`;
  }
  list += "</ul>";
  return list;
};

exports.authStatusUI = () => {
  if (owner.getOwner()) {
    return '<a href="/logout">logout</a>';
  } else {
    return '<a href="/login">login</a>';
  }
};
