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
    const platform = this.detectPlatform(url);

    // 1. YouTube Optimization
    if (platform === 'youtube') {
      const videoId = this.getYoutubeId(url);
      if (videoId) {
        return {
          title: `YouTube Video`,
          description: `Watch this video on YouTube`,
          imageUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
      }
    }

    // 2. Generic / Other Platforms with Microlink
    try {
      let targetUrl = url;
      if (platform === 'twitter') {
        targetUrl = url.replace('twitter.com', 'fxtwitter.com').replace('x.com', 'fxtwitter.com');
      }

      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&video=true`);
      if (response.ok) {
        const { data } = await response.json();
        const bestImage = data.image?.url || data.logo?.url || data.screenshot?.url;

        return {
          title: data.title || 'Saved Link',
          description: data.description || `Saved link from ${platform}`,
          imageUrl: bestImage || ''
        };
      }
    } catch (error) {
      console.warn('Metadata fetch failed:', error);
    }

    // Fallback
    return {
      title: 'Saved Link',
      description: `Saved link from ${platform}`,
      imageUrl: ''
    };
  }

  private getYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
}
