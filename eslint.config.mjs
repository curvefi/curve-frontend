import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import eslintReact from '@eslint-react/eslint-plugin'
import tanstack from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier'
import { importX } from 'eslint-plugin-import-x'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Custom rule that guards for usages of the `maybe` helper.
 * @type {eslint.Rule.Module}
 **/
const noMaybePatternRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow null-check patterns that should use the `maybe` helper from @primitives/objects.utils',
    },
    messages: {
      ternary: 'Use `maybe(value, fn)` instead of a ternary with a null check. See @primitives/objects.utils.',
      guard: 'Use `return maybe(value, fn)` instead of an early-return null guard. See @primitives/objects.utils.',
    },
  },
  create(context) {
    /** Returns 'null' | 'undefined' if the node is a nullish literal, or false otherwise */
    const isNullish = node =>
      (node?.type === 'Literal' && node.value === null) || (node?.type === 'Identifier' && node.name === 'undefined')

    /**
     * Check if all null checks in both sides of a logical expression satisfy the given predicate, and if so,
     * return a combined array of all checks. Otherwise, return null.
     **/
    const isEveryNullCheck = ([leftChecks, rightChecks], predicate) =>
      leftChecks?.every(predicate) && rightChecks?.every(predicate) ? [...leftChecks, ...rightChecks] : null

    /**
     * Recursively extracts null checks from a condition expression.
     * Returns an array of { checkedValue, isNegated } objects, or null if the
     * condition is not purely composed of null checks.
     *
     * Supported patterns:
     *   x == null, x === null, x != null, x !== null  (also with undefined)
     *   a == null || b == null    (all affirmative)
     *   a != null && b != null    (all negated)
     */
    const getNullChecks = ({ left, operator, right, type }) =>
      type === 'BinaryExpression'
        ? ['==', '===', '!=', '!=='].includes(operator)
          ? isNullish(right)
            ? [{ checkedValue: left, isNegated: operator.includes('!') }]
            : isNullish(left)
              ? [{ checkedValue: right, isNegated: operator.includes('!') }]
              : null
          : null
        : type === 'LogicalExpression'
          ? operator === '||'
            ? // All checks in an || chain must be affirmative (== null)
              isEveryNullCheck([getNullChecks(left), getNullChecks(right)], c => !c.isNegated)
            : operator === '&&'
              ? // All checks in an && chain must be negated (!= null)
                isEveryNullCheck([getNullChecks(left), getNullChecks(right)], c => c.isNegated)?.map(c => ({
                  ...c,
                  isNegated: false, // unify != null && and == null || since they are equivalent
                }))
              : null
          : null

    const isThenNullish = ({ argument, body, type }) =>
      type === 'ReturnStatement'
        ? isNullish(argument)
        : type === 'BlockStatement' &&
          body.length === 1 &&
          body[0].type === 'ReturnStatement' &&
          isNullish(body[0].argument)

    return {
      /** Detect ternary patterns: x == null ? nullish : expr  or  x != null ? expr : nullish */
      ConditionalExpression: node =>
        // Exactly one branch must be nullish && The entire condition must be composed of null checks
        isNullish(node.consequent) !== isNullish(node.alternate) &&
        getNullChecks(node.test) &&
        context.report({ node, messageId: 'ternary' }),
      /** Detect guard patterns: if (x == null) return nullish; return expr */
      IfStatement(node) {
        const { test, parent, consequent } = node
        const nullChecks = getNullChecks(test)
        if (
          // Condition must be a single affirmative null check (not negated)
          nullChecks?.length === 1 &&
          !nullChecks[0].isNegated &&
          // The then-block must be a return with a nullish value
          isThenNullish(consequent) &&
          // the next sibling must be a return statement
          (parent.type === 'BlockStatement' || parent.type === 'Program') &&
          parent.body[parent.body.indexOf(node) + 1]?.type === 'ReturnStatement'
        )
          context.report({
            node,
            messageId: 'guard',
          })
      },
    }
  },
}

/** Forbids negated ternary conditions like `!x ? a : b`, which should be `x ? b : a`. */
const noDoubleNegativeRule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow negated conditions in ternary expressions' },
    messages: { negated: 'Negated ternary conditions are hard to read. Swap the branches and remove the `!`.' },
  },
  create: context => ({
    ConditionalExpression(node) {
      const { test } = node
      if (test.type === 'UnaryExpression' && test.operator === '!') context.report({ node: test, messageId: 'negated' })
    },
  }),
}

const config = [
  // Global ignores — must be its own object with no `files` key
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.vercel/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.config.mjs',
      '**/storybook-static/**',
      'node_modules/**',
      '**/*.js',
    ],
  },

  // Recommended presets (flat-native)
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tanstack.configs['flat/recommended'],
  eslintReact.configs['recommended-typescript'],
  reactRefresh.configs.vite(),
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  ...storybook.configs['flat/recommended'],

  // Project-wide rules + plugins
  {
    plugins: {
      'no-only-tests': noOnlyTests,
      'unused-imports': unusedImports,
      local: { rules: { 'use-maybe-pattern': noMaybePatternRule, 'no-double-negative': noDoubleNegativeRule } },
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: __dirname,
        projectService: true,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },
      'import-x/internal-regex': '^@(ui|ui-kit|curvefi/prices-api|external-rewards)',
    },
    rules: {
      // The follow react rules are turned off as they were not enabled or working properly in the old eslint react plugin
      // These rules are new recommended ones that came with the migration from eslint-plugin-react to @eslint-react,
      // and we haven't had the bandwidth to fix all the issues they raise yet.
      // We should create future PRs to re-enable these rules and fix any issues that arise
      '@eslint-react/naming-convention-context-name': 'off',
      '@eslint-react/naming-convention-ref-name': 'off',
      '@eslint-react/naming-convention-id-name': 'off',
      '@eslint-react/component-hook-factories': 'off',
      '@eslint-react/set-state-in-effect': 'warn',
      '@eslint-react/purity': 'error',
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/no-forward-ref': 'off',
      '@eslint-react/no-clone-element': 'off',
      '@eslint-react/no-use-context': 'off',
      '@eslint-react/no-context-provider': 'off',
      '@eslint-react/no-unnecessary-use-prefix': 'off',
      '@eslint-react/no-children-to-array': 'off',
      '@eslint-react/no-children-map': 'off',
      '@eslint-react/no-nested-component-definitions': 'off',
      '@eslint-react/web-api-no-leaked-timeout': 'off',
      '@eslint-react/dom-no-flush-sync': 'off',
      '@eslint-react/web-api-no-leaked-event-listener': 'off',
      '@eslint-react/use-state': [
        'warn',
        {
          enforceSetterName: false, // we're not really sticking to the 'setX' naming convention in a lot of cases
          enforceLazyInitialization: false, // something we didn't adhere to previously, but should refactor in the future anyway?
        },
      ],

      'local/use-maybe-pattern': 'error',
      'local/no-double-negative': 'error',

      'object-shorthand': 'warn',
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'as-needed'],
      'no-only-tests/no-only-tests': 'error',
      'unused-imports/no-unused-imports': 'warn',

      'import-x/no-default-export': 'error',
      'import-x/no-named-as-default': 'error',
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: __dirname,
          // this syntax is confusing: 'target' is importing, 'from' is imported
          zones: [
            { from: 'apps', target: 'packages' }, // packages cannot import apps
            ...['dex', 'dao', 'lend', 'loan', 'llamalend', 'bridge'].map((importedApp, index, importingApp) => ({
              target: importingApp
                .filter(
                  // target ==> forbid import all apps except itself. Allow lend/loan apps to import llamalend
                  (importing, i) =>
                    i !== index && !(['loan', 'lend'].includes(importing) && importedApp === 'llamalend'),
                )
                .map(targetApp => `apps/main/src/${targetApp}`),
              from: `apps/main/src/${importedApp}`, // from ==> the app imported
            })),
            // forbid importing from the router-api app in app source code
            {
              target: ['apps/main/src/**'],
              from: 'apps/router-api',
            },
            // forbid `wagmi` external dependency package imports, except from feature
            {
              target: ['apps/**', 'packages/**', '!packages/curve-ui-kit/src/features/forms/**'],
              from: 'wagmi',
            },
          ],
        },
      ],

      'import-x/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            // This will make all @-prefixed external imports come after non-@ imports
            { pattern: '@*/**', group: 'external', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: [], // Make sure pathGroups aren't ignored by anything
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'never',
        },
      ],

      'no-restricted-imports': [
        'warn',
        {
          paths: [
            ...['Accordion', 'Tabs', 'Slider', 'Tooltip', 'Select'].map(component => ({
              name: `@mui/material/${component}`,
              message: `Use \`import { ${component} } from '@ui-kit/shared/ui/${component}'\` instead.`,
            })),
            {
              name: '@mui/material/Chip',
              message:
                "Use `import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'` or `import { Badge } from '@ui-kit/shared/ui/Badge'` instead.",
            },
            {
              name: 'react-hook-form',
              message: "Use `'@ui-kit/features/forms'` instead of 'react-hook-form' directly.",
            },
          ],
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/triple-slash-reference': ['error', { lib: 'always', path: 'always', types: 'prefer-import' }],

      // The following rules come from tseslint.configs.recommendedTypeChecked, but are too large to fix in one go
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/require-await': 'off',

      // And the following ones are from tseslint.configs.stylisticTypeChecked
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'no-console': [
        'error', // use console.log only for debugging
        {
          allow: ['warn', 'error', 'info', 'trace', 'assert'],
        },
      ],
    },
  },

  // Override (replaces legacy `overrides`)
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.d.ts', '**/_api/*.ts'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },

  // Disables stylistic rules that conflict with Prettier — must be last
  prettier,
]

export default config
