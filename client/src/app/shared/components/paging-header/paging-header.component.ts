import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paging-header',
  templateUrl: './paging-header.component.html',
  styleUrls: ['./paging-header.component.scss']
})
export class PagingHeaderComponent implements OnInit, OnChanges {
  @Input() pageNumber: number;
  @Input() pageSize: number;
  @Input() totalCount: number;
  @Input() selectedBrandName: string;
  @Input() selectedTypeName: string;
  pageRangeMin: number;
  pageRangeMax: number;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.setPageRange();
  }

  ngOnInit(): void {

  }


  setPageRange(): void {
    this.pageRangeMin = (this.pageNumber - 1) * this.pageSize + 1;
    this.pageRangeMax = this.pageRangeMin + this.pageSize - 1;

    const totalPages = Math.ceil((this.totalCount / this.pageSize));
    const isLastPage = this.pageNumber === totalPages;

    if (isLastPage) {
      let itemsOnLastPage: number;
      if (totalPages === 1) {
        itemsOnLastPage = this.totalCount;
      }
      else {
        itemsOnLastPage = this.totalCount % totalPages;
        if (itemsOnLastPage === 0) {
          itemsOnLastPage = this.pageSize;
        }
      }
      this.pageRangeMax = this.pageRangeMin + itemsOnLastPage - 1;
    }
  }

}
