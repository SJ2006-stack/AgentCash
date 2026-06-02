export interface GlobalCliOptions {
  testnet?: boolean;
  agreeTos?: boolean;
}

let globalOptions: GlobalCliOptions = {};

export function setGlobalCliOptions(options: GlobalCliOptions): void {
  globalOptions = { ...globalOptions, ...options };
}

export function getGlobalCliOptions(): GlobalCliOptions {
  return globalOptions;
}

export function isTestnetCli(): boolean {
  return globalOptions.testnet === true;
}
