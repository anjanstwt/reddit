import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

function hint(pos: number) {
  return Decoration.widget(
    pos,
    () => {
      const key = document.createElement('kbd');
      key.textContent = '/';
      const el = document.createElement('span');
      el.className = 'editor-placeholder';
      el.contentEditable = 'false';
      el.append('Type', key, 'for commands');
      return el;
    },
    { side: -1, key: 'editor-placeholder' },
  );
}

export const EditorPlaceholder = Extension.create({
  name: 'editorPlaceholder',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('editorPlaceholder'),
        props: {
          decorations: (state) => {
            const { doc, selection } = state;

            let docIsBlank = true;
            doc.forEach((child) => {
              if (child.type.name !== 'paragraph' || child.content.size !== 0) docIsBlank = false;
            });
            if (docIsBlank) return DecorationSet.create(doc, [hint(1)]);

            const { $from, empty } = selection;
            const inEmptyParagraph =
              empty && $from.depth === 1 && $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0;
            if (!inEmptyParagraph || !editor.isFocused) return null;

            return DecorationSet.create(doc, [hint($from.before(1) + 1)]);
          },
        },
      }),
    ];
  },
});
