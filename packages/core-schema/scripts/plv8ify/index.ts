import { Project } from 'ts-morph';

import {
  appendExecute,
  getExportedFunction,
  getSqlConfig,
  replaceExportWithReturn,
  sanitizeAsyncAndAwait,
} from './utils.ts';

export async function plv8ify(filePath: string) {
  const sourceProject = new Project({});
  const sourceFile = sourceProject.addSourceFileAtPath(filePath);
  const exportedFunction = getExportedFunction(sourceFile, filePath);

  const buildOutput = await Bun.build({
    entrypoints: [filePath],
    format: 'esm',
    target: 'browser',
    splitting: false,
  });
  if (buildOutput instanceof Error) {
    throw buildOutput;
  }
  const bundledJs = (await buildOutput.outputs.find(() => true)?.text()) ?? '';

  const bundledProject = new Project({});
  const bundledFile = bundledProject.createSourceFile('bundle.js', bundledJs);
  sanitizeAsyncAndAwait(bundledFile);
  appendExecute(bundledFile);
  replaceExportWithReturn(bundledFile, exportedFunction);

  const bundledFileText = bundledFile
    .getText()
    .replace(/for await/g, 'for')
    .replace(/LoggingLevel\./g, '');

  const {
    customSchema,
    paramTypeMapping,
    defaultValueMapping,
    returnType,
    volatility,
    isTrigger,
    isStrict,
  } = getSqlConfig(exportedFunction, filePath);

  const scopedName = customSchema
    ? `${customSchema}.${exportedFunction.name}`
    : exportedFunction.name;

  function sqlParametersString(includeDefaults: boolean = true) {
    return isTrigger
      ? ''
      : exportedFunction.parameters
          .map((param) => {
            const type = paramTypeMapping?.[param.name] ?? param.type;
            const defaultValue = defaultValueMapping?.[param.name];
            return `${param.name} ${type}${defaultValue && includeDefaults ? ` DEFAULT ${defaultValue}` : ''}`;
          })
          .join(', ');
  }

  return [
    /* sql */ `drop function if exists ${scopedName}(${sqlParametersString(false)}) cascade;`,
    /* sql */ `create or replace function ${scopedName}(${sqlParametersString()}) returns ${returnType} as $plv8$`,
    bundledFileText,
    /* sql */ `$plv8$ language plv8 ${volatility}${isStrict ? ' strict' : ''};`,
  ].join('\n');
}
