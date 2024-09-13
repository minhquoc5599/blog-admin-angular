import { AuthenticatedResult, TokenRequest } from 'src/app/api/admin-api.service.generated';
import { AdminApiTokenApiClient } from 'src/app/api/admin-api.service.generated';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
const TOKEN_HEADER_KEY = 'Authorization'

// Using with Module
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null)

  constructor(
    private storageService: StorageService,
    private tokenApiClient: AdminApiTokenApiClient) {
  }
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<Object>> {
    let authReq = req;
    const token = this.storageService.getToken();
    if (token != null) {
      authReq = this.addTokenHeader(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !authReq.url.includes('auth/login') &&
          error.status === 401
        ) {
          return this.handle401Error(authReq, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const token = this.storageService.getToken();
      const refreshToken = this.storageService.getRefreshToken();
      var tokenRequest = new TokenRequest({
        accessToken: token!,
        refreshToken: refreshToken!,
      });
      if (token)
        return this.tokenApiClient.refresh(tokenRequest).pipe(
          switchMap((authenResponse: AuthenticatedResult) => {
            this.isRefreshing = false;

            this.storageService.saveToken(authenResponse.token!);
            this.storageService.saveRefreshToken(authenResponse.refreshToken!);
            this.refreshTokenSubject.next(authenResponse.token);

            return next.handle(
              this.addTokenHeader(request, authenResponse.token!)
            );
          }),
          catchError((err) => {
            this.isRefreshing = false;

            this.storageService.signOut();
            return throwError(() => err);
          })
        );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`),
    });
  }
}