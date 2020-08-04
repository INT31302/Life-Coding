exports.html = (
  title,
  list,
  body,
  control,
  authStatusUI = '<a href="/auth/login">login</a>'
) => {
  return `
    <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
  ${authStatusUI}
  <h1><a href="/">WEB</a></h1>
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
    list += `<li><a href="/topic/${filelist[i].id}">${filelist[i].title}</a></li>`;
  }
  list += "</ul>";
  return list;
};
