import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  busyRequestCount = 0;

  constructor(private spinnerServie: NgxSpinnerService) { }

  busy(): void {
    this.spinnerServie.show(undefined, {
      type: 'pacman',
      bdColor: 'rgba(255, 255, 255, 0.5)',
      color: '#333333'
    });
  }

  idle(): void {
    this.busyRequestCount--;
    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.spinnerServie.hide();
    }
  }
}
