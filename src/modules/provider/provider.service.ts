import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IGearPayload } from "./provider.interface";

const addGearDb = async (providerId: string, payload: IGearPayload) => {
  const { name, description, brand, images, pricePerDay, stock, isAvailable, categoryId } = payload;

  await prisma.category.findUniqueOrThrow({ where: { id: categoryId } });

  const result = await prisma.item.create({
    data: {
      name,
      description,
      brand,
      images,
      pricePerDay,
      stock,
      isAvailable,
      categoryId,
      providerId,
    },
    include: { category: { select: { name: true, slug: true } } },
  });

  return result;
};

const updateGearDb = async (
  providerId: string,
  gearId: string,
  payload: Partial<IGearPayload>,
) => {
  const gear = await prisma.item.findUniqueOrThrow({ where: { id: gearId } });

  if (gear.providerId !== providerId) {
    throw new Error("This gear is not yours!");
  }

  const result = await prisma.item.update({
    where: { id: gearId },
    data: payload,
    include: { category: { select: { name: true, slug: true } } },
  });

  return result;
};

const deleteGearDb = async (providerId: string, gearId: string) => {
  const gear = await prisma.item.findUniqueOrThrow({ where: { id: gearId } });

  if (gear.providerId !== providerId) {
    throw new Error("This gear is not yours!");
  }

  const orderCount = await prisma.orderItem.count({ where: { itemId: gearId } });

  // gear with rental history cannot be hard deleted, mark unavailable instead
  if (orderCount > 0) {
    const result = await prisma.item.update({
      where: { id: gearId },
      data: { isAvailable: false, stock: 0 },
    });
    return result;
  }

  const result = await prisma.item.delete({ where: { id: gearId } });

  return result;
};

const getProviderOrdersDb = async (providerId: string) => {
  const result = await prisma.order.findMany({
    where: {
      orderItems: { some: { item: { providerId } } },
    },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      orderItems: {
        where: { item: { providerId } },
        include: { item: { select: { name: true, brand: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const updateOrderStatusDb = async (
  providerId: string,
  orderId: string,
  status: string,
) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { orderItems: { include: { item: true } } },
  });

  const isProviderOrder = order.orderItems.some(
    (orderItem) => orderItem.item.providerId === providerId,
  );
  if (!isProviderOrder) {
    throw new Error("This order does not contain your gear!");
  }

  // valid status flow: PLACED > CONFIRMED > PAID > PICKED_UP > RETURNED
  const allowedTransitions: Record<string, OrderStatus> = {
    [`${OrderStatus.PLACED}>${OrderStatus.CONFIRMED}`]: OrderStatus.CONFIRMED,
    [`${OrderStatus.PAID}>${OrderStatus.PICKED_UP}`]: OrderStatus.PICKED_UP,
    [`${OrderStatus.PICKED_UP}>${OrderStatus.RETURNED}`]: OrderStatus.RETURNED,
  };

  const nextStatus = allowedTransitions[`${order.status}>${status}`];
  if (!nextStatus) {
    throw new Error(`Order status cannot change from ${order.status} to ${status}!`);
  }

  const result = await prisma.$transaction(async (tx) => {
    // returned gear goes back to stock
    if (nextStatus === OrderStatus.RETURNED) {
      for (const orderItem of order.orderItems) {
        await tx.item.update({
          where: { id: orderItem.itemId },
          data: { stock: { increment: orderItem.quantity } },
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });

    return updated;
  });

  return result;
};

export {
  addGearDb,
  deleteGearDb,
  getProviderOrdersDb,
  updateGearDb,
  updateOrderStatusDb,
};