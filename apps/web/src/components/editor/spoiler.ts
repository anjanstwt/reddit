import { Mark, mergeAttributes } from '@tiptap/core';

export const Spoiler = Mark.create({
  name: 'spoiler',

  parseHTML() {
    return [{ tag: 'span[data-spoiler]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-spoiler': '', class: 'spoiler' }), 0];
  },
});
