import jwt, { SignOptions } from "jsonwebtoken";

interface IJwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

const createToken = (payload: IJwtPayload, secret: string, exp: string) => {
  const token = jwt.sign(payload, secret, {
    expiresIn: exp,
  } as SignOptions);

  return token;
};

const verifyToken = (token: string, secret: string): any => {
  try {
    const verify = jwt.verify(token, secret);
    return verify;
  } catch (error) {
    throw new Error("invalid Token");
  }
};

export { createToken, verifyToken };