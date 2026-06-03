import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon, IonSkeletonText, IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonModal, ActionSheetController, IonHeader, IonToolbar, IonTitle, IonButtons, IonInput, IonCard, IonTextarea, IonCardHeader, IonCardTitle, IonCardContent, IonToggle, IonChip, IonInfiniteScrollContent, IonInfiniteScroll, IonRefresherContent, IonRefresher, IonSegment, IonSegmentButton, IonLabel, IonSegmentView, IonSegmentContent, IonAvatar, IonItem, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash, eyeOutline, pencilOutline, createOutline, shareSocialOutline } from 'ionicons/icons';
import { UserService } from 'src/app/core/services/integrations/user.service';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { SearchUsers } from "src/app/shared/search-users/search-users.page";
import { GroupService } from 'src/app/core/services/integrations/group.service';
import { Group } from 'src/app/core/models/group.interface';
import { InvitationService } from 'src/app/core/services/integrations/invitation.service';

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
    IonItem,
    IonSpinner
],
  providers: [IonModal]
})
export class UserGroups {
  public loaded = false;
  public saving = false;

  presentingElement!: HTMLElement | null;

  createGroupForm: FormGroup;
  addedUsers: any[] = [];

  user: any = null;
  groups?: Group[] | any;
  sharedGroups?: any[] | null = null;

  selectedGroup: Group | null = null;
  selectedGroupUsers: any[] = [];
  originalUsers: any[] = [];
  usersForDeletion: any[] = [];

  @ViewChild('modalCreateGroup')
  modalCreateGroup!: IonModal;
  
  @ViewChild('modalEditGroup')
  modalEdit!: IonModal;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private groupService: GroupService,
    private invitationService: InvitationService
  ) {
    
    addIcons({ add, trash, eyeOutline, createOutline, shareSocialOutline, pencilOutline});

    this.createGroupForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]]
    });
  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    this.user = await this.userService.getCurrentUser();
    this.groupService.getMyGroups().subscribe(g => this.groups = g);
    this.groupService.getSharedGroups().subscribe(w => this.sharedGroups = w);
  }

  async openCreateGroupModal() {
    await this.modalCreateGroup.present();
  }

  async openEditModal(group: Group){
    this.selectedGroup = group;
    this.createGroupForm.patchValue({
      nombre: this.selectedGroup.name,
      descripcion: this.selectedGroup.description
    })
    this.selectedGroupUsers = await this.groupService.getMyGroupsUsers(group.groupId!);
    this.originalUsers = structuredClone(this.selectedGroupUsers);
    await this.modalEdit.present();
  }

  closeModal(modal: any){
    this.createGroupForm.reset();
    this.addedUsers = [];
    modal.dismiss();
  }

  addUser(event: any, mode: string){
    this.addedUsers.push({
      email: event.email, 
      userId: event.userId, 
      username: event.username, 
      usernameLower: event.usernameLower, 
      role: 'viewer'
    });

    if(mode == 'edit'){
      this.selectedGroupUsers.push({
        email: event.email, 
        userId: event.userId, 
        username: event.username, 
        usernameLower: event.usernameLower, 
        role: 'viewer'
      });
    }
  }

  deleteUser(user: any){
    this.addedUsers = this.addedUsers.filter(u => u.userId != user.userId);
    this.selectedGroupUsers = this.addedUsers.filter(u => u.userId != user.userId);
    this.usersForDeletion.push(user);
  }

  changeRole(role: string, userId: string){
    this.selectedGroupUsers.find(u => u.userId == userId).role = role;
  }

  async createGroup(modal: any){
    this.saving = true;
    try{
      let invitations: any[] = [];
      this.addedUsers.forEach(async (user) => {
        invitations.push({
          email: user.email,
          username: user.username,
          createdAt: Timestamp.now(),
          role: user.role,
          ownerUsername: this.user.username,
          invitationType: 'group',
          groupId: '',
          userId: user.userId
        });
      });

      await this.groupService.createGroup({
        ownerId: this.user.uid,
        name: this.createGroupForm.value.nombre!,
        description: this.createGroupForm.value.descripcion  || '',
        createdAt: Timestamp.now()
      }, this.addedUsers, invitations);
    }catch(error){
      console.log(error)
    }
    
    this.createGroupForm.reset();
    this.closeModal(modal);
    this.saving = false;

  }

  async modifyGroup(modal: any){
    this.saving = true;
    const removedUsers = this.originalUsers.filter(o => !this.selectedGroupUsers.some(u => u.userId === o.userId));
    const addedUsers = this.selectedGroupUsers.filter(u => !this.originalUsers.some(o => o.userId === u.userId));
    const updatedUsers = this.selectedGroupUsers.filter(current => {
      const original = this.originalUsers.find(o => o.userId === current.userId);
      if (!original) return false;
      return (original.role !== current.role);
    });
    let groupInfo = null;
    if(!this.createGroupForm.pristine) groupInfo = {
      name: this.createGroupForm.value.nombre!,
      description: this.createGroupForm.value.descripcion  || '',
    }
    
    try{
      await this.groupService.modifyGroup(
        this.selectedGroup?.groupId!,
        groupInfo,
        addedUsers,
        removedUsers,
        updatedUsers
      );
    }catch(error){
      console.log(error)
    }
    

    this.saving = false;
    this.closeModal(modal);
  }

  async deleteGroup(group: Group){
    try{
      await this.groupService.deleteGroup(group.groupId!);
    }catch(err){}
  }

  async leave(group: any){
    await this.invitationService.deleteInvitation(group.groupId, (await (this.userService.getCurrentUser())).uid, 'group');
  }
}
