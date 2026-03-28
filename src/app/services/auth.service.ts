import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth = inject(Auth);

    // Expose the current user as a signal
    currentUser = toSignal(user(this.auth));

    async login() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            return result.user;
        } catch (error) {
            console.error('Login failed', error);
            return null;
        }
    }

    async logout() {
        await signOut(this.auth);
    }

    get isAuthenticated() {
        return !!this.currentUser();
    }

    get uid() {
        return this.currentUser()?.uid;
    }
}
