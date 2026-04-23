import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonInputPasswordToggle } from "@ionic/angular/standalone";
import { ValidatorsService } from 'src/app/core/services/utilities/validators.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  styleUrls: ['register.page.scss'],
  imports: [IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonInput, FormsModule, IonButton, ReactiveFormsModule, IonInputPasswordToggle],
})

export class Register {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validatorsService: ValidatorsService
  ){
    this.registerForm = this.fb.group({
      username: [null, [Validators.required, Validators.maxLength(20)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.pattern('')]],
      repeatPassword: [null, [Validators.required, Validators.pattern('')]]
    },
    {
      validators: [this.validatorsService.match('password','repeatPassword')]
    });
    console.log('holaaa')
  }

  register() {
    console.log('pito')
  }
}

