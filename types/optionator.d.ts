// Type definitions for optionator
declare module 'optionator' {
  interface Option {
    option: string;
    alias?: string;
    type: 'Boolean' | 'String' | 'Number';
    description: string;
    example?: string;
  }

  interface Options {
    prepend?: string;
    append?: string;
    options?: Option[];
  }

  interface ParsedOptions {
    [key: string]: unknown;
    _: string[];
  }

  function optionator(options: Options): {
    parse: (argv: string[]) => ParsedOptions;
    generateHelp: () => string;
  };

  export = optionator;
}