import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonInputPasswordToggle } from "@ionic/angular/standalone";
import { ValidatorsService } from 'src/app/core/services/utilities/validators.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/services/integrations/auth.service';
import { UserService } from 'src/app/core/services/integrations/user.service';
import { Router } from '@angular/router';

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
    private validatorsService: ValidatorsService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
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
  }

  get registerFormControl(){ return this.registerForm.controls }

  async register() {
    let uid = await this.authService.register(this.registerForm.value.email, this.registerForm.value.password);
    await this.userService.createUserInfo(this.registerFormControl['username'].value, this.registerFormControl['email'].value, uid);
    this.router.navigateByUrl('')
  }
}

