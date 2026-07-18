import { Status } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUsersDb = async () => {
  const result = await prisma.user.findMany({
    omit: { password: true },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const updateUserStatusDb = async (userId: string, status: string) => {
  if (status !== Status.ACTIVE && status !== Status.SUSPENDED) {
    throw new Error("Status must be ACTIVE or SUSPENDED!");
  }

  const result = await prisma.user.update({
    where: { id: userId },
    data: { status },
    omit: { password: true },
  });

  return result;
};

const getAllGearListingsDb = async () => {
  const result = await prisma.item.findMany({
    include: {
      category: { select: { name: true, slug: true } },
      provider: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getAllRentalsDb = async () => {
  const result = await prisma.order.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      orderItems: { include: { item: { select: { name: true, brand: true } } } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

export {
  getAllGearListingsDb,
  getAllRentalsDb,
  getAllUsersDb,
  updateUserStatusDb,
};