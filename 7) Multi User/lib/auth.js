exports.authStatusUI = (req) => {
  if (req.user) {
    return `${req.user.displayName} | <a href="/auth/logout">logout</a>`;
  } else {
    return '<a href="/auth/login">login</a> | <a href="/auth/register">register</a>';
  }
};
