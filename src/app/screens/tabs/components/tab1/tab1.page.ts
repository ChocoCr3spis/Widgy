import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon, IonSkeletonText, IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonInput, IonCard, IonTextarea, IonCardHeader, IonCardTitle, IonCardContent, IonToggle, IonChip, IonSpinner, IonSegment, IonSegmentButton, IonLabel, IonItem, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { fileTray, image, text, add, trash, appsOutline, eyeOutline, eyeOffOutline, createOutline, shareSocialOutline, pencilOutline, paperPlaneOutline, checkmarkOutline } from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UserService } from 'src/app/core/services/integrations/user.service';
import { Timestamp } from '@angular/fire/firestore';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';
import { Widget } from 'src/app/core/models/widget.interface';
import { CommonModule } from '@angular/common';
import { SearchUsers } from "src/app/shared/search-users/search-users.page";
import { FormsModule } from '@angular/forms';
import { InvitationService } from 'src/app/core/services/integrations/invitation.service';
import { GroupService } from 'src/app/core/services/integrations/group.service';
import { Group } from 'src/app/core/models/group.interface';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonButton,
    IonIcon,
    IonSkeletonText,
    IonContent,
    IonFab,
    IonFabButton,
    IonFabList,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonInput,
    ReactiveFormsModule,
    IonTextarea,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonToggle,
    CommonModule,
    IonChip,
    SearchUsers,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    FormsModule,
    IonItem,
    IonAvatar
],
  providers: [IonModal]
})
export class Tab1Page {
  public loaded = false;
  public saving = false;

  presentingElement!: HTMLElement | null;

  textWidgetForm: FormGroup;
  voteWidgetForm: FormGroup;
  imgWidgetForm: FormGroup;
  shareForm: FormGroup;

  imageFile: File | null = null;
  imagePreview: string | null = null;

  user: any;
  widgets?: Widget[] | any;
  groups?: Group[] | any = [];
  lastWidget: any = null;

  selectedWidget: any | null = null;
  selectedWidgetSharedWith: any[] | null = null;
  @ViewChild('modalShare')
  modalShare!: IonModal;
  
  @ViewChild('modalEdit')
  modalEdit!: IonModal;

  selectedTab: string = 'users'

  constructor(
    private fb: FormBuilder,
    private platform: Platform,
    private userService: UserService,
    private widgetService: WidgetService,
    private invitationService: InvitationService,
    private groupService: GroupService
  ) {
    
    addIcons({ fileTray, image, text, add, trash, appsOutline, eyeOutline, eyeOffOutline, createOutline, shareSocialOutline, pencilOutline, paperPlaneOutline, checkmarkOutline });

    this.textWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      text: [null, [Validators.required, Validators.maxLength(250)]],
      public: [false]
    });

    this.voteWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      pregunta: [null, [Validators.required]],
      public: [false],
      opciones: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ])
    });

    this.imgWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      public: [false]
    });

    this.shareForm = this.fb.group({
      nombreUsuario: [null, [Validators.required, Validators.maxLength(20)]],
    });
  }

  get opciones(): FormArray {
    return this.voteWidgetForm.get('opciones') as FormArray;
  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    this.user = (await this.userService.getCurrentUser());
    this.widgetService.getMyWidgets().subscribe(w => { this.widgets = w });
    this.groupService.getMyGroups().subscribe(g => {
      g.forEach(g => {
        this.groups.push({ groupData: g, sended: false })
      });
      console.log(this.groups)
    });
  }

  async openShareModal(widget: Widget) {
    this.selectedWidget = widget;
    this.selectedWidgetSharedWith = await this.widgetService.getWidgetSharedWith(widget.widgetId!);
    await this.modalShare.present();
  }

  async openEditModal(widget: Widget) {
    this.selectedWidget = widget;
    switch(widget.type){
      case 'vote':
        this.voteWidgetForm.reset();
        this.opciones.clear();
        widget.data.options.forEach((option: any) => {
          this.opciones.push(
            this.fb.control(option.text, Validators.required)
          );
        });
        this.voteWidgetForm.patchValue({
          nombre: widget.name,
          descripcion: widget.description,
          pregunta: widget.data.question,
          public: widget.visibility === 'public'
        });
        break;
      case 'img':
      case 'image':
        this.imgWidgetForm.reset();
        this.imgWidgetForm.patchValue({
          nombre: widget.name,
          descripcion: widget.description,
          public: widget.visibility === 'public'
        });
        this.imageFile = null;
        this.imagePreview = null;
        this.imagePreview = widget.data.imageUrl || null;
        break;
      case 'text':
        this.textWidgetForm.patchValue({
          nombre: widget.name,
          descripcion: widget.description,
          text: widget.data.text,
          public: widget.visibility === 'public'
        });
        break;
    }
    await this.modalEdit.present();
  }

  closeModal(widgetType: string, modal: any){
    switch(widgetType){
      case 'vote':
        this.voteWidgetForm.reset();
        while(this.opciones.length !== 2){
          this.opciones.removeAt(0);
        }
        break;
      case 'img':
      case 'image':
        this.imgWidgetForm.reset();
        this.imageFile = null;
        this.imagePreview = null;
        break;
      case 'text':
        this.textWidgetForm.reset();
        break;
      case 'share':
        this.shareForm.reset();
    }
    modal.dismiss();
  }

  async createWidget(widgetType: string, modal: any){
    this.saving = true;
    try{
      switch(widgetType){
        case 'vote':
          const options = this.voteWidgetForm.value.opciones!.map((option: any) => ({id: crypto.randomUUID(), text: option, votes: 0}));
          await this.widgetService.createWidget({
            ownerId: this.user.uid,
            visibility: this.voteWidgetForm.value.public ? 'public' : 'private',
            type: 'vote',
            name: this.voteWidgetForm.value.nombre!,
            description: this.voteWidgetForm.value.descripcion || '',
            createdAt: Timestamp.now(),
            data: {
              question: this.voteWidgetForm.value.pregunta,
              totalVotes: 0,
              options
            }
          });
          this.voteWidgetForm.reset();
          break;
        case 'img':
          await this.widgetService.createImageWidget({
            ownerId: this.user.uid,
            visibility: this.imgWidgetForm.value.public ? 'public' : 'private',
            type: 'image',
            name: this.imgWidgetForm.value.nombre!,
            description: this.imgWidgetForm.value.descripcion || '',
            createdAt: Timestamp.now(),
          }, this.imageFile);
          this.imgWidgetForm.reset();
          break;
        case 'text':
          await this.widgetService.createWidget({
            ownerId: this.user.uid,
            visibility: this.textWidgetForm.value.public ? 'public' : 'private',
            type: 'text',
            name: this.textWidgetForm.value.nombre!,
            description: this.textWidgetForm.value.descripcion || '',
            createdAt: Timestamp.now(),
            data: {
              text: this.textWidgetForm.value.text
            }
          });
          this.textWidgetForm.reset();
          break;
      }
    }catch(error){
      console.log(error);
    }
    this.saving = false;
    this.closeModal(widgetType, modal);
  }

  async saveWidget(modal: any){
    this.saving = true;
    try{
      switch(this.selectedWidget?.type){
        case 'vote':
          const options = this.voteWidgetForm.value.opciones!.map((option: any) => ({id: crypto.randomUUID(), text: option, votes: 0}));
          await this.widgetService.modifyWidget({
            visibility: this.voteWidgetForm.value.public ? 'public' : 'private',
            name: this.voteWidgetForm.value.nombre!,
            description: this.voteWidgetForm.value.descripcion  || '',
            data: {
              question: this.voteWidgetForm.value.pregunta,
              options: options,
              totalVotes: this.selectedWidget.data.totalVotes
            }
          }, this.selectedWidget.widgetId!);
          this.voteWidgetForm.reset();
          break;
        case 'image':
          await this.widgetService.modifyImageWidget({
            visibility: this.imgWidgetForm.value.public ? 'public' : 'private',
            name: this.imgWidgetForm.value.nombre!,
            description: this.imgWidgetForm.value.descripcion || '',
            data: {
              imageUrl: ''
            }
          }, this.imageFile, this.selectedWidget.widgetId!, this.selectedWidget.data.imageUrl);
          this.imgWidgetForm.reset();
          break;
        case 'text':
          await this.widgetService.modifyWidget({
            visibility: this.textWidgetForm.value.public ? 'public' : 'private',
            name: this.textWidgetForm.value.nombre!,
            description: this.textWidgetForm.value.descripcion || '',
            data: {
              text: this.textWidgetForm.value.text
            }
          }, this.selectedWidget.widgetId!);
          this.textWidgetForm.reset();
          break;
      }
    }catch(error){
      console.log(error)
    }
    this.closeModal(this.selectedWidget?.type!, modal);
    this.saving = false;
  }

  async changeVisivility(visibility: string, widgetId: string){
    await this.widgetService.changeVisivility(visibility, widgetId);
  }

  async deleteWidget(widget: Widget){
    await this.widgetService.deleteWidget(widget.widgetId!, widget.type);
  }

  isMobile(): boolean {
    return this.platform.is('hybrid');
  }

  async selectImage() {
    if (this.isMobile()) {
      await this.selectFromCamera();
    } else {
      this.selectFromFile();
    }
  }

  async selectFromCamera() {
    const image = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt
    });

    this.imagePreview = image.dataUrl!;
    const response = await fetch(image.dataUrl!);
    const blob = await response.blob();
    this.imageFile = new File([blob], 'image.jpg', { type: blob.type });
  }

  selectFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  addOption() {
    this.opciones.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number) {
    if (this.opciones.length > 2) {
      this.opciones.removeAt(index);
    }
  }

  async sendInvitation(event: any){
    let invitation = null;
    invitation = {
      email: event.email,
      username: event.username,
      createdAt: Timestamp.now(),
      role: 'viewer',
      ownerUsername: this.user.username,
      invitationType: 'widget',
      widgetId: this.selectedWidget?.widgetId,
      widgetType: this.selectedWidget?.type,
      userId: event.userId
    }
    await this.invitationService.createInvitation(invitation);
    this.selectedWidgetSharedWith = await this.widgetService.getWidgetSharedWith(this.selectedWidget?.widgetId!);
  }

  async sendInvitationForGroup(group: any){
    this.saving = true;
    let invitations: any [] = [];
    let userFromGroup: any = await this.groupService.getMyGroupsUsers(group.groupData.groupId);
    userFromGroup.forEach((u: any) => {
      invitations.push({
        email: u.email,
        username: u.username,
        createdAt: Timestamp.now(),
        role: 'viewer',
        ownerUsername: this.user.username,
        invitationType: 'widget',
        widgetId: this.selectedWidget?.widgetId,
        widgetType: this.selectedWidget?.type,
        userId: u.userId
      })
    });
    group.sended = true;
    await this.invitationService.createGroupInvitationsWidget(invitations);
    this.saving = false;
  }

  async deleteInvitation(user: any){
    await this.invitationService.deleteInvitation(user.widgetId, user.userId, 'widget');
    this.selectedWidgetSharedWith = await this.widgetService.getWidgetSharedWith(this.selectedWidget?.widgetId!);
  }

  async changeRole(user: any, role: string){
    this.selectedWidgetSharedWith!.find(u => u.userId == user.userId).role = role;
    await this.invitationService.modifyInvitation(user.widgetId, user.userId, role);
  }

  vote(widget: any, optionId: string){
    this.widgetService.vote(widget, optionId)
  }

  getPercentage(widget: any, option: any): number {
    const totalVotes = widget.data.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((option.votes / totalVotes) * 100);
  }
}
