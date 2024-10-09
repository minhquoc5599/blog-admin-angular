import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  isLoading$ = this.isLoadingSubject.asObservable()

  showLoader() {
    this.isLoadingSubject.next(true)
  }

  hideLoader() {
    this.isLoadingSubject.next(false)
  }
}