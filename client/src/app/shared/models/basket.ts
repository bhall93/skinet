import { v4 as uuidv4 } from 'uuid';

export interface IBasket {
  id: string;
  items: IBasketItem[];
  clientSecret?: string;
  paymentIntentId?: string;
  deliveryMethodId?: number;
  shipping: number;
  subtotal: number;
  total: number;
}

export interface IBasketItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  pictureUrl: string;
  brand: string;
  type: string;
}

export class Basket implements IBasket {
  id = uuidv4();
  items: IBasketItem[] = [];
  shipping = 0;
  subtotal = 0;
  total = 0;
}

// export interface IBasketTotals {
//   shipping: number;
//   subtotal: number;
//   total: number;
// }
