import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Basket, IBasket, IBasketItem } from '../shared/models/basket';
import { IDeliveryMethod } from '../shared/models/deliveryMethod';
import { IProduct } from '../shared/models/product';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  baseUrl = environment.apiUrl;
  private basketSource = new BehaviorSubject<IBasket>(null);
  basket$ = this.basketSource.asObservable();
  // private basketTotalSource = new BehaviorSubject<IBasketTotals>(null);
  // basketTotal$ = this.basketTotalSource.asObservable();

  constructor(private http: HttpClient) { }

  createPaymentIntent(): Observable<void> {
    return this.http.post<IBasket>(this.baseUrl + 'payments/' + this.getCurrentBasketValue().id, {})
      .pipe(
        map(basket => {
          // update the basket in the service with payment properties
          this.basketSource.next(basket);
          this.updateTotals();
        })
      );
  }

  setShippingPrice(deliveryMethod: IDeliveryMethod): void {
    const basket = this.getCurrentBasketValue();
    basket.deliveryMethodId = deliveryMethod.id;
    basket.shipping = deliveryMethod.price;
    console.log('setShippingPrice()...');
    console.log(basket);
    this.setBasket(basket);
  }

  getBasket(id: string): Observable<void> {
    return this.http.get<IBasket>(this.baseUrl + 'basket?id=' + id)
      .pipe(
        map( basket => {
          this.basketSource.next(basket);
          this.updateTotals();
        })
      );
  }

  setBasket(basket: IBasket): Subscription {
    return this.http.post<IBasket>(this.baseUrl + 'basket', basket).subscribe(response => {
      this.basketSource.next(response);
      this.updateTotals();
      console.log('setBasket()....');
      console.log(response);
    }, error => {
      console.log(error);
    });
  }

  getCurrentBasketValue(): IBasket {
    return this.basketSource.value;
  }

  addItemToBasket(item: IProduct, quantity = 1): void {
    const itemToAdd: IBasketItem = this.mapProductItemToBasketItem(item, quantity);
    const basket = this.getCurrentBasketValue() ?? this.createBasket();
    basket.items = this.addOrUpdateItem(basket.items, itemToAdd, quantity);
    this.setBasket(basket);
  }

  updateTotals(): void {
    this.basketSource.value.subtotal = this.getSubTotal();
    this.basketSource.value.total = this.getTotal();
  }

  incrementItemQuantity(item: IBasketItem): void {
    const basket = this.getCurrentBasketValue();
    const itemIndex = basket.items.findIndex(basketItem => basketItem.id === item.id);
    basket.items[itemIndex].quantity++;
    this.setBasket(basket);
  }

  decrementItemQuantity(item: IBasketItem): void {
    const basket = this.getCurrentBasketValue();
    const itemIndex = basket.items.findIndex(basketItem => basketItem.id === item.id);
    if (basket.items[itemIndex].quantity > 1) {
      basket.items[itemIndex].quantity--;
      this.setBasket(basket);
    } else {
      this.removeItemFromBasket(item);
    }
    this.setBasket(basket);
  }

  removeItemFromBasket(item: IBasketItem): void {
    const basket = this.getCurrentBasketValue();
    if (basket.items.some(x => x.id === item.id)) {
      basket.items = basket.items.filter(i => i.id !== item.id);
      if (basket.items.length > 0) {
        this.setBasket(basket);
      } else {
        this.deleteBasket(basket);
      }
    }
  }

  deleteBasket(basket: IBasket): Subscription {
    return this.http.delete(this.baseUrl + 'basket?id=' + basket.id).subscribe(() => {
      this.basketSource.next(null);
      localStorage.removeItem('basket_id');
    }, error => {
      console.log(error);
    });
  }

  deleteBasketLocally(id: string): void {
    this.basketSource.next(null);
    localStorage.removeItem('basket_id');
  }

  private addOrUpdateItem(items: IBasketItem[], itemToAdd: IBasketItem, quantity: number): IBasketItem[] {
    const index = items.findIndex(i => i.id === itemToAdd.id);

    if (index === -1) {
      itemToAdd.quantity = quantity;
      items.push(itemToAdd);
    } else {
      items[index].quantity += quantity;
    }
    return items;
  }

  private createBasket(): IBasket {
    const basket = new Basket();
    localStorage.setItem('basket_id', basket.id);
    return basket;
  }

  private mapProductItemToBasketItem(item: IProduct, quantity: number): IBasketItem {
    return {
      id: item.id,
      productName: item.name,
      price: item.price,
      pictureUrl: item.pictureUrl,
      quantity,
      brand: item.productBrand,
      type: item.productType
    };
  }

  private getSubTotal(): number {
    return this.basketSource.value.items.map(item => item.price * item.quantity).reduce((prev, cur) => {
      return prev + cur;
    });
  }

  private getTotal(): number {
    return this.getSubTotal() + this.getCurrentBasketValue().shipping;
  }
}
