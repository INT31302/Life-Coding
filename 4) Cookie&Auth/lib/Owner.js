const cookie = require("cookie");

let isOwner;

exports.getOwner = () => {
  return isOwner;
};

exports.authIsOwner = (req) => {
  if (req.headers.cookie !== undefined) {
    let cookies = cookie.parse(req.headers.cookie);
    console.log(cookies);
    if (cookies.email === "test@test.com" && cookies.password === "1234")
      isOwner = true;
  } else isOwner = false;
};
