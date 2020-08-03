exports.authStatusUI = (req) => {
  if (req.user) {
    return `${req.user.nickname} | <a href="/auth/logout">logout</a>`;
  } else {
    return '<a href="/auth/login">login</a>';
  }
};
