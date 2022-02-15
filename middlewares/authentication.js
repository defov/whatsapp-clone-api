const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    // let token = req.session.token;
    const token = req.headers['x-auth-token']
  
    if (!token) {
      return res.status(403).send({
        error: true,
        message: "No token provided!",
      });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          error: true,
          message: "Unauthorized!",
        });
      }
      req.user_id = decoded.id;
      next();
    });
};

module.exports = verifyToken