import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, collectionData, deleteDoc, doc, orderBy, query, setDoc, where,  } from '@angular/fire/firestore';
import { Group } from '../../models/group.interface';

@Injectable({
  providedIn: 'root',
})
export class GroupService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);

  getMyGroups(){
    const uid = this.auth.currentUser?.uid;
    const groupsRef = collection(this.firestore, 'groups');
    const q = query(groupsRef, where('ownerId', '==', uid), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'groupId' })
  }

  async createGroup(group: Group) {
    await setDoc(doc(this.firestore, 'groups'), group);
  }

  deleteGroup(groupId: string){
    const docRef = doc(this.firestore, `groups/${groupId}`);
    return deleteDoc(docRef);
  }
}