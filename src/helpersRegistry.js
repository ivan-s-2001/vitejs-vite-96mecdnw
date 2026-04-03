import { lazy } from 'react';

const helperModules = import.meta.glob('./helpers/*.jsx', {
  eager: true,
});

export function getHelpers() {
  return Object.entries(helperModules)
    .map(([path, mod]) => {
      const meta = mod.helperMeta || {};
      const Component = mod.default;

      if (!Component) return null;

      const fileName = path.split('/').pop().replace('.jsx', '');

      return {
        id: meta.id || fileName,
        title: meta.title || fileName,
        description: meta.description || 'Внутренний инструмент',
        category: meta.category || meta.group || 'Инструменты',
        order: meta.order || 999,
        Component,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ru'));
}