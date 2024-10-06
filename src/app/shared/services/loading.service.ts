import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false)
  isLoading$ = this.isLoadingSubject.asObservable()

  showLoader() {
    console.log('show loading')
    this.isLoadingSubject.next(true)
  }

  hideLoader() {
    console.log('hide loading')
    this.isLoadingSubject.next(false)
  }
}