import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData, deleteDoc, doc, docData, getDocs, orderBy, query, setDoc, where, writeBatch,  } from '@angular/fire/firestore';
import { Group } from '../../models/group.interface';
import { updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createInvitation(invitation: any){
    const batch = writeBatch(this.firestore);
    const widgetRef = doc(this.firestore,`widgets/${invitation.widgetId}/invitations/${invitation.userId}`);
    const invitedUserRef = doc(this.firestore,`users/${invitation.userId}/invitations/${invitation.widgetId}`);
    batch.set(widgetRef, invitation);
    batch.set(invitedUserRef, invitation);
    await batch.commit();
  }

  async deleteInvitation(widgetId: string, userId: string){
    const batch = writeBatch(this.firestore);
    const widgetRef = doc(this.firestore,`widgets/${widgetId}/invitations/${userId}`);
    const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${widgetId}`);
    const widgetsUserRef = doc(this.firestore,`users/${userId}/sharedWidgets/${widgetId}`);
    batch.delete(widgetRef);
    batch.delete(invitedUserRef);
    batch.delete(widgetsUserRef);
    await batch.commit();
  }

  async rejectInvitation(widgetId: string, userId: string){
    const batch = writeBatch(this.firestore);
    const widgetRef = doc(this.firestore,`widgets/${widgetId}/invitations/${userId}`);
    const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${widgetId}`);
    batch.delete(widgetRef)
    batch.delete(invitedUserRef)
    await batch.commit();
  }

  async acceptInvitation(widgetId: string, userId: string, widgetInfo: any){
    const batch = writeBatch(this.firestore);
    const widgetUserRef = doc(this.firestore,`users/${userId}/sharedWidgets/${widgetId}`);
    const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${widgetId}`);
    batch.set(widgetUserRef, widgetInfo);
    batch.delete(invitedUserRef);
    await batch.commit();
  }


  async modifyInvitation(widgetId: string, userId: string, role: string){
    const batch = writeBatch(this.firestore);
    const widgetRef = doc(this.firestore,`widgets/${widgetId}/invitations/${userId}`);
    const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${widgetId}`);
    batch.update(widgetRef, { role: role })
    batch.update(invitedUserRef, { role: role})
    await batch.commit();
  }

  getInvitations(){
    const uid = this.auth.currentUser?.uid;
    const invitationsRef = collection(this.firestore, `users/${uid}/invitations`);
    const q = query(invitationsRef);
    return collectionData(q, { idField: 'widgetId' })
  }
}