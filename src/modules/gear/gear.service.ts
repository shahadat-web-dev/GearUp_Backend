import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateGear, ISearchTerm } from "./gear.interface";


const createGearDb = async (
  payload: ICreateGear,
  providerId: string,
) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found!");
  }

  const result = await prisma.item.create({
    data: {
      name: payload.name,
      description: payload.description,
      brand: payload.brand,
      images: payload.images,
      pricePerDay: payload.pricePerDay,
      stock: payload.stock,
      isAvailable: payload.isAvailable ?? true,
      providerId,
      categoryId: payload.categoryId,
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return result;
};

const updateGearDb = async (
  id: string,
  payload: Partial<ICreateGear>,
  providerId: string,
) => {
  const item = await prisma.item.findUniqueOrThrow({
    where: { id },
  });

  if (item.providerId !== providerId) {
    throw new Error("You are not authorized to update this gear");
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  const result = await prisma.item.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.description && { description: payload.description }),
      ...(payload.brand && { brand: payload.brand }),
      ...(payload.images && { images: payload.images }),
      ...(payload.pricePerDay !== undefined && {
        pricePerDay: payload.pricePerDay,
      }),
      ...(payload.stock !== undefined && { stock: payload.stock }),
      ...(payload.isAvailable !== undefined && {
        isAvailable: payload.isAvailable,
      }),
      ...(payload.categoryId && { categoryId: payload.categoryId }),
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return result;
};

const deleteGearDb = async (id: string, providerId: string) => {
  const item = await prisma.item.findUniqueOrThrow({
    where: { id },
  });

  if (item.providerId !== providerId) {
    throw new Error("You are not authorized to delete this gear");
  }

  const result = await prisma.item.delete({
    where: { id },
  });

  return result;
};


const getGearDb = async (query: ISearchTerm) => {
  const { search, category, brand, minPrice, maxPrice, availability } = query;

  const where: Prisma.ItemWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category && {
      category: {
        OR: [
          { slug: { equals: category, mode: "insensitive" } },
          { name: { equals: category, mode: "insensitive" } },
        ],
      },
    }),
    ...(brand && { brand: { equals: brand, mode: "insensitive" } }),
    ...((minPrice || maxPrice) && {
      pricePerDay: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    }),
    ...(availability && { isAvailable: availability === "true" }),
  };

  const result = await prisma.item.findMany({
    where,
    include: {
      category: { select: { name: true, slug: true } },
      provider: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getGearByIdDb = async (id: string) => {
  const result = await prisma.item.findUniqueOrThrow({
    where: { id },
    include: {
      category: { select: { name: true, slug: true } },
      provider: { select: { id: true, name: true, email: true } },
      reviews: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          customer: { select: { name: true } },
        },
      },
    },
  });

  return result;
};

export { getGearByIdDb, getGearDb ,createGearDb,updateGearDb,deleteGearDb };