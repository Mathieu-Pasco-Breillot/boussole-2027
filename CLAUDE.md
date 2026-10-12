# Consignes pour les agents

- Messages de commit au format conventional commits, description en français : voir « Messages de commit » dans
  README.md. Le type compte : `fix(donnees)` pour une correction de codage, `feat(donnees)` pour un ajout (candidat,
  question, codage), `!` + pied `BREAKING CHANGE:` uniquement pour un changement de méthode qui rend les résultats non
  comparables. La CI refuse un message hors format (`npx commitlint --from HEAD~1` pour vérifier avant de pousser).
- Travailler sur `develop` (ou une branche fusionnée dans `develop`). Ne jamais pousser sur `main` : elle avance seule
  à chaque release. Ne pas modifier à la main `.release-please-manifest.json`, `data/version.txt` ni les CHANGELOG.
- Toute modification de `data/` se trace dans `data/journal.json` ; `npm run check` doit passer avant de pousser.
