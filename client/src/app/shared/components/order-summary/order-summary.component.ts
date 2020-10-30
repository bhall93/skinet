import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent implements OnInit {

  @Input() shippingPrice: number;
  @Input() subtotal: number;
  @Input() total: number;

  constructor() { }

  ngOnInit(): void {

  }



}
