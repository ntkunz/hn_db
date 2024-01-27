const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config({ path: "../shhh/.env" });

// ============ version 2 =========

const createLoginJWT = (userId) => {
  const loginTokenCreated = jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "90d",
    }
  );
  return loginTokenCreated;
};

// ============= version 1 ===========

// === Create jwt token with user email ===
const createJWT = (email) => {
  const token = jwt.sign(
    {
      email: email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "90d" }
  );
  return token;
};

// === Protect routes from unauthorized users ===
const protect = (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    //pre signed-in routes bypass
    if (
      req.originalUrl === "/users/login" ||
      req.originalUrl === "/users/newemail" ||
      req.originUrl === "/users/verify" ||
      (req.method === "POST" && req.originalUrl.startsWith("/userskills")) ||
      (req.method === "POST" && req.originalUrl.startsWith("/users"))
    ) {
      next();
      return;
    }
    return res.status(401).json({ message: "not authorized" });
  }

  const [, token] = bearer.split(" ");
  const tokenObject = JSON.parse(token);
  const userToken = tokenObject.userToken;

  if (!userToken) {
    console.log("Cannot validate without user token");
    return res.status(401).json({ message: "invalid token" });
  }

  try {
    //Confirm token is not expired
    const user = jwt.verify(userToken, process.env.JWT_SECRET);
    if (user.exp < Date.now() / 1000) {
      console.log("token expired for user: ", user);
      return res.status(401).json({ message: "token expired" });
    }
    req.user = user; // TODO : This seems useless, test later
    return next();
  } catch (error) {
    console.log("Authorization error: ", error);
    return res.status(401).json({ message: "bad token" });
  }
};

// === hash password ===
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hash(password, salt);
};

// === compare passwords ===
const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// === Decode token email ===
const getInfoFromToken = (token) => {
  try {
    //TODO: re-evaluate below 2 lines and their purpose, may be frivolous
    const tokenObject = JSON.parse(token);
    const tokenValue = tokenObject.userToken;

    try {
      const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      // Check for the specific error indicating an invalid signature
      // TODO : Consider if this check and varying responses is necessary.
      if (
        error instanceof jwt.JsonWebTokenError &&
        error.message === "invalid signature"
      ) {
        return { error: "Invalid token signature" };
      } else {
        return { error: "JWT verification error" };
      }
    }
  } catch (err) {
    console.error("Error decoding token:", err);
    return { error: "Invalid token format" };
  }
};

module.exports = {
  createLoginJWT,
  createJWT,
  protect,
  comparePasswords,
  hashPassword,
  getInfoFromToken,
};
