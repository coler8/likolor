import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Link } from '../../../models/data.models';
import { CategoryService } from '../../../services/category.service';
import { MetadataService } from '../../../services/metadata.service';
import { LinkService } from '../../../services/link.service';

@Component({
  selector: 'app-link-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './link-card.component.html'
})
export class LinkCardComponent {
  @Input({ required: true }) link!: Link;
  @Output() onDelete = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<Link>();
  @Output() onPlay = new EventEmitter<Link>();

  defaultImage = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=500&auto=format&fit=crop';

  metadataService = inject(MetadataService);
  linkService = inject(LinkService);
  categoryService = inject(CategoryService);

  async handleImageError(event: any) {
    const url = this.link.url;

    // Si ya lo intentamos reparar una vez en esta sesión, mostramos la imagen por defecto
    if (!this.metadataService.canRepair(url)) {
      event.target.src = this.defaultImage;
      return;
    }

    // Marcamos como intentado de inmediato para evitar reentradas si el fetch tarda
    this.metadataService.markAsRepaired(url);

    try {
      console.log('Intentando reparar imagen caducada para:', url);
      const newData = await this.metadataService.extractMetadata(url);

      if (newData.imageUrl && newData.imageUrl !== this.link.imageUrl) {
        // Actualizamos localmente para mostrar la imagen correcta de inmediato
        this.link.imageUrl = newData.imageUrl;
        event.target.src = newData.imageUrl;

        // Intentamos guardar en Firestore para que la próxima vez cargue bien desde el inicio
        if (this.link.id) {
          await this.linkService.updateLink(this.link.id, {
            imageUrl: newData.imageUrl
          });
          console.log('¡Imagen reparada y actualizada en la nube!');
        }
        return;
      }
    } catch (e) {
      console.warn('Fallo el intento de reparación automática:', e);
    }

    // Si falló la reparación o no hay cambios (o el nuevo imageUrl también falla), imagen por defecto
    event.target.src = this.defaultImage;
  }

  get categoryName(): string {
    const categories = this.categoryService.categories();
    const cat = categories.find((c: any) => c.id === this.link.categoryId);
    return cat ? cat.name : 'General';
  }

  get isPlayable(): boolean {
    return this.link.platform === 'youtube';
  }

  get platformClasses(): string {
    const base = 'border-2 ';
    switch (this.link.platform) {
      case 'youtube':
        return base + 'bg-red-500/10 border-red-500/20 hover:border-red-500/40';
      case 'instagram':
        return base + 'bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40';
      case 'twitter':
        return base + 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40';
      case 'tiktok':
        return base + 'bg-green-400/15 border-green-400/30 hover:border-green-400/50';
      case 'facebook':
        return base + 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40';
      default:
        return base + 'border-md-sys-dark-outline-variant/20 hover:border-md-sys-dark-primary/30 shadow-lg';
    }
  }

  get platformBadgeClasses(): string {
    switch (this.link.platform) {
      case 'youtube': return 'bg-red-600 text-white';
      case 'instagram': return 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white';
      case 'twitter': return 'bg-sky-500 text-white';
      case 'tiktok': return 'bg-black text-white border border-white/20';
      case 'facebook': return 'bg-blue-500 text-white';
      default: return 'bg-md-sys-dark-surface-container-high text-md-sys-dark-outline';
    }
  }
}
