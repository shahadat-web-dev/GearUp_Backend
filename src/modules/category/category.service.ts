import { prisma } from "../../lib/prisma";
import { ICategoryPayload } from "./category.interface";

const makeSlug = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, "-");

const getCategoriesDb = async () => {
  const result = await prisma.category.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  });

  return result;
};

const createCategoryDb = async (payload: ICategoryPayload) => {
  const { name, description } = payload;

  const result = await prisma.category.create({
    data: {
      name,
      slug: makeSlug(name),
      description,
    },
  });

  return result;
};

const updateCategoryDb = async (id: string, payload: ICategoryPayload) => {
  const { name, description } = payload;

  const result = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name, slug: makeSlug(name) }),
      ...(description && { description }),
    },
  });

  return result;
};

const deleteCategoryDb = async (id: string) => {
  const itemCount = await prisma.item.count({ where: { categoryId: id } });
  if (itemCount > 0) {
    throw new Error("Category has gear items, cannot delete!");
  }

  const result = await prisma.category.delete({ where: { id } });

  return result;
};

export { createCategoryDb, deleteCategoryDb, getCategoriesDb, updateCategoryDb };