import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { ICreatePayment } from "./payment.interface";

const createPaymentDb = async (userId: string, payload: ICreatePayment) => {
  const { rentalOrderId } = payload;

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: rentalOrderId },
    include: {
      orderItems: { include: { item: { select: { name: true } } } },
    },
  });

  if (order.customerId !== userId) {
    throw new Error("This is not your rental order!");
  }

  if (
    order.status !== OrderStatus.PLACED &&
    order.status !== OrderStatus.CONFIRMED
  ) {
    throw new Error(`Order is ${order.status}, payment not possible!`);
  }

  const alreadyPaid = await prisma.payment.findFirst({
    where: { rentalOrderId, status: PaymentStatus.COMPLETED },
  });
  if (alreadyPaid) {
    throw new Error("This order is already paid!");
  }

  const itemNames = order.orderItems
    .map((orderItem) => orderItem.item.name)
    .join(", ");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `GearUp Rental Order`,
            description: itemNames,
          },
          unit_amount: Math.round(Number(order.totalAmount) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { rentalOrderId, userId },
    success_url: `${config.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: config.STRIPE_CANCEL_URL,
  });

  const payment = await prisma.payment.create({
    data: {
      transactionId: session.id,
      amount: order.totalAmount,
      method: PaymentMethod.STRIPE,
      rentalOrderId,
      userId,
    },
  });

  return { payment, paymentUrl: session.url };
};

// mark payment completed & order paid (used by confirm api + webhook)
const completePaymentDb = async (transactionId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { transactionId },
      data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
    });

    await tx.order.update({
      where: { id: payment.rentalOrderId },
      data: { status: OrderStatus.PAID },
    });

    return payment;
  });

  return result;
};

const confirmPaymentDb = async (transactionId: string) => {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { transactionId },
  });

  if (payment.status === PaymentStatus.COMPLETED) {
    return payment;
  }

  const session = await stripe.checkout.sessions.retrieve(transactionId);

  if (session.payment_status === "paid") {
    return await completePaymentDb(transactionId);
  }

  if (session.status === "expired") {
    const failed = await prisma.payment.update({
      where: { transactionId },
      data: { status: PaymentStatus.FAILED },
    });
    return failed;
  }

  throw new Error("Payment is not completed yet!");
};

const stripeWebhookDb = async (rawBody: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    config.STRIPE_WEBHOOK_SECRET,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await completePaymentDb(session.id);
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await prisma.payment.update({
      where: { transactionId: session.id },
      data: { status: PaymentStatus.FAILED },
    });
  }

  return { received: true };
};

const getMyPaymentsDb = async (userId: string) => {
  const result = await prisma.payment.findMany({
    where: { userId },
    include: {
      rentalOrder: {
        select: { id: true, status: true, rentalStartDate: true, rentalEndDate: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getPaymentByIdDb = async (id: string, userId: string, role: Role) => {
  const result = await prisma.payment.findUniqueOrThrow({
    where: { id },
    include: {
      rentalOrder: {
        include: {
          orderItems: { include: { item: { select: { name: true } } } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (role === Role.CUSTOMER && result.userId !== userId) {
    throw new Error("This is not your payment!");
  }

  return result;
};

export {
  confirmPaymentDb,
  createPaymentDb,
  getMyPaymentsDb,
  getPaymentByIdDb,
  stripeWebhookDb,
};