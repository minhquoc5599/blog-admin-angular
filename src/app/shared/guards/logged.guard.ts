import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Url } from 'src/app/shared/constants/url.constant';
import { StorageService } from 'src/app/shared/services/storage.service';
@Injectable()
export class LoggedGuard {

  constructor(private router: Router, private storage: StorageService) {

  }

  canActivate(): boolean {
    let loggedInUser = this.storage.getUser();
    if (loggedInUser) {
      this.router.navigate([Url.DASHBOARD])
      return false
    } else {
      return true
    }
  }
}
