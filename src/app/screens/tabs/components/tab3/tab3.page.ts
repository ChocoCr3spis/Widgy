import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {  IonAvatar, IonChip, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonDatetime, IonDatetimeButton, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonModal, IonRefresher, IonRefresherContent, IonHeader, IonSearchbar, IonSelect, IonSelectOption, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filter, trash } from 'ionicons/icons';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';
import { Widget } from 'src/app/core/models/widget.interface';
import { SearchUsers } from "src/app/shared/search-users/search-users.page";
import { UserService } from 'src/app/core/services/integrations/user.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [ 
    IonAvatar,
    IonChip,
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
    IonItem,
    IonInfiniteScroll, 
    IonInfiniteScrollContent,
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
    SearchUsers,
  ],
})
export class Tab3Page {
  presentingElement!: HTMLElement | null;

  filterPublicWidgetsForm: FormGroup;
  addedUsers: any[] = [];
  user: any = null;

  widgets?: Widget[] | any;

  lastWidget: any = null;

  @ViewChild('modalFilter')
  modalFilter!: IonModal;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private widgetService: WidgetService
  ) {
    addIcons({ filter, trash });

    this.filterPublicWidgetsForm = this.fb.group({
      text: [''],
      type: [[]],
      dateFrom: [null],
      dateTo: [null],
      owners: [[]],
    });
  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');

    this.user = await this.userService.getCurrentUser();

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

    const res = await this.widgetService.getPublicWidgets({ ...filters});

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

  addUser(event: any, mode: string){
    this.addedUsers.push({
      email: event.email, 
      userId: event.userId, 
      username: event.username, 
      usernameLower: event.usernameLower, 
    });

    const owners = this.filterPublicWidgetsForm.value.owners;
    this.filterPublicWidgetsForm.patchValue({
      owners: [...owners, event.userId]
    });
  }

  deleteUser(user: any){
    this.addedUsers = this.addedUsers.filter(u => u.userId != user.userId);

    const owners = this.filterPublicWidgetsForm.value.owners || [];
    this.filterPublicWidgetsForm.patchValue({
      owners: owners.filter((id: string) => id !== user.userId)
    });
  }


  setDate(control: string, ev: any) {
    const iso = ev.detail.value;
    this.filterPublicWidgetsForm.get(control)?.setValue(iso);
  }

  clearDate(field: 'dateFrom' | 'dateTo') {
    this.filterPublicWidgetsForm.patchValue({ [field]: null });
  }

  vote(widget: any, optionId: string){
    this.widgetService.vote(widget, optionId)
    widget.data.options[widget.data.options.findIndex( (o: { id: string; }) => o.id == optionId)].votes += 1;
    widget.data.options[widget.data.options.findIndex( (o: { id: string; }) => o.id == widget.myVote)].votes -= 1
    widget.myVote = optionId;
  }

  getPercentage(widget: any, option: any): number {
    const totalVotes = widget.data.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((option.votes / totalVotes) * 100);
  }

}
