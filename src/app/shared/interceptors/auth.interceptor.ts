import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, Subject, switchMap, tap, throwError } from 'rxjs';
import { AdminApiTokenApiClient, AuthenticatedResponse, TokenRequest } from 'src/app/api/admin-api.service.generated';
import { Url } from 'src/app/shared/constants/url.constant';
import { AlertService } from 'src/app/shared/services/alert.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoadingService } from '../services/loading.service';

// Using with standalone
// Variable
const TOKEN_HEADER_KEY = 'Authorization'
let isRefreshing = false
const tokenRefreshedSource = new Subject();
const tokenRefreshed$ = tokenRefreshedSource.asObservable();

const refreshToken = (storageService: StorageService, router: Router) => {
  let tokenApiClient: AdminApiTokenApiClient
  const token = storageService.getToken();
  const refreshToken = storageService.getRefreshToken();
  var tokenRequest = new TokenRequest({
    accessToken: token!,
    refreshToken: refreshToken!,
  });

  return tokenApiClient.refresh(tokenRequest).pipe(
    tap((authenResponse: AuthenticatedResponse) => {

      storageService.saveToken(authenResponse.token!);
      storageService.saveRefreshToken(authenResponse.refreshToken!);
    }),
    catchError((err) => {

      logout(storageService, router);
      return throwError(() => err);
    })
  );

}

const logout = (storageService: StorageService, router: Router) => {
  storageService.logout();
  router.navigate([Url.LOGIN]);
}

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    headers: request.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`),
  });
}

const handleError = async (error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandlerFn,
  alertService: AlertService, loadingService: LoadingService, storageService: StorageService, router: Router) => {

  switch (error.status) {
    case 400: // Bad request
      alertService.showError(await (new Response(error.error)).text())
      break;

    case 401: // Unauthorized
      if (!router.url.includes('auth/login')) {
        return refreshToken(storageService, router).pipe(
          switchMap(() => {
            request = addTokenHeader(request, '')
            return next(request)
          }),
          catchError((e) => {
            if (error.status !== 401) {
              return handleError(e, request, next, alertService, loadingService, storageService, router)
            } else {
              logout(storageService, router);
            }

          })
        )
      } else {
        loadingService.httpError.next(false)
      }
      break

    case 403: // Forbidden
      alertService.showError(await (new Response(error.error)).text())
      break

    case 404: // Not found
      alertService.showError(await (new Response(error.error)).text())
      break

    case 500:
      alertService.showError('System error')
      break

    default:
      return throwError(() => error)
  }

  return throwError(() => error)
}

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const alertService = inject(AlertService) as AlertService
  const loadingService = inject(LoadingService) as LoadingService
  const storageService = inject(StorageService) as StorageService
  const router = inject(Router) as Router

  const token = storageService.getToken();
  if (token != null) {
    req = addTokenHeader(req, token);
  }
  return next(req).pipe(catchError((error: HttpErrorResponse) => {
    // if (
    //   error instanceof HttpErrorResponse &&
    //   !req.url.includes('auth/login') &&
    //   error.status === 401
    // ) {
    //   return handle401Error(req, next, storageService, tokenApiClient);
    // }
    // return throwError(() => error);
    return handleError(error, req, next, alertService, loadingService, storageService, router)
  })
  );
}
