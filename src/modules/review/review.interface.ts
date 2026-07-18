export interface ICreateReview {
  itemId: string;
  rentalOrderId: string;
  rating: number;
  comment?: string;
}