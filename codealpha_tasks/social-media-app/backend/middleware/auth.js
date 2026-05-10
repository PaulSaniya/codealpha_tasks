const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // extract token safely
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    );

    // IMPORTANT: normalize user object
    req.user = {
      id: decoded.id
    };

    if (!req.user.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    next();

  } catch (err) {
    console.log("AUTH ERROR:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};