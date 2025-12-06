import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkService } from '../../services/link.service';
import { LinkCardComponent } from '../../shared/components/link-card/link-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LinkCardComponent, RouterLink],
  template: `
    <div class="px-4 py-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Link Keeper
          </h1>
          <p class="text-slate-500 dark:text-slate-400">Manage your digital collection</p>
        </div>
        
        <a routerLink="/add" class="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span class="hidden sm:inline">Add Link</span>
        </a>
      </div>

      <!-- Filters (Placeholder for now) -->
      <div class="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button class="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-medium text-sm whitespace-nowrap">All</button>
        <button class="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-colors whitespace-nowrap">Favorites</button>
        <button class="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-colors whitespace-nowrap">Videos</button>
        <button class="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-colors whitespace-nowrap">Articles</button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @if (linkService.loading()) {
          <div class="col-span-full flex justify-center py-20">
            <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        } @else if (linkService.links().length === 0) {
          <div class="col-span-full text-center py-20 text-slate-400">
            <p class="text-lg">No links saved yet.</p>
            <p class="text-sm">Click "Add Link" to get started.</p>
          </div>
        } @else {
          @for (link of linkService.links(); track link.id) {
             <app-link-card 
               [link]="link"
               (onDelete)="deleteLink($event)"
               class="animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
               [style.animation-delay]="($index * 50) + 'ms'"
             ></app-link-card>
          }
        }
      </div>
    </div>
  `
})
export class DashboardComponent {
  linkService = inject(LinkService);

  deleteLink(id: string) {
    if(confirm('Are you sure you want to delete this link?')) {
      this.linkService.deleteLink(id);
    }
  }
}
