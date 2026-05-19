import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon, IonSkeletonText, IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonModal, ActionSheetController, IonHeader, IonToolbar, IonTitle, IonButtons, IonInput, IonCard, IonTextarea, IonCardHeader, IonCardTitle, IonCardContent, IonToggle, IonChip, IonInfiniteScrollContent, IonInfiniteScroll, IonRefresherContent, IonRefresher, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent, IonAvatar, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, eyeOutline, pencilOutline, createOutline, shareSocialOutline } from 'ionicons/icons';
import { UserService } from 'src/app/core/services/integrations/user.service';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { SearchUsers } from "src/app/shared/search-users/search-users.page";
import { GroupService } from 'src/app/core/services/integrations/group.service';
import { Group } from 'src/app/core/models/group.interface';

@Component({
  selector: 'app-user-groups',
  templateUrl: 'user-groups.page.html',
  styleUrls: ['user-groups.page.scss'],
  imports: [
    IonButton,
    IonIcon,
    IonSkeletonText,
    IonContent,
    IonFab,
    IonFabButton,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonInput,
    ReactiveFormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    CommonModule,
    IonChip,
    SearchUsers,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSegmentView,
    IonSegmentContent,
    IonAvatar,
    IonItem
],
  providers: [IonModal]
})
export class UserGroups {
  public loaded = false;
  presentingElement!: HTMLElement | null;

  createGroupForm: FormGroup;
  addedUsers: any[] = [];

  userId: string = "";
  groups?: Group[] | any;

  // selectedWidget: Widget | null = null;

  @ViewChild('modalCreateGroup')
  modalCreateGroup!: IonModal;
  
  // @ViewChild('modalEdit')
  // modalEdit!: IonModal;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private groupService: GroupService
  ) {
    
    addIcons({ add, trash, eyeOutline, createOutline, shareSocialOutline, pencilOutline});

    this.createGroupForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]]
    });
  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    this.userId = (await this.userService.getCurrentUser()).uid;
    this.groupService.getMyGroups().subscribe(g => { this.groups = g });
  }

  async openCreateGroupModal() {
    await this.modalCreateGroup.present();
  }

  // async openEditModal(widget: Widget){
  //   this.selectedWidget = widget;
  //   await this.modalEdit.present();
  // }

  closeModal(modal: any){
    this.createGroupForm.reset();
    this.addedUsers = [];
    modal.dismiss();
  }

  addUser(event: any){
    this.addedUsers.push({email: event.email, userId: event.userId, username: event.username, usernameLower: event.usernameLower, role: 'viewer'})
  }

  async createGroup(modal: any){
    await this.groupService.createGroup({
      ownerId: this.userId,
      name: this.createGroupForm.value.nombre!,
      description: this.createGroupForm.value.descripcion  || '',
      createdAt: Timestamp.now(),
      sharedWith: [],
    });
    this.createGroupForm.reset();
    this.closeModal(modal);
  }

  async deleteWidget(group: Group){
    await this.groupService.deleteGroup(group.groupId!);
  }
}
