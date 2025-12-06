import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, collectionData, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Link, Category } from '../models/data.models';
import { Observable, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class LinkService {
  private firestore = inject(Firestore);
  
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
    const linksCollection = collection(this.firestore, 'links');
    const q = query(linksCollection, orderBy('createdAt', 'desc'));
    
    collectionData(linksCollection, { idField: 'id' }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (data: any[]) => {
        this._links.set(data as Link[]);
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
    } catch (e) {
      this._error.set('Error deleting link');
      console.error(e);
    }
  }

  async updateLink(id: string, updates: Partial<Link>) {
    try {
      const docRef = doc(this.firestore, 'links', id);
      await updateDoc(docRef, updates);
    } catch (e) {
      this._error.set('Error updating link');
      console.error(e);
    }
  }
}
