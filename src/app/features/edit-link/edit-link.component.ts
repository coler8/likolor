import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LinkService } from '../../services/link.service';
import { CategoryService } from '../../services/category.service';
import { MetadataService } from '../../services/metadata.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Link } from '../../models/data.models';

@Component({
    selector: 'app-edit-link',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../add-link/add-link.component.html' // Reusing the same template
})
export class EditLinkComponent implements OnInit {
    isEdit = true;
    id: string | null = null;
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
    categoryService = inject(CategoryService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    async ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            const link = await this.linkService.getLinkById(this.id);
            if (link) {
                this.url = link.url;
                this.category = link.categoryId || 'general';
                this.fetchedData.set({
                    title: link.title,
                    description: link.description,
                    imageUrl: link.imageUrl
                });
            } else {
                this.router.navigate(['/']);
            }
        }
    }

    async onUrlChange() {
        // In edit mode we maybe don't want to auto-fetch metadata unless requested
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
        if (!this.id || !this.url) return;
        this.loading.set(true);

        const data = this.fetchedData()!;
        const platform = this.metadataService.detectPlatform(this.url);

        try {
            await this.linkService.updateLink(this.id, {
                url: this.url,
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                categoryId: this.category,
                platform: platform
            });
            this.router.navigate(['/']);
        } catch (e) {
            alert('Error updating link');
        } finally {
            this.loading.set(false);
        }
    }

    async createNewCategory() {
        if (!this.newCategoryName.trim()) return;

        this.creatingCategory.set(true);
        try {
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
