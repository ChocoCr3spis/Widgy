import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonListHeader, IonList, IonItem, IonThumbnail, IonIcon, IonLabel, IonSkeletonText, IonButton, IonContent, IonFab, IonFabButton, IonFabList, IonModal, ActionSheetController, IonHeader, IonToolbar, IonTitle, IonButtons, IonInput, IonCard, IonTextarea } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { fileTray, image, text, add, trash} from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
    IonTextarea
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

  constructor(
    private fb: FormBuilder,
    private platform: Platform
  ) {
    addIcons({ fileTray, image, text, add, trash });

    this.textWidgetForm = this.fb.group({
      nombre: [null, [Validators.required, Validators.maxLength(20)]],
      descripcion: [null, [Validators.required, Validators.maxLength(50)]],
      text: [null, [Validators.required, Validators.maxLength(20)]]
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

  ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
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

  createWidget(widgetType: string, modal: any){
    debugger
    switch(widgetType){
      case 'vote':
        this.voteWidgetForm.reset();
        console.log('Datos:', this.voteWidgetForm.value);
        break;
      case 'img':
        console.log('Datos:', this.imgWidgetForm.value);
        console.log('Imagen:', this.imageFile);
        this.imgWidgetForm.reset();
        break;
      case 'text':
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
