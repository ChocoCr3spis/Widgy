import { Injectable, inject } from '@angular/core';
import { Firestore, QueryConstraint, collection, addDoc, collectionData, query, where, doc, updateDoc, deleteDoc, orderBy, limit, startAfter, getDocs, docData, getDoc, writeBatch, Timestamp, increment, runTransaction } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytes, deleteObject  } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { Widget } from '../../models/widget.interface';

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
    const q = query(widgetsRef,where('ownerId', '==', uid),orderBy('createdAt', 'desc'));

    return collectionData(q, { idField: 'widgetId' }).pipe(
      switchMap((widgets: any[]) => {
        if (widgets.length === 0) return of([]);
        const streams = widgets.map(widget => {
          if (widget.type !== 'vote') return of(widget);
          const voteRef = doc(this.firestore,`widgets/${widget.widgetId}/votes/${uid}`);
          return docData(voteRef).pipe( map((vote: any) => ({...widget, myVote: vote?.optionId ?? null })));
        });
        return combineLatest(streams);
      })
    );
  }

  // getSharedWidgets() {
  //   const uid = this.auth.currentUser?.uid;
  //   const sharedRef = collection(this.firestore,`users/${uid}/sharedWidgets`);
  //   return collectionData(sharedRef).pipe(switchMap((sharedWidgets: any[]) => {
  //     if (sharedWidgets.length === 0) {
  //       return of([]);
  //     }
  //     const widgetStreams = sharedWidgets.map(sharedWidget =>
  //       docData( doc(this.firestore, `widgets/${sharedWidget.widgetId}`),{ idField: 'widgetId' }).pipe(
  //         map((widget: any) => {
  //           return { ...widget, role: sharedWidget.role }
  //         })
  //       )
  //     );
  //     return combineLatest(widgetStreams);
  //   }));
  // }

  getSharedWidgets() {
    const uid = this.auth.currentUser?.uid;
  
    const sharedRef = collection(
      this.firestore,
      `users/${uid}/sharedWidgets`
    );
  
    return collectionData(sharedRef).pipe(
      switchMap((sharedWidgets: any[]) => {
  
        if (sharedWidgets.length === 0) {
          return of([]);
        }
  
        const widgetStreams = sharedWidgets.map(sharedWidget => {
  
          const widgetRef = doc(
            this.firestore,
            `widgets/${sharedWidget.widgetId}`
          );
  
          return docData(widgetRef, { idField: 'widgetId' }).pipe(
  
            switchMap((widget: any) => {
  
              if (!widget) {
                return of(null);
              }
  
              if (widget.type !== 'vote') {
                return of({
                  ...widget,
                  role: sharedWidget.role,
                  myVote: null
                });
              }
  
              const voteRef = doc(
                this.firestore,
                `widgets/${widget.widgetId}/votes/${uid}`
              );
  
              return docData(voteRef).pipe(
                map((vote: any) => ({
                  ...widget,
                  role: sharedWidget.role,
                  myVote: vote?.optionId ?? null
                }))
              );
            })
          );
        });
  
        return combineLatest(widgetStreams).pipe(
          map(widgets => widgets.filter(Boolean))
        );
      })
    );
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
    });
    snapshot.docs.map(doc =>{ batch.delete(doc.ref) })
    const docRef = doc(this.firestore, `widgets/${widgetId}`);
    batch.delete(docRef);
    await batch.commit();
  }

  async getPublicWidgets(filters: any) {
    const uid = this.auth.currentUser?.uid;
    const widgetsRef = collection(this.firestore, 'widgets');
    const conditions: QueryConstraint[] = [where('visibility', '==', 'public')];
  
    if (filters?.type && Array.isArray(filters.type) && filters.type.length > 0) {
      conditions.push(where('type', 'in', filters.type));
    }
  
    if (filters?.dateFrom) {
      const start = new Date(filters.dateFrom);
      start.setHours(0, 0, 0, 0);
      conditions.push(where('createdAt', '>=', start));
    }
  
    if (filters?.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      conditions.push(where('createdAt', '<=', end));
    }
  
    if (filters?.text) {
      conditions.push(where('name', '==', filters.text));
    }
  
    if (filters?.owners && Array.isArray(filters.owners) && filters.owners.length > 0) {
      conditions.push(where('ownerId', 'in', filters.owners));
    }
  
    conditions.push(orderBy('createdAt', 'desc'));
  
    if (filters?.lastWidget) {
      conditions.push(startAfter(filters.lastWidget));
    }
  
    conditions.push(limit(4));
    const q = query(widgetsRef, ...conditions);
    const snapshot = await getDocs(q);
    const widgets = await Promise.all(
      snapshot.docs.map(async d => {
  
        const widget: any = {
          widgetId: d.id,
          ...d.data()
        };
  
        widget.myVote = null;
  
        if (widget.type === 'vote' && uid) {
  
          const voteRef = doc(
            this.firestore,
            `widgets/${widget.widgetId}/votes/${uid}`
          );
  
          const voteSnap = await getDoc(voteRef);
  
          if (voteSnap.exists()) {
            widget.myVote = voteSnap.data()['optionId'];
          }
        }
  
        return widget;
      })
    );
  
    return {
      data: widgets,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };
  }
  
  async vote(widget: Widget, optionId: string) {
    const uid = this.auth.currentUser?.uid;
    if (!uid || !widget.widgetId) return;
    const widgetRef = doc(this.firestore,`widgets/${widget.widgetId}`);
    const voteRef = doc(this.firestore,`widgets/${widget.widgetId}/votes/${uid}`);
  
    await runTransaction(this.firestore, async transaction => {
      const widgetSnap = await transaction.get(widgetRef);
      if (!widgetSnap.exists()) throw new Error('El widget no existe');
      const voteSnap = await transaction.get(voteRef);
      const widgetData: any = widgetSnap.data();
      const options = [...widgetData.data.options];
      if (voteSnap.exists()) {
        const previousOptionId = voteSnap.data()['optionId'];
        if (previousOptionId === optionId) return;
        const previousIndex = options.findIndex(
          (o: any) => o.id === previousOptionId
        );
        if (previousIndex !== -1) options[previousIndex].votes--;
      }
      else {
        widgetData.data.totalVotes = (widgetData.data.totalVotes || 0) + 1;
      }
      const newIndex = options.findIndex(
        (o: any) => o.id === optionId
      );
      if (newIndex === -1) throw new Error('La opción no existe');
      options[newIndex].votes++;
      transaction.update(widgetRef, { 'data.options': options, 'data.totalVotes': widgetData.data.totalVotes});
      transaction.set(voteRef, { optionId, votedAt: Timestamp.now()});
    });
  }

  getMyVote(widgetId: string){
    const uid = this.auth.currentUser?.uid;
    const myVoteRef = doc(this.firestore, `widgets/${widgetId}/votes/${uid}`);
    return docData(myVoteRef)
  }
}