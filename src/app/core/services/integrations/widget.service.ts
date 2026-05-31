import { Injectable, inject } from '@angular/core';
import { Firestore, QueryConstraint, collection, addDoc, collectionData, query, where, doc, updateDoc, deleteDoc, orderBy, limit, startAfter, getDocs, docData, getDoc, writeBatch } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytes, deleteObject  } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { combineLatest, map, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WidgetService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private storage = inject(Storage);

  async createWidget(widget: any) {
    const widgetsRef = collection(this.firestore, 'widgets');
    return addDoc(widgetsRef, widget);
  }

  async getWidgetInfo(widgetId: any){
    const widgetRef = doc(this.firestore, `widgets/${widgetId}`);
    const snapshot = await getDoc(widgetRef);
    if (!snapshot.exists()) {
      return null;
    }
    return {widgetId: snapshot.id, ...snapshot.data()};
  }

  async createImageWidget(widget: any, imageFile: File | null) {
    const docRef = await addDoc(collection(this.firestore, 'widgets'),{ ...widget,data: { imageUrl: '' } });
    const storageRef = ref(this.storage, `widgets/${docRef.id}/image.jpg`);
    await uploadBytes(storageRef, imageFile!);
    const downloadUrl = await getDownloadURL(storageRef);
    await updateDoc(doc(this.firestore, 'widgets', docRef.id),{ data: { imageUrl: downloadUrl } });
  }

  async modifyWidget(widget: any, widgetId: string){
    const docRef = doc(this.firestore, `widgets/${widgetId}`);
    await updateDoc(docRef, widget);
  }

  async modifyImageWidget(widget: any, imageFile: File | null, widgetId: string, oldDownloadUrl: string) {
    let downloadUrl = '';
    if(imageFile){
      const imageRef = ref(this.storage, `widgets/${widgetId}/image.jpg`);
      deleteObject(imageRef);
      const storageRef = ref(this.storage, `widgets/${widgetId}/image.jpg`);
      await uploadBytes(storageRef, imageFile!);
      downloadUrl = await getDownloadURL(storageRef);
    }else{
      downloadUrl = oldDownloadUrl;
    }
    
    const docRef = doc(this.firestore, `widgets/${widgetId}`);
    widget.data.imageUrl = downloadUrl;
    await updateDoc(docRef, widget);
  }

  getMyWidgets() {
    const uid = this.auth.currentUser?.uid;
    const widgetsRef = collection(this.firestore, 'widgets');
    const q = query(widgetsRef, where('ownerId', '==', uid), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'widgetId' })
  }

  getSharedWidgets() {
    const uid = this.auth.currentUser?.uid;
    const sharedRef = collection(this.firestore,`users/${uid}/sharedWidgets`);
    return collectionData(sharedRef).pipe(switchMap((sharedWidgets: any[]) => {
      if (sharedWidgets.length === 0) {
        return of([]);
      }
      const widgetStreams = sharedWidgets.map(sharedWidget =>
        docData( doc(this.firestore, `widgets/${sharedWidget.widgetId}`),{ idField: 'widgetId' }).pipe(
          map((widget: any) => {
            return { ...widget,role: sharedWidget.role }
          })
        )
      );
      return combineLatest(widgetStreams);
    }));
  }

  async getWidgetSharedWith(widgetId: string){
    const widgetsRef = collection(this.firestore, `widgets/${widgetId}/invitations`);
    const q = query(widgetsRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data()}))
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
    const batch = writeBatch(this.firestore);
    const sharedWith = collection(this.firestore, `widgets/${widgetId}/invitations`)
    const snapshot = await getDocs(sharedWith);
    const invitations = snapshot.docs.map(doc => ({
      userId: doc.id
    }));
    invitations.forEach(u => {
      const userSharedWidgetRef = doc(this.firestore, `users/${u.userId}/sharedWidgets/${widgetId}`);
      batch.delete(userSharedWidgetRef);
    })
    const docRef = doc(this.firestore, `widgets/${widgetId}`);
    batch.delete(docRef);
    await batch.commit();
  }

  async getPublicWidgets(filters: any) {
    const widgetsRef = collection(this.firestore, 'widgets');

    const conditions: QueryConstraint[] = [
      where('visibility', '==', 'public')
    ];

    if (filters?.type && Array.isArray(filters.type) && filters.type.length > 0){
      conditions.push(where('type', 'in', filters.type));
    }
    
    if (filters?.dateFrom){
      const start = new Date(filters.dateFrom);
      start.setHours(0, 0, 0, 0);
      conditions.push(where('createdAt', '>=', start));
    } 

    if (filters?.dateTo){
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      conditions.push(where('createdAt', '<=', end));
    } 

    conditions.push(orderBy('createdAt', 'desc'));

    if (filters?.lastWidget){
      conditions.push(startAfter(filters.lastWidget));
    } 

    conditions.push(limit(4));

    const q = query(widgetsRef, ...conditions);
    const snapshot = await getDocs(q);

    return {
      data: snapshot.docs.map(d => ({ widgetId: d.id, ...d.data() })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };

    //return collectionData(q, { idField: 'widgetId' })
  }

}