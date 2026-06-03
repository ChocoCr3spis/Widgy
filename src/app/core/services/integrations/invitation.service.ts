import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, query, writeBatch,  } from '@angular/fire/firestore';
import { getDoc } from 'firebase/firestore';

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

  async createGroupInvitations(invitations: any, groupId: string){
    const batch = writeBatch(this.firestore);
    invitations.forEach((invitation: any) => {
      invitation.groupId = groupId;
      const invitedUserRef = doc(this.firestore,`users/${invitation.userId}/invitations/${groupId}`);
      batch.set(invitedUserRef, invitation);
    });
    await batch.commit();
  }

  async deleteInvitation(invitationTypeId: string, userId: string, type: string){
    const batch = writeBatch(this.firestore);
    if(type === 'group'){
      const groupRef = doc(this.firestore,`groups/${invitationTypeId}/members/${userId}`);
      const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${invitationTypeId}`);
      const groupUserRef = doc(this.firestore,`users/${userId}/sharedGroups/${invitationTypeId}`);
      batch.delete(groupRef);
      batch.delete(invitedUserRef);
      batch.delete(groupUserRef);
    }else{
      const widgetRef = doc(this.firestore,`widgets/${invitationTypeId}/invitations/${userId}`);
      const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${invitationTypeId}`);
      const widgetsUserRef = doc(this.firestore,`users/${userId}/sharedWidgets/${invitationTypeId}`);
      batch.delete(widgetRef);
      batch.delete(invitedUserRef);
      batch.delete(widgetsUserRef);
    }
    await batch.commit();
  }

  async rejectInvitation(invitationTypeId: string, userId: string, type: string){
    const batch = writeBatch(this.firestore);
    if(type === 'group'){
      const groupRef = doc(this.firestore,`groups/${invitationTypeId}/members/${userId}`);
      const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${invitationTypeId}`);
      batch.delete(groupRef);
      batch.delete(invitedUserRef);
    }else{
      const widgetRef = doc(this.firestore,`widgets/${invitationTypeId}/invitations/${userId}`);
      const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${invitationTypeId}`);
      batch.delete(widgetRef);
      batch.delete(invitedUserRef);
    }
    await batch.commit();
  }

  async acceptWidgetInvitation(widgetId: string, userId: string, role: string){
    const batch = writeBatch(this.firestore);
    const widgetUserRef = doc(this.firestore,`users/${userId}/sharedWidgets/${widgetId}`);
    const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${widgetId}`);
    batch.set(widgetUserRef, { widgetId: widgetId, role: role });
    batch.delete(invitedUserRef);
    await batch.commit();
  }

  async acceptGroupInvitation(groupId: string, userId: string, role: string){
    const batch = writeBatch(this.firestore);
    const groupRef = doc(this.firestore,`groups/${groupId}/members/${userId}`);
    const groupUserRef = doc(this.firestore,`users/${userId}/sharedGroups/${groupId}`);
    const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${groupId}`);
    batch.update(groupRef, { state: 'accepted' });
    batch.set(groupUserRef, { groupId: groupId, role: role });
    batch.delete(invitedUserRef);
    await batch.commit();
  }

  async modifyInvitation(widgetId: string, userId: string, role: string) {
    const batch = writeBatch(this.firestore);
    const widgetRef = doc(this.firestore,`widgets/${widgetId}/invitations/${userId}`);
    const widgetUserRef = doc(this.firestore,`users/${userId}/sharedWidgets/${widgetId}`);
    const invitedUserRef = doc(this.firestore,`users/${userId}/invitations/${widgetId}`);
    batch.update(widgetRef, { role });
    if ((await getDoc(invitedUserRef)).exists()) {
      batch.update(invitedUserRef, { role });
    }
    if ((await getDoc(widgetUserRef)).exists()) {
      batch.update(widgetUserRef, { role });
    }
    await batch.commit();
  }

  getInvitations(){
    const uid = this.auth.currentUser?.uid;
    const invitationsRef = collection(this.firestore, `users/${uid}/invitations`);
    const q = query(invitationsRef);
    return collectionData(q, { idField: 'widgetId' })
  }
}