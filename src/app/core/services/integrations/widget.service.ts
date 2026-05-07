import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Widget } from '../../models/widget.interface';

@Injectable({
  providedIn: 'root'
})

export class WidgetService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createWidget(widget: Widget) {
    const widgetsRef = collection(this.firestore, 'widgets');
    return addDoc(widgetsRef, widget);
  }

  getMyWidgets() {
    const uid = this.auth.currentUser?.uid;
    console.log(uid)
    const widgetsRef = collection(this.firestore, 'widgets');
    const q = query(widgetsRef, where('ownerId', '==', uid));

    return collectionData(q, { idField: 'widgetId' })
  }

  getPublicWidgets(filters: any) {
    const widgetsRef = collection(this.firestore, 'widgets');
    const q = query(widgetsRef, where('visibility', '==', 'public'));

    return collectionData(q, { idField: 'widgetId' })
  }

}