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
  templateUrl: './add-link.component.html'
})
export class AddLinkComponent {
  isEdit = false;
  url = '';
  category = 'general';

  fetchedData = signal<{ title: string, description?: string, imageUrl?: string } | null>(null);
  loadingMetadata = signal(false);
  loading = signal(false);

  // Category creation state
  isCreatingCategory = signal(false);
  newCategoryName = '';
  creatingCategory = signal(false);

  private linkService = inject(LinkService);
  private metadataService = inject(MetadataService);
  categoryService = inject(CategoryService); // Public for template access
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParams.subscribe(params => {
      const { title, text, url } = params;

      let finalUrl = url;

      // If no direct URL but text exists, try to extract URL from text
      if (!finalUrl && text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        if (matches && matches.length > 0) {
          finalUrl = matches[0];
        } else {
          // Fallback: assume the whole text might be a URL if it looks like one
          if (text.startsWith('http') || text.startsWith('www')) {
            finalUrl = text;
          }
        }
      }

      if (finalUrl) {
        this.url = finalUrl;
        this.onUrlChange();

        // Use provided title or fallback to metadata fetch
        if (title && !this.fetchedData()) {
          this.fetchedData.set({ title, description: text?.replace(finalUrl, '').trim() });
          // Still fetch metadata to get image/better description
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

  async createNewCategory() {
    if (!this.newCategoryName.trim()) return;

    this.creatingCategory.set(true);
    try {
      // Default to a random color or fixed one for now
      const newId = await this.categoryService.addCategory(this.newCategoryName, 'bg-indigo-500');
      this.category = newId;
      this.isCreatingCategory.set(false);
      this.newCategoryName = '';
    } catch (error) {
      console.error('Failed to create category', error);
    } finally {
      this.creatingCategory.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
