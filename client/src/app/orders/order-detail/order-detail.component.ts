import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IOrder } from 'src/app/shared/models/order';
import { BreadcrumbService } from 'xng-breadcrumb';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: IOrder;

  constructor(
    private ordersService: OrdersService,
    private activatedRoute: ActivatedRoute,
    private bcService: BreadcrumbService) { }

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder(): void {
    const idParam = +this.activatedRoute.snapshot.paramMap.get('id');
    this.ordersService.getOrder(idParam).subscribe(order => {
      this.order = order;
      this.bcService.set('@orderDetails', `Order #${this.order.id} - ${this.order.status}`);
    }, error => console.log(error));
  }

}
