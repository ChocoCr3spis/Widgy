import { inject, Injectable } from '@angular/core';
import { Firestore, doc, setDoc, docData, QueryConstraint, limit, endAt, startAt, orderBy, collection, collectionData, query } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { BehaviorSubject, of, switchMap, map, firstValueFrom, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private userSubject = new BehaviorSubject<any | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    this.initUserListener();
  }

  private initUserListener() {
    authState(this.auth).pipe(
      switchMap(firebaseUser => {
  
        if (!firebaseUser) return of(null);
  
        const userRef = doc(this.firestore, 'users', firebaseUser.uid);
  
        return docData(userRef).pipe(
          map(userData => ({
            ...userData,
            uid: firebaseUser.uid
          }))
        );
  
      })
    ).subscribe(userData => {
      this.userSubject.next(userData);
    });
  }

  async createUserInfo(username: string, email: string, uid: string) {
    await setDoc(doc(this.firestore, 'users', uid), {
      username: username,
      email: email,
      createdAt: new Date(),
      usernameLower: username.toLowerCase()
    });
  }

  async getCurrentUser() {
    return await firstValueFrom(
      this.user$.pipe(filter(user => !!user))
    );
  }

  searchUsers(username: string) {
    const usersRef = collection(this.firestore, 'users');
    let filters: QueryConstraint[] = [
      orderBy('usernameLower'),
      startAt(username.toLowerCase()),
      endAt(username.toLowerCase() + '\uf8ff'),
      limit(10)
    ]
    const q = query( usersRef, ...filters);
    return collectionData(q, {
      idField: 'userId'
    });

  }
}