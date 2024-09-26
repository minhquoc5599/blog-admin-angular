import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable()
export class LoadingService {
  public httpError: BehaviorSubject<boolean>

  constructor() {
    this.httpError = new BehaviorSubject<boolean>(false)
  }
}