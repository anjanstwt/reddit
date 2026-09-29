import type { TiptapNode } from '@/lib/server/types';

export function plainText(doc: TiptapNode | null, max = 300) {
  if (!doc) return '';

  const parts: string[] = [];
  const walk = (node: TiptapNode) => {
    if (node.text) parts.push(node.text);
    if (node.type === 'mention' && typeof node.attrs?.label === 'string') {
      parts.push(`${node.attrs.kind === 'community' ? 'r/' : 'u/'}${node.attrs.label}`);
    }
    node.content?.forEach(walk);
    if (node.type === 'paragraph' || node.type === 'heading') parts.push(' ');
  };
  walk(doc);

  const text = parts.join('').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function firstMediaId(doc: TiptapNode | null): string | undefined {
  if (!doc) return undefined;
  if ((doc.type === 'image' || doc.type === 'video') && typeof doc.attrs?.mediaId === 'string') {
    return doc.attrs.mediaId;
  }
  for (const child of doc.content ?? []) {
    const id = firstMediaId(child);
    if (id) return id;
  }
  return undefined;
}

export function textToDoc(text: string): TiptapNode | undefined {
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return undefined;

  return {
    type: 'doc',
    content: paragraphs.map((block) => ({
      type: 'paragraph',
      content: block.split('\n').flatMap((line, i): TiptapNode[] => {
        const text: TiptapNode = { type: 'text', text: line };
        return i === 0 ? [text] : [{ type: 'hardBreak' }, text];
      }),
    })),
  };
}

export function isSafeHref(href: unknown): href is string {
  return typeof href === 'string' && /^(https?:|mailto:)/i.test(href.trim());
}

export function toStoredDoc(node: TiptapNode): TiptapNode {
  const isMedia = node.type === 'image' || node.type === 'video';
  return {
    ...node,
    ...(isMedia && { attrs: { mediaId: node.attrs?.mediaId } }),
    ...(node.content && { content: node.content.map(toStoredDoc) }),
  };
}
