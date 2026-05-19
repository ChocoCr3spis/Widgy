import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonIcon, IonButton, IonModal, IonItem, IonAvatar, IonLabel, IonSearchbar } from '@ionic/angular/standalone';
import { UserService } from 'src/app/core/services/integrations/user.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-search-users',
  templateUrl: 'search-users.page.html',
  styleUrls: ['search-users.page.scss'],
  imports: [
    IonButton,
    IonIcon,
    ReactiveFormsModule,
    CommonModule,
    IonItem,
    IonAvatar,
    IonLabel,
    IonSearchbar
],
  providers: [IonModal]
})
export class SearchUsers {
  
  usersFound: any[] = [];
  text: any;
  @Input() currentUserId!: string;
  @Input() usersForFilter: any[] = [];
  @Output() userSelected = new EventEmitter<any>();

  constructor(
    private userService: UserService
  ) {
    addIcons({ personAddOutline });
  }

  onSearch(event: any) {
    const value = event.target.value;
    this.text = value;
    if (!value || value.trim() === '') {
      this.usersFound = [];
      return;
    }
    this.userService.searchUsers(value).subscribe(users => {
      // this.usersFound = users.filter(u => !this.usersForFilter.some(user => user.userId === u.userId) && !(u.userId === this.currentUserId))
      this.usersFound = users;
    });
  }

  emitUser(user: any){
    // this.usersFound = this.usersFound.filter(u => u != user);
    this.userSelected.emit(user)
  }
}
