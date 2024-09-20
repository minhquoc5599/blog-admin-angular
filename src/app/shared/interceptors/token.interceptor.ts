import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AdminApiTokenApiClient, AuthenticatedResponse, TokenRequest } from 'src/app/api/admin-api.service.generated';
import { StorageService } from 'src/app/shared/services/storage.service';

// Using with standalone
// Variable
const TOKEN_HEADER_KEY = 'Authorization'
let isRefreshing = false
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null)


const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn,
  storageService: StorageService, tokenApiClient: AdminApiTokenApiClient) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const token = storageService.getToken();
    const refreshToken = storageService.getRefreshToken();
    var tokenRequest = new TokenRequest({
      accessToken: token!,
      refreshToken: refreshToken!,
    });
    if (token)
      return tokenApiClient.refresh(tokenRequest).pipe(
        switchMap((authenResponse: AuthenticatedResponse) => {
          isRefreshing = false;

          storageService.saveToken(authenResponse.token!);
          storageService.saveRefreshToken(authenResponse.refreshToken!);
          refreshTokenSubject.next(authenResponse.token);

          return next(
            addTokenHeader(request, authenResponse.token!)
          );
        }),
        catchError((err) => {
          isRefreshing = false;

          storageService.signOut();
          return throwError(() => err);
        })
      );
  }

  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(request, token)))
  );
}

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    headers: request.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`),
  });
}

export const TokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  let storageService = inject(StorageService) as StorageService
  let tokenApiClient: AdminApiTokenApiClient
  let authReq = req;
  const token = storageService.getToken();
  if (token != null) {
    authReq = addTokenHeader(req, token);
  }
  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        !authReq.url.includes('auth/login') &&
        error.status === 401
      ) {
        return handle401Error(authReq, next, storageService, tokenApiClient);
      }
      return throwError(() => error);
    })
  );
}
