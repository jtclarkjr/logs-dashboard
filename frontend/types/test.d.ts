/// <reference types="bun-types" />

declare global {
  namespace globalThis {
    const document: Document
    const window: Window & typeof globalThis
  }
}

export {}
