import eslint from '@eslint/js';
import tseslint, { config } from 'typescript-eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import * as nextConf from '@next/eslint-plugin-next';

const ignoresConfig = config({
  ignores: ['next-env.d.ts', '.next/**', 'node_modules/**'],
});

const settingsConfig = config({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['prettier.config.js', 'postcss.config.mjs'],
      },
      tsconfigRootDir: import.meta.dirname,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
});

const reactConfig = config(
  [reactPlugin.configs.flat.recommended, reactPlugin.configs.flat['jsx-runtime']].filter(
    (config): config is NonNullable<typeof config> => !!config,
  ),
  reactHooks.configs['recommended-latest'],
);

const nextConfig = config({
  name: 'next/recommended',
  plugins: {
    '@next/next': nextConf.default,
  },
  rules: Object.fromEntries(
    Object.entries(nextConf.flatConfig.recommended.rules).map(([key, value]) => [
      key,
      value === 'warn' ? 1 : value === 'error' ? 2 : 0,
    ]),
  ),
});

const tsConfig = config(
  eslint.configs.recommended,
  {
    rules: {
      'no-empty-pattern': [
        'error',
        {
          allowObjectPatternsAsParameters: true,
        },
      ],
    },
  },
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-misused-spread': [
        'error',
        {
          allow: ['string'],
        },
      ],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: 'always' },
      ],
    },
  },
);

const unicornConfig = config(eslintPluginUnicorn.configs.recommended, {
  rules: {
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          e2e: true,
          e: true,
        },
        replacements: Object.fromEntries(
          // default overrides: https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/rules/shared/abbreviations.js
          [
            'arg',
            'args',
            'arr',
            'attr',
            'btn',
            'conf',
            'ctx',
            'curr',
            'db',
            'dir',
            'dist',
            'doc',
            'docs',
            'env',
            'err',
            'ext',
            'fn',
            'i',
            'idx',
            'j',
            'len',
            'lib',
            'msg',
            'num',
            'obj',
            'opts',
            'param',
            'params',
            'pkg',
            'prev',
            'prod',
            'prop',
            'props',
            'ref',
            'refs',
            'req',
            'res',
            'src',
            'stdDev',
            'str',
            'tbl',
            'tmp',
            'util',
            'utils',
            'val',
            'var',
            'vars',
            'ver',
          ].map(key => [key, false]),
        ),
      },
    ],
    'unicorn/catch-error-name': [
      'error',
      {
        name: 'e',
      },
    ],
    'unicorn/switch-case-braces': ['error', 'avoid'],
    'unicorn/filename-case': 'off',
    'unicorn/no-new-array': 'off', // Array.from poor performance vs new Array()
  },
});

const fullConfig = config(
  ignoresConfig,
  settingsConfig,
  reactConfig,
  nextConfig,
  tsConfig,
  unicornConfig,
  eslintConfigPrettier,
);

export default fullConfig;
