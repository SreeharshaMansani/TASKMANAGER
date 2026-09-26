const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "hkjjcbcja";

module.exports = async function (req, res, next) {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    
    if (!data || !data.user) {
      return res.status(401).json({ error: "Invalid token or missing user information in token" });
    }

    req.user = {
      id: data.user.id,
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token has expired, please log in again" });
    }
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};
