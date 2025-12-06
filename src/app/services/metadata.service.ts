import { Injectable } from '@angular/core';
import { Platform } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  detectPlatform(url: string): Platform {
    try {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
      if (lowerUrl.includes('instagram.com')) return 'instagram';
      if (lowerUrl.includes('tiktok.com')) return 'tiktok';
      if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
      if (lowerUrl.includes('facebook.com')) return 'facebook';
      return 'generic';
    } catch {
      return 'generic';
    }
  }

  async extractMetadata(url: string): Promise<{ title: string; description?: string; imageUrl?: string }> {
    // In a real app, this would call a Cloud Function to avoid CORS and parse open graph tags.
    // For this client-side demo, we use basic heuristics and defaults.
    
    const platform = this.detectPlatform(url);
    let imageUrl = '';
    let title = 'Saved Link';

    if (platform === 'youtube') {
      const videoId = this.getYoutubeId(url);
      if (videoId) {
        imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        title = `YouTube Video (${videoId})`; 
      }
    }
    
    // Fallback or more complex fetching could go here.
    // Since we can't easily fetch external HTML due to CORS, we return basic info.
    
    return {
      title,
      description: `Saved link from ${platform}`,
      imageUrl
    };
  }

  private getYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
}
