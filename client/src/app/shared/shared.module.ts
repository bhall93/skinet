import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { PagingHeaderComponent } from './components/paging-header/paging-header.component';
import { PagerComponent } from './components/pager/pager.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';



@NgModule({
  declarations: [PagingHeaderComponent, PagerComponent, OrderSummaryComponent],
  imports: [
    CommonModule,
    PaginationModule.forRoot(),
    CarouselModule.forRoot()
  ],
  exports: [
      PaginationModule,
      PagingHeaderComponent,
      PagerComponent,
      CarouselModule,
      OrderSummaryComponent
  ]
})
export class SharedModule { }
