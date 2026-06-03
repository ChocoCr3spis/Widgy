import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData, deleteDoc, doc, docData, getDocs, orderBy, query, setDoc, where, writeBatch,  } from '@angular/fire/firestore';
import { updateDoc } from 'firebase/firestore';
import { InvitationService } from './invitation.service';
import { combineLatest, map, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private invitationService = inject(InvitationService)

  getMyGroups() {
    const uid = this.auth.currentUser?.uid;
    const groupsRef = collection(this.firestore, 'groups');
    const q = query(groupsRef, where('ownerId', '==', uid), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'groupId' });
  }

  async getMyGroupsUsers(groupId: string){
    const usersRef = collection(this.firestore, `groups/${groupId}/members`);
    const q = query(usersRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data()}))
  }

  changeUserRole(role: string, userId: string, groupId: string){
    const userRef = doc(this.firestore, `groups/${groupId}/members/${userId}`);
    updateDoc(userRef, { role: role })
  }

  async createGroup(group: any, users: any[], invitations: any[]) {
    const groupRef = doc(collection(this.firestore, 'groups'));
    const batch = writeBatch(this.firestore);
    batch.set(groupRef, { ...group });
    users.forEach(user => {
      const memberRef = doc(this.firestore,`groups/${groupRef.id}/members/${user.userId}`);
      batch.set(memberRef, { userId: user.userId, role: user.role, email: user.email, username: user.username, state: 'pending' });
    });
    await batch.commit();

    this.invitationService.createGroupInvitations(invitations, groupRef.id);
  }

  async modifyGroup(groupId: string, group: any, addedUsers: any[], removedUsers: any[], updatedUsers: any[]) {
    const batch = writeBatch(this.firestore);
    // ADD
    addedUsers.forEach(user => {
      const ref = doc(this.firestore,`groups/${groupId}/members/${user.userId}`);
      batch.set(ref, {
        userId: user.userId,
        username: user.username,
        role: user.role,
        state: 'accepted'
      });
    });
  
    // DELETE
    removedUsers.forEach(user => {
      const ref = doc(this.firestore,`groups/${groupId}/members/${user.userId}`);
      batch.delete(ref);
    });
  
    // UPDATE
    updatedUsers.forEach(user => {
      const ref = doc(this.firestore,`groups/${groupId}/members/${user.userId}`);
      batch.update(ref, { role: user.role });
    });

    //UPDATE GROUP INFO
    if(group){
      const docRef = doc(this.firestore, `groups/${groupId}`);
      updateDoc(docRef, group)
    }
    await batch.commit();
  }

  deleteGroup(groupId: string){
    const docRef = doc(this.firestore, `groups/${groupId}`);
    return deleteDoc(docRef);
  }

  getSharedGroups() {
    const uid = this.auth.currentUser?.uid;
    const sharedRef = collection(this.firestore,`users/${uid}/sharedGroups`);
    return collectionData(sharedRef).pipe(switchMap((sharedGroups: any[]) => {
      if (sharedGroups.length === 0) {
        return of([]);
      }
      const widgetStreams = sharedGroups.map(sharedGroup =>
        docData(doc(this.firestore, `groups/${sharedGroup.groupId}`),{ idField: 'groupId' }).pipe(
          map((group: any) => {
            return { ...group, role: sharedGroup.role }
          })
        )
      );
      return combineLatest(widgetStreams);
    }));
  }
}