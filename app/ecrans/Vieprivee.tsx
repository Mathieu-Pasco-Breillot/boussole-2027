import { Texte } from '../glossaire/Texte.tsx';
import { Bouton } from '../ui/Bouton.tsx';
import { Carte } from '../ui/Carte.tsx';
import { EntetePage } from '../ui/EntetePage.tsx';

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
    <main className="page page-etroite texte-page">
      <EntetePage titre="Vie privée" onRetour={onRetour} />

      <Carte as="section" className="p-6">
        <h2 className="titre-carte">Ce qui reste sur votre téléphone</h2>
        <p className="mt-2">
          Vos réponses, la partie en cours, votre dernier résultat, vos badges (de simples compteurs d'usage, sans nom de candidat ni réponse), votre réglage du son et la liste des questions déjà vues (pour ne pas vous les
          reposer) sont enregistrés dans le stockage de votre navigateur, sur votre appareil seulement. Le calcul des résultats
          se fait entièrement sur votre téléphone. Aucune réponse n'est envoyée, et aucune mesure d'audience, aucun traceur,
          aucun script ou police externe n'est utilisé.
        </p>
      </Carte>

      <Carte as="section" className="p-6">
        <h2 className="titre-carte">Ce que voit l'hébergeur</h2>
        <p className="mt-2">
          <Texte>{HEBERGEUR}</Texte>
        </p>
      </Carte>

      <Carte as="section" className="p-6">
        <h2 className="titre-carte">Partage</h2>
        <p className="mt-2">
          Il n'existe pas de lien de partage, car un lien porterait vos réponses. La carte de résultat est une image créée sur
          votre téléphone ; vous l'envoyez vous-même si vous le souhaitez.
        </p>
      </Carte>

      <Carte as="section" douce className="p-6">
        <h2 className="titre-carte">Tout effacer</h2>
        <p className="mt-2">Ce bouton supprime de cet appareil la partie, le résultat, l'historique des questions vues, les badges et votre réglage du son.</p>
        <Bouton variante="secondaire" onClick={onToutEffacer} className="mt-4">
          Tout effacer sur cet appareil
        </Bouton>
      </Carte>
    </main>
  );
}
