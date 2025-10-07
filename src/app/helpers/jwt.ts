import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { Secret } from "jsonwebtoken";

const generateToken = (
  payload: any,
  secret: Secret,
  expiresIn: string | any
) => {
  try {
    return jwt.sign(payload, secret, {
      algorithm: "HS256",
      expiresIn,
    });
  } catch (error) {
    throw error;
  }
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};
0;
export const jwtHelpers = {
  generateToken,
  verifyToken,
};
