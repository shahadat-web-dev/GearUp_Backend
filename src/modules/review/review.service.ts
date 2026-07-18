import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./review.interface";

const createReviewDb = async (customerId: string, payload: ICreateReview) => {
  const { itemId, rentalOrderId, rating, comment } = payload;

  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5!");
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: rentalOrderId },
    include: { orderItems: true },
  });

  if (order.customerId !== customerId) {
    throw new Error("This is not your rental order!");
  }

  if (order.status !== OrderStatus.PAID) {
    throw new Error("You can review only after returning the gear!");
  }

  const isItemInOrder = order.orderItems.some(
    (orderItem) => orderItem.itemId === itemId,
  );
  if (!isItemInOrder) {
    throw new Error("This gear is not in your rental order!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: { customerId, itemId, rentalOrderId, rating, comment },
    });

    // recalculate gear average rating
    const avg = await tx.review.aggregate({
      where: { itemId },
      _avg: { rating: true },
    });

    await tx.item.update({
      where: { id: itemId },
      data: { avgRating: avg._avg.rating },
    });

    return review;
  });

  return result;
};

export { createReviewDb };