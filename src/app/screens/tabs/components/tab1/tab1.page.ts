import { Component } from '@angular/core';
import { IonListHeader, IonList, IonItem, IonThumbnail, IonIcon, IonLabel, IonSkeletonText, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { musicalNotes } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonSkeletonText,
    IonThumbnail
  ],
})
  export class Tab1Page {
    public loaded = false;

    constructor() {    addIcons({ musicalNotes });
  }
}
