import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private count = 0;

  readonly isLoading: WritableSignal<boolean> = signal(false);

  show() {
    this.count++;
    this.isLoading.set(true);
  }

  hide() {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      this.isLoading.set(false);
    }
  }
}