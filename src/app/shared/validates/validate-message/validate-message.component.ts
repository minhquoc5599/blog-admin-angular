import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-validate-message',
  templateUrl: './validate-message.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ValidateMessageComponent implements OnInit {
  @Input() entityForm: FormGroup;
  @Input() fieldName: string;
  @Input() validationMessages: any;
  constructor() { }

  ngOnInit(): void {

  }

}