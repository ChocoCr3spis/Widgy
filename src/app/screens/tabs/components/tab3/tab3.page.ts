import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonDatetime, IonDatetimeButton, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonInput, IonModal, IonHeader, IonSearchbar, IonSelect, IonSelectOption, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { filter } from 'ionicons/icons';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';
import { Widget } from 'src/app/core/models/widget.interface';
import { Timestamp } from '@firebase/firestore';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [ 
    ExploreContainerComponent,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItem,
    IonInput,
    IonLabel,
    IonList,
    IonModal,
    IonHeader, 
    IonSearchbar, 
    IonSelect,
    IonSelectOption,
    IonToolbar, 
    IonTitle, 
    ReactiveFormsModule,
  ],
})
export class Tab3Page {
  presentingElement!: HTMLElement | null;

  filterPublicWidgetsForm: FormGroup;

   widgets?: Widget[] | any;

  constructor(
    private fb: FormBuilder,
    private widgetService: WidgetService
  ) {
    addIcons({ filter });

    this.filterPublicWidgetsForm = this.fb.group({
      type: [''],
      dateFrom: [''],
      dateTo: [''],
      ownerName: [''],
    });

  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    //this.userId = (await this.userService.getCurrentUser()).uid;
    this.widgetService.getPublicWidgets({}).subscribe( w => { this.widgets = w });
  }

  async createWidget(){
    await this.widgetService.getPublicWidgets({
      type: this.filterPublicWidgetsForm.value.type || '',      
      dateFrom: this.filterPublicWidgetsForm.value.dateFrom || '',
      dateTo: this.filterPublicWidgetsForm.value.dateTo || '',
      ownerName: this.filterPublicWidgetsForm.value.ownerName || '',
      test: this.filterPublicWidgetsForm.value.text || '',
    });
  }

  setDate(control: string, ev: any) {
    const iso = ev.detail.value;
    this.filterPublicWidgetsForm.get(control)?.setValue(this.formatDate(iso));
  }

  formatDate(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}/${
      (d.getMonth() + 1).toString().padStart(2, '0')
    }/${d.getFullYear()}`;
  }

}
