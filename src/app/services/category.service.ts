import { Injectable, inject, signal, computed } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Category } from '../models/data.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private firestore = inject(Firestore);

  private _categories = signal<Category[]>([]);
  categories = computed(() => this._categories());

  constructor() {
    this.loadCategories();
  }

  private loadCategories() {
    const categoriesCollection = collection(this.firestore, 'categories');
    // Default categories if empty? logic can be added here
    
    collectionData(categoriesCollection, { idField: 'id' }).pipe(
      takeUntilDestroyed()
    ).subscribe(data => {
      if (data.length === 0) {
        // Initialize defaults if needed, or just leave empty
        this._categories.set(this.getDefaultCategories());
      } else {
        this._categories.set(data as Category[]);
      }
    });
  }

  getDefaultCategories(): Category[] {
    return [
      { id: 'general', name: 'General', color: 'bg-slate-500', icon: 'folder' },
      { id: 'music', name: 'Music', color: 'bg-rose-500', icon: 'music_note' },
      { id: 'dev', name: 'Development', color: 'bg-blue-500', icon: 'code' },
    ];
  }

  async addCategory(name: string, color: string) {
    const col = collection(this.firestore, 'categories');
    await addDoc(col, { name, color, icon: 'folder' });
  }
}
