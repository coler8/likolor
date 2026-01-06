import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Link } from '../../../models/data.models';

@Component({
  selector: 'app-link-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './link-card.component.html'
})
export class LinkCardComponent {
  @Input({ required: true }) link!: Link;
  @Output() onDelete = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<Link>();

  get platformClasses(): string {
    const base = 'border-2 ';
    switch (this.link.platform) {
      case 'youtube':
        return base + 'bg-red-500/5 border-red-500/20 hover:border-red-500/40';
      case 'instagram':
        return base + 'bg-pink-500/5 border-pink-500/20 hover:border-pink-500/40';
      case 'twitter':
        return base + 'bg-blue-400/5 border-blue-400/20 hover:border-blue-400/40';
      case 'tiktok':
        return base + 'bg-emerald-400/5 border-emerald-400/20 hover:border-emerald-400/40';
      case 'facebook':
        return base + 'bg-blue-700/5 border-blue-700/20 hover:border-blue-700/40';
      default:
        return base + 'bg-md-sys-dark-surface-container border-md-sys-dark-outline-variant/20 hover:border-md-sys-dark-primary/30';
    }
  }

  get platformBadgeClasses(): string {
    switch (this.link.platform) {
      case 'youtube': return 'bg-red-600 text-white';
      case 'instagram': return 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white';
      case 'twitter': return 'bg-sky-500 text-white';
      case 'tiktok': return 'bg-black text-white border border-white/20';
      case 'facebook': return 'bg-blue-600 text-white';
      default: return 'bg-md-sys-dark-surface-container-high text-md-sys-dark-outline';
    }
  }
}
