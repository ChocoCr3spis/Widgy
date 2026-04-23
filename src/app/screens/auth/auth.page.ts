import { Component, } from '@angular/core';
import { IonTabs } from "@ionic/angular/standalone";


@Component({
  selector: 'app-auth',
  templateUrl: 'auth.page.html',
  styleUrls: ['auth.page.scss'],
  imports: [IonTabs],
})
export class Auth {
  constructor(){
    console.log('asdasasd')
  }
}
