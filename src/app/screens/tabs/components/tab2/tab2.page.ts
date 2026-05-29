import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonCardContent, IonSkeletonText } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../../explore-container/explore-container.component';
import { WidgetService } from 'src/app/core/services/integrations/widget.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonCard, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonCardContent, IonSkeletonText]
})
export class Tab2Page {

  widgets: any[] | null = null;

  constructor(
    private widgetService: WidgetService
  ) {}

  ngOnInit(){
    this.widgetService.getWidgetsSharedWithMe().subscribe(w => this.widgets = w);
  }
}
