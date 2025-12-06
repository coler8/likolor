import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Link } from '../../../models/data.models';

@Component({
  selector: 'app-link-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 hover:-translate-y-1">
      
      <!-- Image/Thumbnail -->
      <div class="h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
        <img *ngIf="link.imageUrl; else placeholder" [src]="link.imageUrl" 
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Thumbnail">
        <ng-template #placeholder>
           <div class="w-full h-full flex items-center justify-center text-slate-400">
             <span class="text-4xl">🔗</span>
           </div>
        </ng-template>
        
        <!-- Platform Badge -->
        <div class="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-xs font-medium text-white capitalize">
          {{ link.platform }}
        </div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
            <a [href]="link.url" target="_blank" class="focus:outline-none">
              <span aria-hidden="true" class="absolute inset-0"></span>
              {{ link.title }}
            </a>
          </h3>
        </div>
        
        <p *ngIf="link.description" class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {{ link.description }}
        </p>

        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>{{ link.createdAt | date:'mediumDate' }}</span>
          
          <div class="flex gap-2 relative z-10">
            <button (click)="onDelete.emit(link.id); $event.stopPropagation()" 
                    class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-red-400 hover:text-red-500 transition-colors"
                    title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
             <button (click)="onEdit.emit(link); $event.stopPropagation()" 
                    class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-blue-500 transition-colors"
                    title="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LinkCardComponent {
  @Input({ required: true }) link!: Link;
  @Output() onDelete = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<Link>();
}
