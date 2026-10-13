import { Texte } from '../glossaire/Texte.tsx';

interface Props {
  onRetour: () => void;
  onToutEffacer: () => void;
}

const HEBERGEUR =
  "Le site est hébergé chez Railway. Comme tout hébergeur, il voit les requêtes de chargement du site : adresse IP, " +
  "page demandée, type de navigateur. Le serveur du projet n'écrit aucun journal, mais Railway conserve ses propres " +
  "journaux, pour une durée qui dépend de son offre (de 3 à 90 jours selon l'offre). Le service tourne dans un centre " +
  "de données européen (Pays-Bas) ; votre requête peut cependant passer par un point d'entrée du réseau Railway situé " +
  'ailleurs. Vos réponses au quiz, elles, ne transitent jamais par le serveur.';

export function Vieprivee({ onRetour, onToutEffacer }: Props) {
  return (
    <main className="colonne flex max-w-3xl flex-col gap-8 py-8 text-[1.0625rem] leading-relaxed">
      <header>
        <button type="button" onClick={onRetour} className="lien">
          ← Retour
        </button>
        <h1 className="titre-page mt-2">Vie privée</h1>
      </header>

      <section>
        <h2 className="font-titre text-2xl font-bold tracking-tight">Ce qui reste sur votre téléphone</h2>
        <p className="mt-2">
          Vos réponses, la partie en cours, votre dernier résultat, vos badges (de simples compteurs d'usage, sans nom de candidat ni réponse), votre réglage du son et la liste des questions déjà vues (pour ne pas vous les
          reposer) sont enregistrés dans le stockage de votre navigateur, sur votre appareil seulement. Le calcul des résultats
          se fait entièrement sur votre téléphone. Aucune réponse n'est envoyée, et aucune mesure d'audience, aucun traceur,
          aucun script ou police externe n'est utilisé.
        </p>
      </section>

      <section>
        <h2 className="font-titre text-2xl font-bold tracking-tight">Ce que voit l'hébergeur</h2>
        <p className="mt-2">
          <Texte>{HEBERGEUR}</Texte>
        </p>
      </section>

      <section>
        <h2 className="font-titre text-2xl font-bold tracking-tight">Partage</h2>
        <p className="mt-2">
          Il n'existe pas de lien de partage, car un lien porterait vos réponses. La carte de résultat est une image créée sur
          votre téléphone ; vous l'envoyez vous-même si vous le souhaitez.
        </p>
      </section>

      <section>
        <h2 className="font-titre text-2xl font-bold tracking-tight">Tout effacer</h2>
        <p className="mt-2">Ce bouton supprime de cet appareil la partie, le résultat, l'historique des questions vues, les badges et votre réglage du son.</p>
        <button type="button" onClick={onToutEffacer} className="btn btn-secondaire mt-4">
          Tout effacer sur cet appareil
        </button>
      </section>
    </main>
  );
}
