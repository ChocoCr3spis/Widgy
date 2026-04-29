import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { IonListHeader, IonList, IonItem, IonThumbnail, IonIcon, IonLabel, IonSkeletonText, IonButton, IonContent, IonCard, IonCardContent, IonInput } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/core/services/integrations/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButton, ɵInternalFormsSharedModule, ReactiveFormsModule],
})

export class Login {
  
  loginForm: FormGroup;


  constructor(
    private authService: AuthService,
    private fb: FormBuilder,

  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  get loginFormControl(){ return this.loginForm.controls }

  async login(){
    this.authService.login(this.loginFormControl['usernameOrEmail'].value, this.loginFormControl['password'].value);
  }
}

