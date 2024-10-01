import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isUndefined } from 'lodash-es';
import { Observable } from 'rxjs';
import { TokenRequest } from 'src/app/api/admin-api.service.generated';
import { UserModel } from 'src/app/shared/models/user.model';
import { environment } from 'src/enviroments/environment';
const TOKEN = 'token'
const REFRESH_TOKEN = 'refresh-token'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private http: HttpClient) { }

  logout(): void {
    localStorage.clear()
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN)
  }

  saveToken(token: string | undefined): void {
    if (!isUndefined(token)) {
      localStorage.removeItem(TOKEN)
      localStorage.setItem(TOKEN, token)
    }
  }

  saveRefreshToken(token: string | undefined): void {
    if (!isUndefined(token)) {
      localStorage.removeItem(REFRESH_TOKEN)
      localStorage.setItem(REFRESH_TOKEN, token)
    }
  }

  getUser(): UserModel | null {
    const token = localStorage.getItem(TOKEN)
    if (!token) {
      return null
    }
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace('-', '+').replace('_', '/')
    const user: UserModel = JSON.parse(this.base64Decode(base64))
    return user
  }

  base64Decode(str: string) {
    return decodeURIComponent(Array.prototype.map.call(
      atob(str),
      (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
  }

  // Call api
  refresh(): Observable<any> {
    const refreshToken = this.getRefreshToken()
    const tokenRequest = new TokenRequest({
      refreshToken: refreshToken!,
    })

    return this.http.post(environment.API_URL + "/api/admin/token/refresh", tokenRequest)
      // .pipe(
      //   tap((response: AuthenticatedResponse) => {
      //     this.saveToken(response.token)
      //     this.saveRefreshToken(response.refreshToken)
      //   }),
      // )
  }
}
