import { type CallExpression, Node, type SourceFile, ts } from 'ts-morph';

import type {
  Plv8FunctionConfig,
  TSFunction,
  TSFunctionParameter,
} from './types.ts';

export function getExportedFunction(
  sourceFile: SourceFile,
  filePath: string,
): TSFunction {
  const functions = sourceFile.getFunctions();
  const exportedFunctions = functions.filter((fn) => fn.isExported());

  if (exportedFunctions.length > 1) {
    const error = new Error(
      `Expected exactly one exported function, found ${exportedFunctions.length}`,
    );
    error.cause = filePath;
    throw error;
  }
  const exportedFunction = exportedFunctions.find((fn) => fn.isExported());
  if (!exportedFunction) {
    const error = new Error(`No exported function found in file ${filePath}`);
    error.cause = filePath;
    throw error;
  }
  const name = exportedFunction.getName();
  if (!name) {
    const error = new Error(
      `Exported function in file ${filePath} must have a name`,
    );
    error.cause = filePath;
    throw error;
  }

  const parameters: TSFunctionParameter[] = exportedFunction
    .getParameters()
    .map((p) => ({
      name: p.getName(),
      type: p.getType().getText(),
    }));
  const returnType = exportedFunction.getReturnType().getText();
  const jsDocTags = exportedFunction.getJsDocs().flatMap((doc) =>
    doc.getTags().map((tag) => ({
      name: tag.getTagName(),
      commentText: tag.getCommentText() ?? '',
    })),
  );

  return {
    name,
    parameters,
    returnType,
    jsDocTags,
  };
}

export function getSqlConfig(
  fn: TSFunction,
  filePath: string,
): Plv8FunctionConfig {
  const config: Plv8FunctionConfig = {
    customSchema: '',
    paramTypeMapping: {},
    defaultValueMapping: {},
    returnType: null,
    volatility: null,
    isTrigger: false,
    isStrict: true,
  };

  for (const param of fn.parameters) {
    config.paramTypeMapping[param.name] = null;
  }

  for (const tag of fn.jsDocTags) {
    switch (tag.name) {
      case 'plv8_schema': {
        config.customSchema = tag.commentText;
        break;
      }
      case 'plv8_param': {
        // expected format: `/** @plv8_param {pg_data_type} param_name(=default_value) */`
        const match = tag.commentText.match(/^\s*{(\w+)} (\w+)(=.+)*\s*$/);
        if (!match) {
          const error = new Error(
            `Invalid @plv8_param tag format: ${tag.commentText}`,
          );
          error.cause = filePath;
          throw error;
        }
        const [_, pgDataType, paramName, defaultValue] = match;
        if (!paramName || !pgDataType) {
          const error = Error(
            `Invalid @plv8_param tag: ${tag.commentText}. Expected format: {pg_data_type} param_name(=default_value)`,
          );
          error.cause = filePath;
          throw error;
        }
        config.paramTypeMapping[paramName] = pgDataType;
        if (defaultValue)
          config.defaultValueMapping[paramName] = defaultValue.slice(1); // Remove the '='
        break;
      }

      case 'plv8_return': {
        // expected format: `/** @plv8_return {pg_data_type} */`
        const match = tag.commentText.match(/^\s*{(\w+)}\s*$/);
        if (!match) {
          const error = new Error(
            `Invalid @plv8_return tag format: ${tag.commentText}`,
          );
          error.cause = filePath;
          throw error;
        }
        const [_, pgDataType] = match;
        if (!pgDataType) {
          const error = new Error(
            `Invalid @plv8_return tag: ${tag.commentText}. Expected format: {pg_data_type}`,
          );
          error.cause = filePath;
          throw error;
        }
        config.returnType = pgDataType.toLowerCase();
        break;
      }
      case 'plv8_volatility': {
        if (
          !['volatile', 'stable', 'immutable'].includes(
            tag.commentText.toLowerCase(),
          )
        ) {
          const error = Error(
            `Invalid @plv8_volatility tag value: ${tag.commentText}. Expected one of: volatile, stable, immutable`,
          );
          error.cause = filePath;
          throw error;
        }
        config.volatility = tag.commentText.toLowerCase() as
          | 'volatile'
          | 'stable'
          | 'immutable';
        break;
      }
      case 'plv8_trigger': {
        config.isTrigger = true;
        break;
      }
      case 'plv8_disable_strict': {
        config.isStrict = false;
        break;
      }
    }
  }

  if (!config.volatility) {
    const error = new Error(
      `Function ${fn.name} is missing @plv8_volatility JSDoc tag. Expected one of: volatile, stable, immutable`,
    );
    error.cause = filePath;
    throw error;
  }

  if (
    !config.isTrigger &&
    Object.values(config.paramTypeMapping).some((type) => type === null)
  ) {
    const error = new Error(
      `Function ${fn.name} is missing @plv8_param JSDoc tags for some parameters. All parameters must have a type specified.`,
    );
    error.cause = filePath;
    throw error;
  }

  if (config.isTrigger) {
    config.returnType = 'trigger';
  } else if (!config.returnType) {
    const error = new Error(
      `Function ${fn.name} is missing @plv8_return JSDoc tag. Expected format: {sqlType}`,
    );
    error.cause = filePath;
    throw error;
  }

  return config;
}

export function sanitizeAsyncAndAwait(sourceFile: SourceFile): SourceFile {
  // Remove 'async' modifier from all function-like declarations
  sourceFile.getFunctions().forEach((fn) => fn.setIsAsync(false));
  sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.MethodDeclaration)
    .forEach((method) => method.setIsAsync(false));
  sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.ArrowFunction)
    .forEach((fn) => fn.setIsAsync(false));
  sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.FunctionExpression)
    .forEach((fn) => fn.setIsAsync(false));

  // Replace all 'await' expressions with the expression they are awaiting.
  // A while loop is used here because replacing nodes invalidates collections
  // of nodes, which would cause an error in a forEach loop.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const awaitExpr = sourceFile.getFirstDescendantByKind(
      ts.SyntaxKind.AwaitExpression,
    );
    if (awaitExpr === undefined) {
      break;
    }
    const expression = awaitExpr.getExpression();
    awaitExpr.replaceWithText(expression.getText());
  }

  return sourceFile;
}

function isDrizzleQueryBuilder(callExpr: CallExpression): boolean {
  let currentNode: Node = callExpr;
  while (true) {
    if (Node.isIdentifier(currentNode) && currentNode.getText() === 'db') {
      return true;
    }
    if (Node.isCallExpression(currentNode)) {
      currentNode = currentNode.getExpression();
    } else if (Node.isPropertyAccessExpression(currentNode)) {
      currentNode = currentNode.getExpression();
    } else {
      return false;
    }
  }
}

export function appendExecute(sourceFile: SourceFile): SourceFile {
  const callExpressions = sourceFile.getDescendantsOfKind(
    ts.SyntaxKind.CallExpression,
  );
  // Iterate backwards because we are modifying the tree, which can affect node positions.
  for (let i = callExpressions.length - 1; i >= 0; i--) {
    const callExpr = callExpressions[i];
    if (!callExpr || callExpr.wasForgotten()) {
      continue;
    }
    const parent = callExpr.getParent();
    const expression = callExpr.getExpression();
    // This is the end of a chain if the parent is not a PropertyAccessExpression
    // where this callExpr is the object being accessed.
    if (
      Node.isPropertyAccessExpression(parent) &&
      parent.getExpression() === callExpr
    ) {
      continue;
    }
    // Check if it's a db query chain
    if (
      Node.isPropertyAccessExpression(expression) &&
      isDrizzleQueryBuilder(callExpr)
    ) {
      const methodName = expression.getName();
      // If the chain doesn't already end with .execute(), append it.
      if (methodName !== 'execute') {
        callExpr.replaceWithText(`${callExpr.getText()}.execute()`);
      }
    }
  }

  return sourceFile;
}

export function replaceExportWithReturn(
  sourceFile: SourceFile,
  exportedFunction: TSFunction,
): SourceFile {
  const exportDeclarations = sourceFile.getExportDeclarations();

  for (const exportDeclaration of exportDeclarations) {
    const namedExports = exportDeclaration.getNamedExports();
    const exportToReplace = namedExports.find(
      (ne) => ne.getName() === exportedFunction.name,
    );

    if (exportToReplace) {
      const paramNames = exportedFunction.parameters
        .map((p) => p.name)
        .join(', ');
      const returnStatement = `return ${exportedFunction.name}(${paramNames});`;

      if (namedExports.length === 1) {
        // If it's the only export, replace the whole declaration
        exportDeclaration.replaceWithText(returnStatement);
      } else {
        // Otherwise, just remove the specific export specifier
        const fullText = exportDeclaration.getFullText();
        const specifierText = exportToReplace.getFullText();
        // This is a bit naive, might need adjustment for complex cases
        // e.g. comments, but should work for simple `export { func1, func2 }`
        const newText = fullText.replace(specifierText, '');
        exportDeclaration.replaceWithText(newText);
        sourceFile.addStatements([returnStatement]);
      }
      // Assuming we only have one export to replace per file.
      return sourceFile;
    }
  }

  // Fallback for `export function ...` which doesn't have an ExportDeclaration
  const functionDeclaration = sourceFile.getFunction(exportedFunction.name);
  if (functionDeclaration?.isExported()) {
    functionDeclaration.setIsExported(false);
    const paramNames = exportedFunction.parameters
      .map((p) => p.name)
      .join(', ');
    const returnStatement = `return ${exportedFunction.name}(${paramNames});`;
    sourceFile.addStatements([returnStatement]);
  }

  return sourceFile;
}
