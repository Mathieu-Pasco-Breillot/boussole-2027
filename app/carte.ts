/**
 * Carte de résultat à partager (spécification J7) : image dessinée sur le téléphone, dans un canvas.
 * Rien n'est envoyé au serveur ; la fiabilité figure toujours ; une seule couleur neutre, aucune couleur de parti.
 *
 * Couleurs : la palette claire du site (jetons de app/index.css). Elle est vue par d'autres personnes que
 * l'expéditeur, hors de l'application : une seule apparence, identique pour tous. Un canvas ne lit pas les variables
 * CSS, d'où les valeurs recopiées ci-dessous ; le fond plein se lit aussi bien sur une messagerie en mode clair qu'en
 * mode sombre. Seul le drapeau en bandeau porte les couleurs de la France : aucune couleur n'est liée à un parti.
 */
import type { Classe } from '../core/score/index.ts';
import { FIABILITE, MODES } from './libelles.ts';
import type { ModeJeu } from './jeu.ts';

export const LARGEUR_CARTE = 1080;
export const HAUTEUR_CARTE = 1350;
const ADRESSE = 'mon-isoloir.up.railway.app';

/** Jetons de app/index.css (--color-*), sans lien avec un parti. */
const COULEURS = {
  fond: '#f7f8fb',
  carte: '#fffefa',
  trait: '#e1e5ed',
  encre: '#202a37',
  marine: '#1e3152',
  discret: '#5b6577',
  accent: '#244889',
  bleu: '#183b82',
  blanc: '#ffffff',
  rouge: '#e24b50',
} as const;

export interface DonneesCarte {
  mode: ModeJeu;
  graine: number;
  /** Les trois premiers du classement au plus, avec leur nom complet. */
  podium: { rang: number; exAequo: boolean; nom: string; score: number; fiabilite: string }[];
}

export function donneesCarte(mode: ModeJeu, graine: number, classement: readonly Classe[], nom: (id: string) => string): DonneesCarte {
  return {
    mode,
    graine,
    podium: classement.slice(0, 3).map((c) => ({
      rang: c.rang,
      exAequo: c.exAequo,
      nom: nom(c.candidatId),
      score: c.score.scoreArrondi ?? 0,
      fiabilite: FIABILITE[c.fiabilite] ?? c.fiabilite,
    })),
  };
}

function lignes(ctx: CanvasRenderingContext2D, texte: string, largeur: number): string[] {
  const mots = texte.split(' ');
  const sortie: string[] = [];
  let courante = '';
  for (const m of mots) {
    const essai = courante ? `${courante} ${m}` : m;
    if (ctx.measureText(essai).width > largeur && courante) {
      sortie.push(courante);
      courante = m;
    } else courante = essai;
  }
  if (courante) sortie.push(courante);
  return sortie;
}

export function dessinerCarte(canvas: HTMLCanvasElement, d: DonneesCarte): void {
  canvas.width = LARGEUR_CARTE;
  canvas.height = HAUTEUR_CARTE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const titre = "'Bricolage Grotesque Variable', 'Trebuchet MS', sans-serif";
  const sans = "'Figtree Variable', system-ui, sans-serif";
  ctx.fillStyle = COULEURS.fond;
  ctx.fillRect(0, 0, LARGEUR_CARTE, HAUTEUR_CARTE);
  // Bandeau tricolore du haut, comme sur le site.
  const tiers = LARGEUR_CARTE / 3;
  [COULEURS.bleu, COULEURS.blanc, COULEURS.rouge].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * tiers, 0, tiers, 18);
  });

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COULEURS.accent;
  ctx.font = `700 34px ${sans}`;
  ctx.fillText('PRÉSIDENTIELLE 2027', 80, 120);
  ctx.fillStyle = COULEURS.marine;
  ctx.font = `700 96px ${titre}`;
  ctx.fillText('Mon Isoloir', 80, 230);
  ctx.fillStyle = COULEURS.discret;
  ctx.font = `400 38px ${sans}`;
  ctx.fillText(`Mode ${MODES[d.mode].nom} · ${MODES[d.mode].questions} questions`, 80, 295);

  let y = 400;
  for (const l of d.podium) {
    ctx.fillStyle = COULEURS.carte;
    ctx.fillRect(80, y - 70, LARGEUR_CARTE - 160, 170);
    ctx.strokeStyle = COULEURS.trait;
    ctx.lineWidth = 2;
    ctx.strokeRect(81, y - 69, LARGEUR_CARTE - 162, 168);
    ctx.fillStyle = COULEURS.accent;
    ctx.font = `700 80px ${titre}`;
    ctx.fillText(String(l.rang), 115, y + 35);
    ctx.fillStyle = COULEURS.marine;
    ctx.font = `700 50px ${titre}`;
    ctx.fillText(l.nom, 200, y + 15);
    ctx.fillStyle = COULEURS.discret;
    ctx.font = `400 34px ${sans}`;
    ctx.fillText(`${l.exAequo ? 'ex aequo · ' : ''}fiabilité ${l.fiabilite.toLowerCase()}`, 200, y + 65);
    ctx.fillStyle = COULEURS.accent;
    ctx.font = `700 70px ${titre}`;
    ctx.textAlign = 'right';
    ctx.fillText(String(d.podium.length ? l.score : ''), LARGEUR_CARTE - 115, y + 35);
    ctx.textAlign = 'left';
    y += 210;
  }

  ctx.fillStyle = COULEURS.discret;
  ctx.font = `400 32px ${sans}`;
  const pied = 'Comparateur indépendant, méthode publique. Un score est un rapprochement avec des positions publiques sourcées, pas une consigne de vote. Les candidats peu codés ne sont pas classés.';
  let yy = 1090;
  for (const l of lignes(ctx, pied, LARGEUR_CARTE - 160)) {
    ctx.fillText(l, 80, yy);
    yy += 44;
  }
  ctx.fillStyle = COULEURS.encre;
  ctx.font = `700 40px ${sans}`;
  ctx.fillText(ADRESSE, 80, 1290);
}

/** Partage par la fonction native si elle accepte les fichiers, sinon téléchargement. Renvoie ce qui a été fait. */
export async function partagerCarte(canvas: HTMLCanvasElement): Promise<'partage' | 'telecharge' | 'echec'> {
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'));
  if (!blob) return 'echec';
  const fichier = new File([blob], 'mon-isoloir.png', { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [fichier] })) {
      await navigator.share({ files: [fichier], title: 'Mon Isoloir' });
      return 'partage';
    }
  } catch {
    /* partage annulé ou refusé : on propose le téléchargement */
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mon-isoloir.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'telecharge';
}
