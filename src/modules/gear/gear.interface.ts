export interface ISearchTerm {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string;
}

export interface ICreateGear {
  name: string;
  description: string;
  brand: string;
  images: string[];
  pricePerDay: number;
  stock: number;
  isAvailable?: boolean;
  categoryId: string;
}