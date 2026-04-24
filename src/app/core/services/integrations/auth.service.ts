import { inject, Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router)
  user = signal<any | null>(null);

  async login(identifier: string, password: string) {
    try {
      let email = identifier;
      if (!identifier.includes('@')) {
        const usersRef = collection(this.firestore, 'users');
        const q = query(usersRef, where('username', '==', identifier));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          throw new Error('Usuario no encontrado');
        }
  
        email = querySnapshot.docs[0].data()['email'];
      }
  
      await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      this.router.navigateByUrl('')
      return
    } catch (error: any) {
      console.log(error);
      return null;
    }
  }

  async register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    return userCredential.user.uid;
  }

  async logout() {
    sessionStorage.clear();
    await signOut(this.auth);
    this.router.navigateByUrl('/login')
  }
}
