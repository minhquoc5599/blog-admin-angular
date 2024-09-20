import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from 'src/app/shared/services/alert.service';

export const ErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const alertService = inject(AlertService) as AlertService
  return next(req).pipe(
    catchError(async ex => {
      if (ex.status == 500) {
        alertService.showError('A system error has occurred. Please contact admin');
      }
      const error = await (new Response(ex.error)).text();
      alertService.showError(error);
      throw ex;
    })
  );
}
