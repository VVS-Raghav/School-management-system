import jwt from "jsonwebtoken";

const authMiddleware = (roles=[]) => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: "Failed to authenticate token" });
      }

      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      
      next();
    });
  };
}

export default authMiddleware;