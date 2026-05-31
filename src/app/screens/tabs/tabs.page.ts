import { CommonModule } from '@angular/common';
import { UserService } from './../../core/services/integrations/user.service';
import { Component, EnvironmentInjector, inject, ViewChild } from '@angular/core';
import { IonModal, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, IonButton, IonButtons, IonBadge, IonContent, IonItem, IonChip, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, grid, personAdd, people, notificationsOutline, calendar, closeOutline, checkmarkOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/integrations/auth.service';
import { InvitationService } from 'src/app/core/services/integrations/invitation.service';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonModal, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, CommonModule, IonButton, IonButtons, IonBadge, IonContent, IonItem, IonChip, IonToast],
  providers: [IonModal]
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  user$!: Observable<any>;
  invitations: any[] | null = null;
  isToastOpen: boolean = false;

  @ViewChild('modalShare')
  modalInvitations!: IonModal;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private invitationService: InvitationService,
    private widgetService: WidgetService
  ) {
    addIcons({ search, grid, personAdd, people, notificationsOutline, calendar, closeOutline, checkmarkOutline });
    this.user$ = this.userService.user$;
  }

  ngOnInit(){
    this.invitationService.getInvitations().subscribe(i => this.invitations = i);
  }

  openInvitations() {
    this.modalInvitations.present();
  }

  closeModal(){
    this.modalInvitations.dismiss();
  }

  async rejectInvitation(invitation: any){
    await this.invitationService.rejectInvitation(invitation.widgetId, invitation.userId)
  }

  async acceptInvitation(invitation: any){
    try{
      const widgetInfo: any = await this.widgetService.getWidgetInfo(invitation.widgetId)
      const widgetPayload = {
        data: widgetInfo!.data,
        description: widgetInfo!.description,
        name: widgetInfo!.name,
        ownerId: widgetInfo!.ownerId,
        type: widgetInfo!.type,
        role: invitation.role,
        createdAt: Timestamp.now()
      }
      await this.invitationService.acceptInvitation(invitation.widgetId, invitation.userId, widgetPayload)
    }catch(error){
      this.isToastOpen = true;
      await this.invitationService.deleteInvitation(invitation.widgetId, invitation.userId)
    }
  }

  async logOut(){
    await this.authService.logout();
    location.reload();
  }
}
