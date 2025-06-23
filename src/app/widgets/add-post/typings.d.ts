declare module 'embed-js' {
  interface EmbedOptions {
    input: string | HTMLElement;
    plugins?: any[];
    preset?: any;
    inlineEmbed?: boolean;
    replaceText?: boolean;
    fetch?: any;
  }

  interface TextResult {
    result: string;
  }

  class EmbedJS {
    constructor(options: EmbedOptions);
    render(): void;
    text(): Promise<TextResult>;
    destroy(): void;
    // Add the opts property to the type declaration
    opts: EmbedOptions;
  }

  export default EmbedJS;
}

declare module 'embed-plugin-url' {
  function urlPlugin(options?: any): any;
  export default urlPlugin;
}