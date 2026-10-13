import type { ReactNode } from 'react';
import { cx } from './cx.ts';
import { IconeBouclier } from './Icones.tsx';

/** Rappel de confiance : bouclier et une phrase (vie privée, neutralité). */
export function NoteConfiance({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx('note-confiance', className)}>
      <IconeBouclier taille={16} />
      <span>{children}</span>
    </p>
  );
}
