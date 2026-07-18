import bcrypt from "bcryptjs";
import { Role } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { createToken } from "../../utilities/jwt";
import { ILogin, IRegisterUser } from "./auth.interface";

const regUserDb = async (payload: IRegisterUser) => {
  const { email, password, name, phone, role } = payload;
  const hashPassword = await bcrypt.hash(
    password,
    Number(config.BCRYPT_SALT_ROUNDS),
  );

  const result = await prisma.user.create({
    data: {
      email,
      password: hashPassword,
      name,
      phone,
      role,
    },
  });

  const userData = await prisma.user.findUnique({
    where: {
      email: result.email,
    },
    omit: { password: true },
  });

  return userData;
};

const loginUserDb = async (payload: ILogin) => {
  const { email, password } = payload;
  const userData = await prisma.user.findFirstOrThrow({
    where: { email },
  });

  const isPassVerified = await bcrypt.compare(password, userData.password);
  if (!isPassVerified) {
    throw new Error("Wrong Password");
  }

  const jwtPayload = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };

  const refreshToken = createToken(
    jwtPayload,
    config.JWT_REFRESH_SECRET,
    config.JWT_REFRESH_EXPIRES_IN,
  );

  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET,
    config.JWT_ACCESS_EXPIRES_IN,
  );

  return { refreshToken, accessToken };
};

const getInfoDb = async (email: string) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email },
    omit: { password: true },
  });

  return userData;
};

export { getInfoDb, loginUserDb, regUserDb };