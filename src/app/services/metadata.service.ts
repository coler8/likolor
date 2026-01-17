import { Injectable } from '@angular/core';
import { Platform } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private repairedLinks = new Set<string>();

  canRepair(url: string): boolean {
    return !this.repairedLinks.has(url);
  }

  markAsRepaired(url: string) {
    this.repairedLinks.add(url);
  }

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
    let videoId: string | null = null;
    let ytTitle = '';
    let ytDesc = '';

    if (platform === 'youtube') {
      videoId = this.getYoutubeId(url);
    }

    // 1. YouTube specialized fetch (oEmbed + Proxy Fallback)
    if (platform === 'youtube' && videoId) {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oemData = await oembedRes.json();
          ytTitle = oemData.title;
        }

        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
        const proxyRes = await fetch(proxyUrl);
        if (proxyRes.ok) {
          const proxyData = await proxyRes.json();
          const html = proxyData.contents;
          const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
          if (descMatch) ytDesc = descMatch[1];
        }
      } catch (e) {
        console.warn('YouTube specialized fetch failed');
      }

      if (ytTitle || ytDesc) {
        return {
          title: ytTitle || 'Video de YouTube',
          description: this.truncateDesc(ytDesc || `Video de YouTube`),
          imageUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
      }
    }

    // 2. TikTok specialized fetch (oEmbed + Proxy Fallback)
    if (platform === 'tiktok') {
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oemData = await oembedRes.json();
          return {
            title: oemData.title || 'Video de TikTok',
            description: `Video de ${oemData.author_name} en TikTok`,
            imageUrl: oemData.thumbnail_url
          };
        }
      } catch (e) {
        try {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)}`;
          const proxyRes = await fetch(proxyUrl);
          if (proxyRes.ok) {
            const proxyData = await proxyRes.json();
            const oemData = JSON.parse(proxyData.contents);
            return {
              title: oemData.title || 'Video de TikTok',
              description: `Video de ${oemData.author_name} en TikTok`,
              imageUrl: oemData.thumbnail_url
            };
          }
        } catch (proxyError) {
          console.warn('TikTok specialized fetch failed');
        }
      }
    }

    // 3. Generic Extraction via Microlink with aggressive fallback
    try {
      let targetUrl = url;
      if (platform === 'twitter') {
        targetUrl = url.replace('twitter.com', 'fxtwitter.com').replace('x.com', 'fxtwitter.com');
      }

      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}&video=true`);
      if (response.ok) {
        const { data } = await response.json();
        const bestImage = videoId
          ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          : (data.image?.url || data.logo?.url || '');

        return {
          title: data.title || (platform === 'facebook' ? 'Publicación de Facebook' : 'Enlace guardado'),
          description: this.truncateDesc(data.description || `Enlace guardado desde ${platform}`),
          imageUrl: bestImage
        };
      }

      console.warn(`Microlink failed (${response.status}), falling back to basic scraping`);
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      const proxyRes = await fetch(proxyUrl);
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        const html = proxyData.contents;

        const getMeta = (prop: string) => {
          const regex = new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["'](.*?)["']`, 'i');
          const match = html.match(regex);
          return match ? match[1] : null;
        };

        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = getMeta('og:title') || titleMatch?.[1] || (platform === 'facebook' ? 'Publicación de Facebook' : 'Enlace guardado');
        const description = getMeta('og:description') || getMeta('description');
        const imageUrl = getMeta('og:image') || getMeta('twitter:image');

        return {
          title: title,
          description: this.truncateDesc(description || `Enlace guardado desde ${platform}`),
          imageUrl: imageUrl || ''
        };
      }
    } catch (error) {
      console.warn('Metadata fetch failed:', error);
    }

    // 4. Last Fallback
    return {
      title: platform === 'youtube' ? 'Video de YouTube' : (platform === 'facebook' ? 'Publicación de Facebook' : 'Enlace guardado'),
      description: `Enlace guardado desde ${platform}`,
      imageUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
    };
  }

  private truncateDesc(desc: string): string {
    if (!desc) return '';
    if (desc.length > 120) {
      return desc.substring(0, 117) + '...';
    }
    return desc;
  }

  private getYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
}
