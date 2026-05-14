import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonDatetime, IonDatetimeButton, IonFab, IonFabButton, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonInput, IonModal, IonRefresher, IonRefresherContent, IonHeader, IonSearchbar, IonSelect, IonSelectOption, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../../explore-container/explore-container.component';
import { addIcons } from 'ionicons';
import { filter } from 'ionicons/icons';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';
import { Widget } from 'src/app/core/models/widget.interface';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [ 
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonIcon,
    IonInfiniteScroll, 
    IonInfiniteScrollContent,
    IonItem,
    IonInput,
    IonLabel,
    IonRefresher,
    IonRefresherContent,
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

  lastWidget: any = null;

  @ViewChild('modalFilter')
  modalFilter!: IonModal;

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
    const res = await this.widgetService.getPublicWidgets({});
    this.widgets = res.data;
    this.lastWidget = res.lastDoc;
  }

  async refresh(event: any){
    const res = await this.widgetService.getPublicWidgets({});

    this.widgets = res.data;
    this.lastWidget = res.lastDoc;

    const infinite = document.querySelector('ion-infinite-scroll');
    if (infinite) infinite.disabled = false;

    event.target.complete();
  }

  async searchWidgets(){
   const res = await this.widgetService.getPublicWidgets({
      dateFrom: this.filterPublicWidgetsForm.value.dateFrom || '',
      dateTo: this.filterPublicWidgetsForm.value.dateTo || '',
      ownerName: this.filterPublicWidgetsForm.value.ownerName || '',
      type: this.filterPublicWidgetsForm.value.type || '',      
    });

    this.widgets = res.data;
    this.lastWidget = res.lastDoc;

    const infinite = document.querySelector('ion-infinite-scroll');
    if (infinite) infinite.disabled = false;

    this.modalFilter.dismiss();
  }

  async loadWidgets(event: any) {
    const res = await this.widgetService.getPublicWidgets({ lastWidget: this.lastWidget });

    this.widgets = [...this.widgets, ...res.data];
    this.lastWidget = res.lastDoc;

    event.target.complete();

    if (res.data.length < 4) {
      event.target.disabled = true;
    }
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
