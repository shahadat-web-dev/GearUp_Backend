export interface IRentalItem {
  itemId: string;
  quantity?: number;
}

export interface ICreateRental {
  rentalStartDate: string;
  rentalEndDate: string;
  items: IRentalItem[];
}