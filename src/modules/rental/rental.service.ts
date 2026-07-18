import { OrderStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateRental } from "./rental.interface";

const createRentalDb = async (customerId: string, payload: ICreateRental) => {
  const { rentalStartDate, rentalEndDate, items } = payload;

  if (!items || items.length === 0) {
    throw new Error("Please select at least one gear item!");
  }

  const startDate = new Date(rentalStartDate);
  const endDate = new Date(rentalEndDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid rental dates!");
  }

  if (endDate <= startDate) {
    throw new Error("Rental end date must be after start date!");
  }

  const rentalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const result = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const { itemId, quantity = 1 } of items) {
      const gear = await tx.item.findUniqueOrThrow({ where: { id: itemId } });

      if (!gear.isAvailable) {
        throw new Error(`${gear.name} is not available right now!`);
      }

      if (gear.stock < quantity) {
        throw new Error(`${gear.name} has only ${gear.stock} in stock!`);
      }

      await tx.item.update({
        where: { id: itemId },
        data: { stock: { decrement: quantity } },
      });

      totalAmount += Number(gear.pricePerDay) * quantity * rentalDays;
      orderItemsData.push({
        itemId,
        quantity,
        pricePerDay: gear.pricePerDay,
      });
    }

    const order = await tx.order.create({
      data: {
        customerId,
        totalAmount,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: { include: { item: { select: { name: true } } } },
      },
    });

    return order;
  });

  return result;
};

const getMyRentalsDb = async (customerId: string) => {
  const result = await prisma.order.findMany({
    where: { customerId },
    include: {
      orderItems: {
        include: { item: { select: { name: true, brand: true, images: true } } },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getRentalByIdDb = async (
  orderId: string,
  userId: string,
  role: Role,
) => {
  const result = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      orderItems: {
        include: {
          item: {
            select: {
              name: true,
              brand: true,
              images: true,
              provider: { select: { id: true, name: true } },
            },
          },
        },
      },
      payments: true,
    },
  });

  if (role === Role.CUSTOMER && result.customerId !== userId) {
    throw new Error("This is not your rental order!");
  }

  return result;
};

const cancelRentalDb = async (orderId: string, customerId: string) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { orderItems: true },
  });

  if (order.customerId !== customerId) {
    throw new Error("This is not your rental order!");
  }

  if (order.status !== OrderStatus.PLACED) {
    throw new Error(`Order cannot be cancelled, it is already ${order.status}!`);
  }

  const result = await prisma.$transaction(async (tx) => {
    for (const orderItem of order.orderItems) {
      await tx.item.update({
        where: { id: orderItem.itemId },
        data: {
          stock: {
            increment: orderItem.quantity,
          },
          isAvailable: true,
        },
      });
    }

    const cancelled = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    return cancelled;
  });

  return result;
};

export { cancelRentalDb, createRentalDb, getMyRentalsDb, getRentalByIdDb };