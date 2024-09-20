import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { environment } from 'src/enviroments/environment'

@Injectable({
  providedIn: 'root'
})
export class UploadApiService {
  public responseData: any

  constructor(private httpClient: HttpClient) { }

  uploadImage(type: string, files: File[]) {
    const formData: FormData = new FormData()
    formData.append('file', files[0], files[0].name)
    return this.httpClient.post(environment.API_URL + "/api/admin/media?type=" + type, formData)
  }
}
