import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Link } from '../../../models/data.models';

@Component({
    selector: 'app-video-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-modal.component.html'
})
export class VideoModalComponent {
    @Input({ required: true }) link!: Link;
    @Output() onClose = new EventEmitter<void>();

    private sanitizer = inject(DomSanitizer);

    get videoUrl(): SafeResourceUrl | null {
        if (this.link.platform === 'youtube') {
            const videoId = this.getYoutubeId(this.link.url);
            if (videoId) {
                return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
            }
        }
        return null;
    }

    private getYoutubeId(url: string): string | null {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
}
