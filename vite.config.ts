import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { lireEntetesCaddy } from './scripts/lib/entetes-caddy.ts';
import { lireVersions } from './scripts/lib/versions.ts';

export default defineConfig({
  // Versions des données et de l'application (manifeste release-please et CHANGELOG), affichées sur le site.
  define: { __VERSIONS__: JSON.stringify(lireVersions(import.meta.dirname)) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Le script d'enregistrement est un fichier externe : la CSP interdit les scripts inline.
      injectRegister: 'script',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Boussole 2027',
        short_name: 'Boussole',
        description: "Comparateur des positions des candidats à l'élection présidentielle de 2027.",
        lang: 'fr',
        // Fond de page du thème clair (app/index.css, --color-fond) : barre d'état et écran de lancement.
        theme_color: '#f7f8fb',
        background_color: '#f7f8fb',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          // Icône « maskable » : fond plein et boussole réduite dans la zone sûre (80 % central), pour les icônes rognées.
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Polices système (app/index.css) : aucun fichier de police à précacher.
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        // Le bundle principal embarque le paquet de données (plus de 1,6 Mo). Au-delà de cette limite, Workbox
        // exclurait le fichier du précache sans erreur et le site ne marcherait plus hors connexion :
        // e2e/hors-ligne.spec.ts vérifie que tout fichier utile de dist/ est bien précaché.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: '/index.html',
      },
    }),
  ],
  build: { target: 'es2023' },
  // Les tests de bout en bout tournent sur `vite preview` : il sert les mêmes en-têtes que le site en ligne (CSP
  // comprise), lus dans le Caddyfile, pour qu'une violation de la CSP fasse échouer la CI (e2e/csp.spec.ts).
  preview: { headers: lireEntetesCaddy() },
});
