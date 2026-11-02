/*
  Next.js is a popular server-side rendering framework for React that presents some unique
  challenges for using Zustand properly. Keep in mind that Zustand store is a global variable (AKA
  module state) making it optional to use a Context. These challenges include:

    (1) Per-request store: A Next.js server can handle multiple requests simultaneously. This means
      that the store should be created per request and should not be shared across requests.

    (2) SSR friendly: Next.js applications are rendered twice, first on the server and again on the
      client. Having different outputs on both the client and the server will result in "hydration
      errors." The store will have to be initialized on the server and then re-initialized on the
      client with the same data in order to avoid that.

    (3) SPA routing friendly: Next.js supports a hybrid model for client side routing, which means
      that in order to reset a store, we need to initialize it at the component level using a
      Context.

    (4) Server caching friendly: Recent versions of Next.js (specifically applications using the
      App Router architecture) support aggressive server caching. Due to our store being a module
      state, it is completely compatible with this caching.

  We have these general recommendations for the appropriate use of Zustand:

    (1) No global stores - Because the store should not be shared across requests, it should not be
      defined as a global variable. Instead, the store should be created per request.

    (2) React Server Components should not read from or write to the store - RSCs cannot use hooks
      or context. They aren't meant to be stateful. Having an RSC read from or write values to a
      global store violates the architecture of Next.js.
*/
