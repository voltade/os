export interface TSFunctionParameter {
  name: string;
  type: string;
}

export interface TSFunction {
  name: string;
  parameters: TSFunctionParameter[];
  returnType: string;
  jsDocTags: { name: string; commentText: string }[];
}

export type Volatility = 'volatile' | 'stable' | 'immutable';

export type Plv8FunctionConfig = {
  customSchema: string;
  paramTypeMapping: {
    [name: string]: string | null;
  };
  defaultValueMapping: {
    // biome-ignore lint/suspicious/noExplicitAny: literally any
    [name: string]: any;
  };
  returnType: string | null;
  volatility: Volatility | null;
  isTrigger: boolean;
  isStrict: boolean;
};
