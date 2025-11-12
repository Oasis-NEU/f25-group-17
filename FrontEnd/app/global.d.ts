export {};

declare global {
  interface Window {
    turnstile?: {
      render: (
        selector: string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          ["error-callback"]?: () => void;
        }
      ) => void;
    };
  }
}
