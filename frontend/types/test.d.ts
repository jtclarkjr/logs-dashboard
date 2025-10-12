/// <reference types="bun-types" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace globalThis {
    const document: Document
    const window: Window & typeof globalThis
  }
}

export {}
