import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { LinkService } from '../../services/link.service';
import { LinkCardComponent } from '../../shared/components/link-card/link-card.component';
import { RouterLink, Router } from '@angular/router';
import { Link } from '../../models/data.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LinkCardComponent, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  linkService = inject(LinkService);
  categoryService = inject(CategoryService);

  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  selectedPlatform = signal<string | null>(null);
  showPlatformFilter = signal(false);

  platforms = ['youtube', 'instagram', 'twitter', 'tiktok', 'facebook'];

  filteredLinks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    const platform = this.selectedPlatform();
    let links = this.linkService.links();

    // 1. Filter by Category Chip
    if (category) {
      links = links.filter(link =>
        link.categoryId === category ||
        link.tags?.includes(category)
      );
    }

    // 2. Filter by Platform
    if (platform) {
      links = links.filter(link => link.platform === platform);
    }

    // 3. Filter by Search Term
    if (term) {
      links = links.filter(link =>
        link.title.toLowerCase().includes(term) ||
        link.description?.toLowerCase().includes(term) ||
        link.categoryId?.toLowerCase().includes(term)
      );
    }

    return links;
  });

  private router = inject(Router);

  toggleCategory(categoryId: string) {
    if (this.selectedCategory() === categoryId) {
      this.selectedCategory.set(null); // Deselect
    } else {
      this.selectedCategory.set(categoryId);
    }
  }

  togglePlatform(platform: string) {
    if (this.selectedPlatform() === platform) {
      this.selectedPlatform.set(null);
    } else {
      this.selectedPlatform.set(platform);
    }
  }

  editLink(link: Link) {
    this.router.navigate(['/edit', link.id]);
  }

  deleteLink(id: string) {
    if (confirm('Are you sure you want to delete this link?')) {
      this.linkService.deleteLink(id);
    }
  }
}
