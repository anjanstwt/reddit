import Image from 'next/image';
import Link from 'next/link';

import type { MediaInfo, TiptapNode } from '@/lib/server/types';
import { isSafeHref } from '@/lib/tiptap';
import { cn } from '@/lib/utils';

type Media = Record<string, MediaInfo> | undefined;

interface TiptapContentProps {
  doc: TiptapNode | null;
  media?: Media;
  className?: string;
}

export default function TiptapContent({ doc, media, className }: TiptapContentProps) {
  if (!doc?.content?.length) return null;

  return (
    <div className={cn('flex flex-col gap-3 text-[15px] leading-relaxed text-neutral-200', className)}>
      <Nodes nodes={doc.content} media={media} />
    </div>
  );
}

function Nodes({ nodes, media }: { nodes?: TiptapNode[]; media: Media }) {
  return nodes?.map((node, i) => <Node key={i} node={node} media={media} />);
}

const headings = ['h2', 'h3', 'h4'] as const;

function Node({ node, media }: { node: TiptapNode; media: Media }) {
  const children = <Nodes nodes={node.content} media={media} />;

  switch (node.type) {
    case 'text':
      return <Text node={node} />;
    case 'paragraph':
      return <p>{children}</p>;
    case 'heading': {
      const Tag = headings[Math.min(Math.max(Number(node.attrs?.level) || 1, 1), 3) - 1];
      return <Tag className="text-lg font-semibold">{children}</Tag>;
    }
    case 'bulletList':
      return <ul className="list-disc pl-6">{children}</ul>;
    case 'orderedList':
      return <ol className="list-decimal pl-6">{children}</ol>;
    case 'listItem':
      return <li>{children}</li>;
    case 'blockquote':
      return <blockquote className="border-l-2 border-white/20 pl-4 text-neutral-400">{children}</blockquote>;
    case 'codeBlock':
      return (
        <pre className="overflow-x-auto rounded-xl bg-blade p-4 text-sm">
          <code>{children}</code>
        </pre>
      );
    case 'hardBreak':
      return <br />;
    case 'horizontalRule':
      return <hr className="border-white/10" />;
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    case 'tableRow':
      return <tr>{children}</tr>;
    case 'tableHeader':
      return <th className="border border-white/10 px-3 py-2 text-left font-semibold">{children}</th>;
    case 'tableCell':
      return <td className="border border-white/10 px-3 py-2">{children}</td>;
    case 'mention':
      return <Mention node={node} />;
    case 'image':
    case 'video':
      return <MediaNode node={node} media={media} />;
    default:
      return children;
  }
}

function Text({ node }: { node: TiptapNode }) {
  let content: React.ReactNode = node.text;

  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case 'bold':
        content = <strong>{content}</strong>;
        break;
      case 'italic':
        content = <em>{content}</em>;
        break;
      case 'underline':
        content = <u>{content}</u>;
        break;
      case 'strike':
        content = <s>{content}</s>;
        break;
      case 'superscript':
        content = <sup>{content}</sup>;
        break;
      case 'code':
        content = <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em]">{content}</code>;
        break;
      case 'spoiler':
        content = <span className="rounded bg-neutral-400 text-transparent transition-colors hover:bg-transparent hover:text-inherit">{content}</span>;
        break;
      case 'link':
        if (isSafeHref(mark.attrs?.href)) {
          content = (
            <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer nofollow" className="text-sky-400 hover:underline">
              {content}
            </a>
          );
        }
        break;
    }
  }
  return content;
}

function Mention({ node }: { node: TiptapNode }) {
  const label = typeof node.attrs?.label === 'string' ? node.attrs.label : '';
  if (!label) return null;

  const community = node.attrs?.kind === 'community';
  return (
    <Link href={community ? `/r/${label}` : `/u/${label}`} className="font-medium text-sky-400 hover:underline">
      {community ? 'r/' : 'u/'}
      {label}
    </Link>
  );
}

function MediaNode({ node, media }: { node: TiptapNode; media: Media }) {
  const info = typeof node.attrs?.mediaId === 'string' ? media?.[node.attrs.mediaId] : undefined;
  if (!info) return null;

  if (info.kind === 'video') {
    return <video src={info.url} controls preload="metadata" className="w-full rounded-2xl border border-white/10 bg-blade" />;
  }
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-blade">
      <Image src={info.url} alt="" fill sizes="(max-width: 1024px) 100vw, 740px" className="object-contain" />
    </div>
  );
}
