import { MessageService } from 'primeng/api'
import { Injectable } from '@angular/core'

@Injectable()
export class AlertService {
  constructor(private messageService: MessageService) {

  }

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message })
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message })
  }
}