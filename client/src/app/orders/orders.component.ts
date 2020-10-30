import { Component, OnInit } from '@angular/core';
import { IAddress } from '../shared/models/address';
import { IOrder } from '../shared/models/order';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: IOrder[];

  constructor(private ordersService: OrdersService) { }

  ngOnInit(): void {
    this.getUserOrders();
  }

  getUserOrders(): void {
    this.ordersService.getOrdersForUser().subscribe(orders => {
      this.orders = orders;
    });
  }

  getAddressAsString(a: IAddress): string {
    return `${a.street}, ${a.city}, ${a.state}`;
  }

}
