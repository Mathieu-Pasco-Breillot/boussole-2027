import { useEffect, useRef, useState } from 'react';
import type { Classe } from '../../core/score/index.ts';
import { dessinerCarte, donneesCarte, partagerCarte } from '../carte.ts';
import type { ModeJeu } from '../jeu.ts';
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';

interface Props {
  mode: ModeJeu;
  graine: number;
  classement: readonly Classe[];
  nom: (id: string) => string;
}

export function CartePartage({ mode, graine, classement, nom }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (ref.current) dessinerCarte(ref.current, donneesCarte(mode, graine, classement, nom));
  }, [mode, graine, classement, nom]);

  if (classement.length === 0) return null;

  return (
    <Carte as="section" className="p-5" aria-labelledby="titre-carte">
      <h2 id="titre-carte" className="titre-carte">
        Carte à partager
      </h2>
      <p className="mt-1 text-sm text-discret">
        L'image est dessinée sur votre téléphone ; rien n'est envoyé. Elle montre le podium et la fiabilité, jamais vos réponses.
      </p>
      <canvas ref={ref} className="mt-3 w-full rounded-md border border-trait" role="img" aria-label="Aperçu de la carte de résultat" />
      <Bouton
        pleine
        className="mt-3"
        onClick={async () => {
          if (!ref.current) return;
          const r = await partagerCarte(ref.current);
          setMessage(r === 'telecharge' ? 'Image téléchargée sur votre appareil.' : r === 'partage' ? 'Partage ouvert.' : "Impossible de créer l'image.");
        }}
      >
        Partager ou télécharger l'image
      </Bouton>
      <p className="mt-2 text-sm text-discret" role="status">
        {message}
      </p>
    </Carte>
  );
}
