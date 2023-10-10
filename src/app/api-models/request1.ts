export interface Request1 {
  countryCode2: string;
  vat: number;
  numberOfItems: number;
  itemPrice: number;
}

export interface Response1 extends Request1 {
  id: number;
}
