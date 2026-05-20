import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {  IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonDatetime, IonDatetimeButton, IonFab, IonFabButton, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonInput, IonModal, IonRefresher, IonRefresherContent, IonHeader, IonSearchbar, IonSelect, IonSelectOption, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filter, trash } from 'ionicons/icons';
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
    addIcons({ filter, trash });

    this.filterPublicWidgetsForm = this.fb.group({
      type: [[]],
      dateFrom: [null],
      dateTo: [null],
      ownerName: [''],
    });

  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');

    //Carga de datos inicial
    const res = await this.widgetService.getPublicWidgets({});
    this.widgets = res.data;
    this.lastWidget = res.lastDoc;
  }

  //Carga de datos cuando tiras hacia arriba
  async refresh(event: any){
    const filters = this.filterPublicWidgetsForm.value;
    const res = await this.widgetService.getPublicWidgets({ ...filters });

    this.widgets = res.data;
    this.lastWidget = res.lastDoc;

    const infinite = document.querySelector('ion-infinite-scroll');
    if (infinite) infinite.disabled = false;

    event.target.complete();
  }

  //Carga de datos cuando filtras
  async searchWidgets(){
    const filters = this.filterPublicWidgetsForm.value;

    const infinite = document.querySelector('ion-infinite-scroll');
    if (infinite) infinite.disabled = true;

    this.lastWidget = null;

    const res = await this.widgetService.getPublicWidgets({ ...filters });

    this.widgets = res.data;
    this.lastWidget = res.lastDoc;

    if (infinite) infinite.disabled = false;

    this.modalFilter.dismiss();
  }

  //Carga de datos cuando haces scroll
  async loadWidgets(event: any) {
    const filters = this.filterPublicWidgetsForm.value;
    const res = await this.widgetService.getPublicWidgets({ ...filters, lastWidget: this.lastWidget });

    this.widgets = [...this.widgets, ...res.data];
    this.lastWidget = res.lastDoc;

    event.target.complete();

    if (res.data.length < 4) {
      event.target.disabled = true;
    }
  }

  setDate(control: string, ev: any) {
    const iso = ev.detail.value;
    this.filterPublicWidgetsForm.get(control)?.setValue(iso);
  }

  clearDate(field: 'dateFrom' | 'dateTo') {
    this.filterPublicWidgetsForm.patchValue({ [field]: null });
  }

}
