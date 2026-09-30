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

export function mediaIds(doc: TiptapNode | null): string[] {
  const ids: string[] = [];
  const walk = (node: TiptapNode) => {
    const id = node.attrs?.mediaId;
    if ((node.type === 'image' || node.type === 'video') && typeof id === 'string' && !ids.includes(id)) ids.push(id);
    node.content?.forEach(walk);
  };
  if (doc) walk(doc);
  return ids;
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
