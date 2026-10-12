// Messages de commit : conventional commits (https://www.conventionalcommits.org/fr/), type en anglais, description
// en français. Le type fixe le numéro de version calculé par release-please : voir CONTRIBUTING.md.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Les descriptions sont en français et commencent souvent par un nom propre ou un identifiant (« ECO-003… »).
    'subject-case': [0],
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
