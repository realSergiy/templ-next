// ToDo: change to prettier.config.ts
// once they resolve https://github.com/prettier/prettier-vscode/issues/3623
// or VS Code upgrade to the newer node.js with type stripping
// import { type Config } from 'prettier';
// const config: Config = { };
// export default config;

/**
 * @import { Config } from "prettier";
 */

export default /** @type {const} @satisfies {Config} */ ({
  arrowParens: 'avoid',
  bracketSameLine: false,
  bracketSpacing: true,
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  jsxSingleQuote: false,
  printWidth: 100,
  proseWrap: 'always',
  quoteProps: 'as-needed',
  requirePragma: false,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
});
