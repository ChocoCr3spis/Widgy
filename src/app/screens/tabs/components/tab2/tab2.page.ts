import { Component, ViewChild } from '@angular/core';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonCardContent, IonSkeletonText, IonButtons, IonButton, IonSpinner, IonInput, IonTextarea } from '@ionic/angular/standalone';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';
import { addIcons, } from 'ionicons';
import { exitOutline, createOutline, trash } from 'ionicons/icons';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { InvitationService } from 'src/app/core/services/integrations/invitation.service';
import { UserService } from 'src/app/core/services/integrations/user.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [ReactiveFormsModule, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonCardContent, IonSkeletonText, IonButtons, IonButton, IonSpinner, IonInput, IonTextarea]
})
export class Tab2Page {
  public saving = false;
  touched: boolean = false;

  widgets: any[] | null = null;
  selectedWidget: any | null = null;

  voteWidgetForm: FormGroup;
  textWidgetForm: FormGroup;
  imgWidgetForm: FormGroup;

  imageFile: File | null = null;
  imagePreview: string | null = null;

  @ViewChild('modalEdit')
  modalEdit!: IonModal;

  constructor(
    private userService: UserService,
    private widgetService: WidgetService,
    private invitationService: InvitationService,
    private fb: FormBuilder,
    private platform: Platform,

  ) {
    addIcons({ createOutline, exitOutline,trash });

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
  }

  get opciones(): FormArray {
    return this.voteWidgetForm.get('opciones') as FormArray;
  }

  ngOnInit(){
    this.widgetService.getSharedWidgets().subscribe(w => this.widgets = w);
  }

  async leave(widget: any){
    await this.invitationService.deleteInvitation(widget.widgetId, (await (this.userService.getCurrentUser())).uid, 'widget');
  }

  async openEditModal(widget: any) {
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
    }
    modal.dismiss();
  }

  async saveWidget(modal: any){
    this.saving = true;
    try{
      switch(this.selectedWidget?.type){
        case 'vote':
          const options = this.voteWidgetForm.value.opciones!.map((option: any) => ({text: option,votes: 0}));
          await this.widgetService.modifyWidget({
            visibility: this.voteWidgetForm.value.public ? 'public' : 'private',
            name: this.voteWidgetForm.value.nombre!,
            description: this.voteWidgetForm.value.descripcion  || '',
            data: {
              question: this.voteWidgetForm.value.pregunta,
              options: options
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
    this.touched = true;
    this.opciones.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number) {
    if (this.opciones.length > 2) {
      this.opciones.removeAt(index);
    }
  }
}
