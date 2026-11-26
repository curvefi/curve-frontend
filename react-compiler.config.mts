import { type PluginObj, types } from '@babel/core'
import babel from '@rolldown/plugin-babel'
import { reactCompilerPreset } from '@vitejs/plugin-react'
import reactCompilerPlugin from 'babel-plugin-react-compiler'

const compilerOptions = { compilationMode: 'infer' } as const

/**
 * We write localized messages as t`Hello ${name}!`.
 * React Compiler helps the app reuse work when the screen updates. Version 1.0.0
 * skips optimizing the whole function when it sees a message written this way.
 *
 * Before the compiler runs, write the same message as t(['Hello ', '!'], name),
 * so that React Compiler won't bail optimizing the component.
 *
 * Remove this step once the compiler can handle tag interpolations properly.
 * https://github.com/react/react/pull/37829
 *
 * This plugin function was written with gippety as it's highly technical and
 * most likely temporary. It was tested by letting the same gippety compare
 * and verify the output of the React compiler before and after the plugin.
 */
const lowerInterpolatedTranslations = (): PluginObj => ({
  visitor: {
    Program(program) {
      // Go through the file now so React Compiler sees the rewritten messages when it starts.
      program.traverse({
        TaggedTemplateExpression(path) {
          const { tag, quasi } = path.node
          // Match messages with placeholders that use our helper, even if it was imported under a different name.
          if (!quasi.expressions.length || !path.get('tag').referencesImport('@ui/lib/i18n', 't')) return

          // Use the text as JavaScript reads it. For example, \n becomes a line break.
          // An invalid backslash sequence gives that piece of text a missing value (undefined).
          const segments = quasi.quasis.map(({ value: { cooked } }) =>
            cooked == null ? types.buildUndefinedNode() : types.stringLiteral(cooked),
          )
          // Pass the list of text pieces first, followed by the values that fill the placeholders.
          const call = types.callExpression(tag, [
            types.arrayExpression(segments),
            ...(quasi.expressions as types.Expression[]),
          ])
          // Keep the message's original location so errors point to the right line.
          path.replaceWith(types.inherits(call, path.node))
        },
      })
    },
  },
})

export const reactCompiler = () =>
  babel({
    exclude: [
      // Preserve the Babel plugin's default exclusions and skip Vite's dependency cache.
      /[/\\](?:node_modules|\.cache)[/\\]|\0rolldown\/runtime\.js/,
    ],
    presets: [
      {
        ...reactCompilerPreset(compilerOptions),
        // Cypress's CommonJS loader cannot resolve the preset's import.meta.resolve call.
        preset: { plugins: [lowerInterpolatedTranslations, [reactCompilerPlugin, compilerOptions]] },
      },
    ],
  })
