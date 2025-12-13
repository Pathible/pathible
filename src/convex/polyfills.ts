/**
 * Polyfills for Convex runtime compatibility
 *
 * Some libraries expect browser/Node.js APIs that aren't available
 * in the Convex runtime. This file provides mock implementations.
 */

// MessageChannel polyfill for libraries that depend on it
if (typeof MessageChannel === "undefined") {
  class MockMessagePort {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onmessageerror: ((event: MessageEvent) => void) | null = null;

    close(): void {
      // No-op
    }

    postMessage(_message: unknown, _transfer?: Transferable[]): void {
      // No-op - messages aren't actually passed
    }

    start(): void {
      // No-op
    }

    addEventListener(
      _type: string,
      _listener: EventListenerOrEventListenerObject,
      _options?: boolean | AddEventListenerOptions,
    ): void {
      // No-op
    }

    removeEventListener(
      _type: string,
      _listener: EventListenerOrEventListenerObject,
      _options?: boolean | EventListenerOptions,
    ): void {
      // No-op
    }

    dispatchEvent(_event: Event): boolean {
      return false;
    }
  }

  class MockMessageChannel {
    port1: MockMessagePort;
    port2: MockMessagePort;

    constructor() {
      this.port1 = new MockMessagePort();
      this.port2 = new MockMessagePort();
    }
  }

  (globalThis as unknown as { MessageChannel: typeof MockMessageChannel }).MessageChannel =
    MockMessageChannel;
}
