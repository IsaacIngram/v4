import { XMLParser } from 'fast-xml-parser';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  tags: string[];
  externalUrl: string;
  coverImageUrl?: string;
}

function slugFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\/$/, '');
    return path.split('/').pop() || url.replace(/[^a-z0-9]/gi, '-');
  } catch {
    return url.replace(/[^a-z0-9]/gi, '-');
  }
}

function parseRss(data: string): BlogPost[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const result = parser.parse(data);
  const items: any[] = result?.rss?.channel?.item ?? result?.feed?.entry ?? [];
  return (Array.isArray(items) ? items : [items]).map((item: any) => {
    const link: string = item.link?.['@_href'] ?? item.link ?? item.guid ?? '';
    const description: string =
      item.description ?? item.summary ?? item['content:encoded'] ?? '';
    const strippedDescription = description.replace(/<[^>]+>/g, '').slice(0, 280);
    const categories: string[] = Array.isArray(item.category)
      ? item.category
      : item.category
        ? [item.category]
        : [];
    return {
      slug: slugFromUrl(link),
      title: item.title ?? 'Untitled',
      description: strippedDescription,
      publishDate: item.pubDate ?? item.published ?? item.updated ?? '',
      tags: categories.map((c: any) => (typeof c === 'string' ? c : c['#text'] ?? '')).filter(Boolean),
      externalUrl: link,
      coverImageUrl: item['media:content']?.['@_url'] ?? item['enclosure']?.['@_url'] ?? undefined,
    };
  });
}

function parseJsonFeed(data: string): BlogPost[] {
  const feed = JSON.parse(data);
  return (feed.items ?? []).map((item: any) => ({
    slug: slugFromUrl(item.url ?? item.id ?? ''),
    title: item.title ?? 'Untitled',
    description: (item.summary ?? item.content_text ?? '').slice(0, 280),
    publishDate: item.date_published ?? item.date_modified ?? '',
    tags: item.tags ?? [],
    externalUrl: item.url ?? item.id ?? '',
    coverImageUrl: item.image ?? item.banner_image ?? undefined,
  }));
}

export async function fetchBlogFeed(url: string): Promise<BlogPost[]> {
  if (!url) return [];
  const res = await fetch(url);
  const contentType = res.headers.get('content-type') ?? '';
  const text = await res.text();

  if (contentType.includes('json') || text.trimStart().startsWith('{')) {
    return parseJsonFeed(text);
  }
  return parseRss(text);
}
