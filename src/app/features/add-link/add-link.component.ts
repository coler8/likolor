import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LinkService } from '../../services/link.service';
import { CategoryService } from '../../services/category.service';
import { MetadataService } from '../../services/metadata.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-link',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
        Save New Link
      </h2>

      <div class="space-y-6">
        <!-- URL Input -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL</label>
          <div class="flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="url" 
              (ngModelChange)="onUrlChange()"
              placeholder="Paste any link (YouTube, TikTok, etc)..."
              class="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-all p-3 w-full"
            >
            <button 
              (click)="fetchMetadata()" 
              [disabled]="loadingMetadata()"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {{ loadingMetadata() ? '...' : 'Fetch' }}
            </button>
          </div>
        </div>

        <!-- Preview / Metadata -->
        <div *ngIf="fetchedData()" class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
          <div class="flex gap-4">
            <img *ngIf="fetchedData()?.imageUrl" [src]="fetchedData()?.imageUrl" class="w-24 h-24 object-cover rounded-lg bg-slate-200">
            <div class="flex-1 space-y-3">
              <div>
                <label class="text-xs font-semibold text-slate-400 uppercase">Title</label>
                <input [(ngModel)]="fetchedData()!.title" class="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none py-1 font-medium">
              </div>
              <div>
                 <label class="text-xs font-semibold text-slate-400 uppercase">Description</label>
                 <textarea [(ngModel)]="fetchedData()!.description" rows="2" class="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none py-1 text-sm"></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Category Selector -->
        <div>
           <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
           <select [(ngModel)]="category" class="w-full rounded-lg border-slate-200 p-3 bg-white dark:bg-slate-800">
             <ng-container *ngFor="let cat of categoryService.categories()">
               <option [value]="cat.id">{{ cat.name }}</option>
             </ng-container>
             <!-- Fallback if empty and no DB connection yet -->
             <option *ngIf="categoryService.categories().length === 0" value="general">General</option>
           </select>
        </div>

        <div class="flex justify-end gap-3 pt-4">
           <button (click)="cancel()" class="px-6 py-2.5 rounded-lg font-medium text-slate-500 hover:bg-slate-100 transition-colors">
             Cancel
           </button>
           <button 
             (click)="save()"
             [disabled]="!url || loading()"
             class="px-6 py-2.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
           >
             {{ loading() ? 'Saving...' : 'Save Link' }}
           </button>
        </div>
      </div>
    </div>
  `
})
export class AddLinkComponent {
  url = '';
  category = 'general';
  
  fetchedData = signal<{title: string, description?: string, imageUrl?: string} | null>(null);
  loadingMetadata = signal(false);
  loading = signal(false);

  private linkService = inject(LinkService);
  private metadataService = inject(MetadataService);
  categoryService = inject(CategoryService); // Public for template access
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParams.subscribe(params => {
      const { title, text, url } = params;
      const possibleUrl = url || text;
      
      if (possibleUrl && (possibleUrl.startsWith('http') || possibleUrl.startsWith('www'))) {
        this.url = possibleUrl;
        this.onUrlChange();
        if (title && !this.fetchedData()) {
          this.fetchedData.set({ title, description: text });
          this.fetchMetadata();
        } else {
             this.fetchMetadata();
        }
      }
    });
  }


  async onUrlChange() {
    if (this.url && this.url.length > 5 && !this.fetchedData()) {
       // Optional: Auto fetch on paste? simpler to let user click fetch for now or debounce.
    }
  }

  async fetchMetadata() {
    if (!this.url) return;
    this.loadingMetadata.set(true);
    try {
      const data = await this.metadataService.extractMetadata(this.url);
      this.fetchedData.set(data);
    } finally {
      this.loadingMetadata.set(false);
    }
  }

  async save() {
    if (!this.url) return;
    this.loading.set(true);
    
    // Ensure metadata if not fetched
    if (!this.fetchedData()) {
      await this.fetchMetadata();
    }

    const data = this.fetchedData()!;
    const platform = this.metadataService.detectPlatform(this.url);

    try {
      await this.linkService.addLink({
        url: this.url,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        categoryId: this.category,
        platform: platform,
        fav: false,
        tags: []
      });
      this.router.navigate(['/']);
    } catch (e) {
      alert('Error saving link');
    } finally {
      this.loading.set(false);
    }
  }
  
  cancel() {
    this.router.navigate(['/']);
  }
}
