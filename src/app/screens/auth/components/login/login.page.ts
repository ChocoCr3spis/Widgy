import { Component } from '@angular/core';
import { IonListHeader, IonList, IonItem, IonThumbnail, IonIcon, IonLabel, IonSkeletonText, IonButton, IonContent, IonCard, IonCardContent, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { musicalNotes } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButton],
})
  export class Login {

  }

