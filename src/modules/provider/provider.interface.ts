export interface IGearPayload {
  name: string;
  description: string;
  brand: string;
  images: string[];
  pricePerDay: number;
  stock: number;
  isAvailable?: boolean;
  categoryId: string;
}

export interface IUpdateOrderStatus {
  status: "CONFIRMED" | "PICKED_UP" | "RETURNED";
}