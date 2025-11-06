type EnvRecord = Record<string, string | undefined>;

type ProcessLike = {
  env: EnvRecord;
};

const globalScope = globalThis as typeof globalThis & { process?: ProcessLike };

if (!globalScope.process) {
  globalScope.process = { env: {} };
}

if (!globalScope.process.env) {
  globalScope.process.env = {};
}

globalScope.process.env.NODE_ENV = import.meta.env.MODE;

export {};
