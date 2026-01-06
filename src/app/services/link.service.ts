import { Injectable, signal, computed, inject } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, getDocs, getDoc } from '@angular/fire/firestore';
import { Link } from '../models/data.models';
import { from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LinkService {
  private firestore = inject(Firestore);

  async getLinkById(id: string): Promise<Link | undefined> {
    const existing = this._links().find(l => l.id === id);
    if (existing) return existing;

    try {
      const docRef = doc(this.firestore, 'links', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Link;
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  // State
  private _links = signal<Link[]>([]);
  private _loading = signal<boolean>(true);
  private _error = signal<string | null>(null);

  // Selectors
  links = computed(() => this._links());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  constructor() {
    this.loadLinks();
  }

  private loadLinks() {
    this._loading.set(true);
    const linksCollection = collection(this.firestore, 'links');
    const q = query(linksCollection, orderBy('createdAt', 'desc'));

    from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Link[];
      })
    ).subscribe({
      next: (data) => {
        this._links.set(data);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Error loading links', err);
        this._error.set('Failed to load links');
        this._loading.set(false);
      }
    });
  }

  async addLink(link: Omit<Link, 'id' | 'createdAt'>) {
    try {
      const newLink: Link = {
        ...link,
        createdAt: Date.now()
      };
      const linksCollection = collection(this.firestore, 'links');
      await addDoc(linksCollection, newLink);
      // Reload links since getDocs is not realtime
      this.loadLinks();
    } catch (e) {
      this._error.set('Error adding link');
      console.error(e);
      throw e;
    }
  }

  async deleteLink(id: string) {
    try {
      const docRef = doc(this.firestore, 'links', id);
      await deleteDoc(docRef);
      // Update local state without refetching for better UX
      this._links.update(links => links.filter(l => l.id !== id));
    } catch (e) {
      this._error.set('Error deleting link');
      console.error(e);
    }
  }

  async updateLink(id: string, updates: Partial<Link>) {
    try {
      const docRef = doc(this.firestore, 'links', id);
      await updateDoc(docRef, updates);
      this.loadLinks();
    } catch (e) {
      this._error.set('Error updating link');
      console.error(e);
    }
  }
}
