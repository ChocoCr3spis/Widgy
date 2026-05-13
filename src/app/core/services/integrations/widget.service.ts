import { Injectable, inject } from '@angular/core';
import { Firestore, QueryConstraint, collection, addDoc, collectionData, query, where, doc, updateDoc, deleteDoc, orderBy, limit, startAfter, getDocs } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytes, deleteObject  } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { Widget } from '../../models/widget.interface';

@Injectable({
  providedIn: 'root'
})

export class WidgetService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private storage = inject(Storage);

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

  async changeVisivility(visibility: string, widgetId: string){
    const ref = doc(this.firestore, `widgets/${widgetId}`);
    await updateDoc(ref, { visibility: visibility });
  }

  async deleteWidget(widgetId: string, widgetType: string){
    if(widgetType == 'image') {
      const imageRef = ref(this.storage, `widgets/${widgetId}/image.jpg`);
      deleteObject(imageRef);
    }
    const docRef = doc(this.firestore, `widgets/${widgetId}`);
    return deleteDoc(docRef);
  }

  async createImageWidget(widget: any, imageFile: File | null) {
    const docRef = await addDoc(collection(this.firestore, 'widgets'),{ ...widget,data: { imageUrl: '' } });
    const storageRef = ref(this.storage, `widgets/${docRef.id}/image.jpg`);
    await uploadBytes(storageRef, imageFile!);
    const downloadUrl = await getDownloadURL(storageRef);
    await updateDoc(doc(this.firestore, 'widgets', docRef.id),{ data: { imageUrl: downloadUrl } });
  }

  async getPublicWidgets(filters: any) {
    const widgetsRef = collection(this.firestore, 'widgets');

    const conditions: QueryConstraint[] = [
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(4),
    ];

    if (filters?.lastWidget) conditions.push(startAfter(filters.lastWidget));
    if (filters?.type) conditions.push(where('type', '==', filters.type));
    if (filters?.dateFrom) conditions.push(where('createdAt', '>=', new Date(filters.dateFrom)));
    if (filters?.dateTo) conditions.push(where('createdAt', '<=', new Date(filters.dateTo))); 

    const q = query(widgetsRef, ...conditions);
    
    const snapshot = await getDocs(q);

    return {
      data: snapshot.docs.map(d => ({ widgetId: d.id, ...d.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };

    //return collectionData(q, { idField: 'widgetId' })
  }

}