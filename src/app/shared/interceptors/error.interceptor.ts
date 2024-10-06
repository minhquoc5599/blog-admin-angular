import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, switchMap, throwError } from 'rxjs';
import { AuthenticatedResponse } from 'src/app/api/admin-api.service.generated';
import { Url } from 'src/app/shared/constants/url.constant';
import { AlertService } from 'src/app/shared/services/alert.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { LoadingService } from '../services/loading.service';
import { ErrorMessage } from './../constants/error-message.constant';

// const refreshToken = (storageService: StorageService, tokenApiClient: AdminApiTokenApiClient, router: Router) => {
//   const token = storageService.getToken()
//   const refreshToken = storageService.getRefreshToken()
//   const tokenRequest = new TokenRequest({
//     accessToken: token!,
//     refreshToken: refreshToken!,
//   })

//   return tokenApiClient.refresh(tokenRequest).pipe(
//     tap((authenResponse: AuthenticatedResponse) => {
//       storageService.saveToken(authenResponse.token!)
//       storageService.saveRefreshToken(authenResponse.refreshToken!)
//     }),
//     catchError((err) => {
//       logout(storageService, router)
//       return throwError(() => err)
//     })
//   )

// }

// const handleError = async (error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandlerFn,
//   alertService: AlertService, loadingService: LoadingService, storageService: StorageService, router: Router) => {
//   switch (error.status) {
//     case 400: // Bad request
//     case 404: // Not Found
//     case 409: // Conflict
//     case 500: // Internal server error
//       alertService.showError(await (new Response(error.error)).text())
//       // loadingService.httpError.next(false)
//       break

//     case 401: // Unauthorized
//       if (!router.url.includes('auth/login')) {
//         return storageService.refresh().pipe(
//           switchMap((response: AuthenticatedResponse) => {
//             storageService.saveToken(response.token)
//             storageService.saveRefreshToken(response.refreshToken)

//             request = addTokenHeader(request, response.token)
//             return next(request)
//           }),
//           catchError((error) => {
//             // logout(storageService, router)
//             return throwError(() => error)
//           })
//         )
//       } else {
//         alertService.showError(await (new Response(error.error)).text())
//       }
//       break

//     case 403: // Forbidden
//       alertService.showError('Permission has not been granted')

//       break

//     default:
//       alertService.showError('Other error')
//   }
//   //loadingService.httpError.next(false)
//   return throwError(() => error)
// }

const logout = (storageService: StorageService, router: Router) => {
  storageService.logout()
  router.navigate([Url.LOGIN])
}

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`),
  })
}

export const ErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const alertService = inject(AlertService) as AlertService
  const loadingService = inject(LoadingService) as LoadingService
  const storageService = inject(StorageService) as StorageService
  const router = inject(Router) as Router

  const token = storageService.getToken()
  if (token != null) {
    req = addTokenHeader(req, token)
  }
  
  loadingService.showLoader();
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      //return from(handleError(error, req, next, alertService, loadingService, storageService, router))
      if (error) {
        switch (error.status) {
          case 401: // Unauthorized
            if (!router.url.includes('auth/login')) {
              return storageService.refresh().pipe(
                switchMap((response: AuthenticatedResponse) => {
                  storageService.saveToken(response.token)
                  storageService.saveRefreshToken(response.refreshToken)

                  req = addTokenHeader(req, response.token)
                  return next(req)
                }),
                catchError((error) => {
                  if (error.status === '401') {
                    logout(storageService, router)
                  }
                  return throwError(() => error)
                })
              )
            } else {
              alertService.showError(ErrorMessage.LOGIN_FAILED)
            }
            break

          case 400: // Bad request
            alertService.showError(ErrorMessage.ERROR_400_MSG)
            break
          case 404: // Not Found
            alertService.showError(ErrorMessage.ERROR_404_MSG)
            break
          case 409: // Conflict
            alertService.showError(ErrorMessage.ERROR_409_MSG)
            break
          case 500: // Internal server error
            alertService.showError(ErrorMessage.ERROR_500_MSG)
            break
          case 403: // Forbidden
            alertService.showError(ErrorMessage.ERROR_403_MSG)
            break

          default:
            alertService.showError(ErrorMessage.OTHER_ERROR_MSG)
            break
        }
      }
      return throwError(() => error)
    }),
    finalize(() => {
      setTimeout(() => {
        loadingService.hideLoader()
      }, 500);
    })
  )
}
