import { CommonModule } from '@angular/common';
import { UserService } from './../../core/services/integrations/user.service';
import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonHeader, IonToolbar, IonTitle, IonAvatar, IonCard, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, grid, personAdd, people } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/integrations/auth.service';

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
    private userService: UserService,
    private authService: AuthService
  ) {
    addIcons({ search, grid, personAdd, people });
    this.user$ = this.userService.user$;
  }

  async logOut(){
    this.authService.logout();
  }
}
