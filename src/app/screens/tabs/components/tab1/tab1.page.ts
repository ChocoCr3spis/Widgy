import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon, IonSkeletonText, IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonModal, ActionSheetController, IonHeader, IonToolbar, IonTitle, IonButtons, IonInput, IonCard, IonTextarea, IonCardHeader, IonCardTitle, IonCardContent, IonToggle, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { fileTray, image, text, add, trash, appsOutline, eyeOutline, eyeOffOutline, createOutline, shareSocialOutline } from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UserService } from 'src/app/core/services/integrations/user.service';
import { Timestamp } from '@angular/fire/firestore';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';
import { Widget } from 'src/app/core/models/widget.interface';
import { CommonModule } from '@angular/common';

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
    IonChip
],
  providers: [IonModal]
})
export class Tab1Page {
  public loaded = false;
  presentingElement!: HTMLElement | null;

  textWidgetForm: FormGroup;
  voteWidgetForm: FormGroup;
  imgWidgetForm: FormGroup;
  shareForm: FormGroup;

  imageFile: File | null = null;
  imagePreview: string | null = null;

  userId: string = "";
  widgets?: Widget[] | any;

  selectedWidget: Widget | null = null;
  @ViewChild('modalShare')
  modalShare!: IonModal;
  
  @ViewChild('modalEdit')
  modalEdit!: IonModal;

  constructor(
    private fb: FormBuilder,
    private platform: Platform,
    private userService: UserService,
    private widgetService: WidgetService
  ) {
    
    addIcons({ fileTray, image, text, add, trash, appsOutline, eyeOutline, eyeOffOutline, createOutline, shareSocialOutline });

    this.textWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      text: [null, [Validators.required, Validators.maxLength(250)]],
      public: [false, [Validators.required]]
    });

    this.voteWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      pregunta: [null, [Validators.required]],
      public: [false, [Validators.required]],
      opciones: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ])
    });

    this.imgWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      public: [false, [Validators.required]]
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
    this.userId = (await this.userService.getCurrentUser()).uid;
    this.widgetService.getMyWidgets().subscribe( w => { this.widgets = w });
  }

  async openShareModal(widget: Widget) {
    this.selectedWidget = widget;
    await this.modalShare.present();
  }

  async openEditModal(widget: Widget){
    this.selectedWidget = widget;
    await this.modalEdit.present();
  }

  closeModal(widgetType: string, modal: any){
    switch(widgetType){
      case 'vote':
        this.voteWidgetForm.reset();
        this.opciones.reset();
        break;
      case 'img':
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
    switch(widgetType){
      case 'vote':
        const options = this.voteWidgetForm.value.opciones!.map((option: any) => ({text: option,votes: 0}));
        await this.widgetService.createWidget({
          ownerId: this.userId,
          visibility: this.voteWidgetForm.value.public ? 'public' : 'private',
          type: 'vote',
          name: this.voteWidgetForm.value.nombre!,
          description: this.voteWidgetForm.value.descripcion  || '',
          createdAt: Timestamp.now(),
          sharedWith: [],
          data: {
            question: this.voteWidgetForm.value.pregunta,
            options: options
          }
        });
        this.voteWidgetForm.reset();
        break;
      case 'img':
        await this.widgetService.createImageWidget({
          ownerId: this.userId,
          visibility: this.imgWidgetForm.value.public ? 'public' : 'private',
          type: 'image',
          name: this.imgWidgetForm.value.nombre!,
          description: this.imgWidgetForm.value.descripcion || '',
          createdAt: Timestamp.now(),
          sharedWith: [],
        }, this.imageFile);
        this.imgWidgetForm.reset();
        break;
      case 'text':
        await this.widgetService.createWidget({
          ownerId: this.userId,
          visibility: this.textWidgetForm.value.public ? 'public' : 'private',
          type: 'text',
          name: this.textWidgetForm.value.nombre!,
          description: this.textWidgetForm.value.descripcion || '',
          createdAt: Timestamp.now(),
          sharedWith: [],
          data: {
            text: this.textWidgetForm.value.text
          }
        });
        this.textWidgetForm.reset();
        break;
    }
    this.closeModal(widgetType, modal);
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
}
