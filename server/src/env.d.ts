/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      DATABASE_URL?: string;
      JWT_SECRET?: string;
      GITHUB_TOKEN?: string;
      PORT?: string;
      NODE_ENV?: string;
    }
  }

  var process: NodeJS.Process;
  var Buffer: typeof Buffer;
}

export {};
