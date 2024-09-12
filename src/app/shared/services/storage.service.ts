import { UserModel } from 'src/app/shared/models/user.model';
import { Injectable } from '@angular/core';
import { isUndefined } from 'lodash-es';
const TOKEN = 'token'
const REFRESH_TOKEN = 'refresh-token'
const USER = 'user'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  signOut(): void {
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

      const user = this.getUser()
      if (user?.id) {
        this.saveUser({ ...user, accessToken: token })
      }
    }
  }

  saveRefreshToken(token: string | undefined): void {
    if (!isUndefined(token)) {
      localStorage.removeItem(REFRESH_TOKEN)
      localStorage.setItem(REFRESH_TOKEN, token)
    }
  }

  saveUser(user: any): void {
    localStorage.removeItem(USER)
    localStorage.setItem(USER, JSON.stringify(user))
  }

  getUser(): UserModel | null {
    const base64User = localStorage.getItem(USER)
    if (!base64User) {
      return null
    }
    const base64Url = base64User.split('.')[1]
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
}
