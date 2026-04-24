import { CommonModule } from '@angular/common';
import { UserService } from './../../core/services/integrations/user.service';
import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, IonCard, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square } from 'ionicons/icons';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, CommonModule],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  user$!: Observable<any>;

  constructor(
    private userService: UserService
  ) {
    addIcons({ triangle, ellipse, square });
    this.user$ = this.userService.user$;
  }
}
