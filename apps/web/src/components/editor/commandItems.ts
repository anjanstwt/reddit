import type { Editor, Range } from '@tiptap/core';
import {
  Bold,
  Code,
  Film,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  type LucideIcon,
  Minus,
  SquareCode,
  Strikethrough,
  Superscript,
  Table,
  TextQuote,
  Underline,
} from 'lucide-react';

import { SpoilerIcon } from '@/components/editor/icons';
import { pickMedia } from '@/components/editor/media';

export interface SlashCommandItem {
  title: string;
  icon: LucideIcon;
  command: (props: { editor: Editor; range: Range }) => void;
}

export interface SlashCommandGroup {
  title: string;
  icon: LucideIcon;
  items: SlashCommandItem[];
}

export interface SlashCommandTableInsert {
  title: string;
  icon: LucideIcon;
  insertTable: (props: { editor: Editor; range: Range; rows: number; cols: number }) => void;
}

export type SlashCommandEntry = SlashCommandItem | SlashCommandGroup | SlashCommandTableInsert;
export type SlashCommandSelection = SlashCommandEntry & { size?: { rows: number; cols: number } };

export function isSlashCommandGroup(entry: SlashCommandEntry): entry is SlashCommandGroup {
  return 'items' in entry;
}

export function isSlashCommandTableInsert(entry: SlashCommandEntry): entry is SlashCommandTableInsert {
  return 'insertTable' in entry;
}

export const MARK_ITEMS = [
  { name: 'bold', icon: Bold, label: 'Bold' },
  { name: 'italic', icon: Italic, label: 'Italic' },
  { name: 'underline', icon: Underline, label: 'Underline' },
  { name: 'strike', icon: Strikethrough, label: 'Strikethrough' },
  { name: 'superscript', icon: Superscript, label: 'Superscript' },
  { name: 'code', icon: Code, label: 'Inline code' },
  { name: 'spoiler', icon: SpoilerIcon, label: 'Spoiler' },
] as const;

export const HEADING_ITEMS: SlashCommandItem[] = [
  {
    title: 'Heading 1',
    icon: Heading1,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    icon: Heading2,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    icon: Heading3,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run(),
  },
];

export const LIST_ITEMS: SlashCommandItem[] = [
  {
    title: 'Bulleted list',
    icon: List,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered list',
    icon: ListOrdered,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
];

const TABLE_ENTRY: SlashCommandTableInsert = {
  title: 'Table',
  icon: Table,
  insertTable: ({ editor, range, rows, cols }) =>
    editor.chain().focus().deleteRange(range).insertTable({ rows, cols, withHeaderRow: true }).run(),
};

const BLOCK_ITEMS: SlashCommandItem[] = [
  {
    title: 'Image',
    icon: ImageIcon,
    command: ({ editor, range }) => pickMedia(editor, 'image', range),
  },
  {
    title: 'Video',
    icon: Film,
    command: ({ editor, range }) => pickMedia(editor, 'video', range),
  },
  {
    title: 'Link',
    icon: Link2,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).openLinkPrompt().run(),
  },
  {
    title: 'Code block',
    icon: SquareCode,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: 'Blockquote',
    icon: TextQuote,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Spoiler',
    icon: SpoilerIcon,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleMark('spoiler').run(),
  },
  {
    title: 'Divider',
    icon: Minus,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

export const SLASH_COMMAND_ENTRIES: SlashCommandEntry[] = [
  { title: 'Headings', icon: Heading, items: HEADING_ITEMS },
  { title: 'Lists', icon: List, items: LIST_ITEMS },
  TABLE_ENTRY,
  ...BLOCK_ITEMS,
];

export const SLASH_COMMAND_ITEMS: SlashCommandEntry[] = [...HEADING_ITEMS, ...LIST_ITEMS, TABLE_ENTRY, ...BLOCK_ITEMS];
