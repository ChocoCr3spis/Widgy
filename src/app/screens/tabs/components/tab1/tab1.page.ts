import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonListHeader, IonList, IonItem, IonThumbnail, IonIcon, IonLabel, IonSkeletonText, IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonModal, ActionSheetController, IonHeader, IonToolbar, IonTitle, IonButtons, IonInput, IonCard, IonTextarea, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { fileTray, image, text, add, trash, appsOutline} from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UserService } from 'src/app/core/services/integrations/user.service';
import { Timestamp } from '@angular/fire/firestore';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';
import { Widget } from 'src/app/core/models/widget.interface';

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
    IonThumbnail,
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
    IonCardContent
],
  providers: [IonModal]
})
export class Tab1Page {
  public loaded = false;
  presentingElement!: HTMLElement | null;

  textWidgetForm: FormGroup;
  voteWidgetForm: FormGroup;
  imgWidgetForm: FormGroup;

  imageFile: File | null = null;
  imagePreview: string | null = null;

  userId: string = "";
  widgets?: Widget[] | any;

  constructor(
    private fb: FormBuilder,
    private platform: Platform,
    private userService: UserService,
    private widgetService: WidgetService
  ) {
    addIcons({ fileTray, image, text, add, trash, appsOutline });

    this.textWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      text: [null, [Validators.required, Validators.maxLength(250)]]
    });

    this.voteWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      pregunta: [null, [Validators.required]],
      opciones: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ])
    });

    this.imgWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]]
    });
  }

  get opciones(): FormArray {
    return this.voteWidgetForm.get('opciones') as FormArray;
  }

  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    this.userId = (await this.userService.getCurrentUser()).uid;
    this.widgetService.getMyWidgets().subscribe( widgets => {widgets = this.widgets; console.log(this.widgets)});
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
    }
    modal.dismiss();
  }

  async createWidget(widgetType: string, modal: any){
    switch(widgetType){
      case 'vote':
        await this.widgetService.createWidget({
          ownerId: this.userId,
          visibility: 'private',
          type: 'vote',
          name: this.voteWidgetForm.value.nombre!,
          description: this.voteWidgetForm.value.pregunta || '',
          createdAt: Timestamp.now(),
          sharedWith: [],
          data: {
            question: this.voteWidgetForm.value.text,
            options: this.voteWidgetForm.value.opciones
          }
        });
        console.log('Datos:', this.voteWidgetForm.value);

        this.voteWidgetForm.reset();
        break;
      case 'img':
        console.log('Datos:', this.imgWidgetForm.value);
        console.log('Imagen:', this.imageFile);
        this.imgWidgetForm.reset();
        break;
      case 'text':
        await this.widgetService.createWidget({
          ownerId: this.userId,
          visibility: 'private',
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
