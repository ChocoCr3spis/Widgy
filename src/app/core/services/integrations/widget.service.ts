import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
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

  getPublicWidgets(filters: any) {
    const widgetsRef = collection(this.firestore, 'widgets');
    const q = query(widgetsRef, where('visibility', '==', 'public'));

    return collectionData(q, { idField: 'widgetId' })
  }

}