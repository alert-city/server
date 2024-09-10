declare module 'base32.js' {
  class Encoder {
    constructor(options?: { type?: 'rfc4648' | 'crockford'; lc?: boolean });
    write(buffer: Buffer): this;
    finalize(): string;
  }

  class Decoder {
    constructor(options?: { type?: 'rfc4648' | 'crockford'; lc?: boolean });
    write(input: string): this;
    finalize(): Buffer;
  }
}
