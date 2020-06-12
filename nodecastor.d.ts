interface CastStatus {
  applications?: {
    appId: string;
    displayName: string;
    iconUrl: string;
    isIdleScreen: boolean;
    launchedFromCloud: boolean;
    namespaces: any[];
    sessionId: string;
    statusText: string;
    transportId: string;
  }[];
  isActiveInput: boolean;
  isStandby: boolean;
  userEq: any;
  volume: {
    controlType: string;
    level: number;
    muted: boolean;
    stepInterval: number;
  };
}

interface CastDevice {
  id: string;
  friendlyName: string;
  address: string;
  port: number;
  timeout: number;
  reconnect: false | {
    maxRetries: number;
    maxDelay: number;
    initialDelay: number;
  };

  on(event: 'connect', callback: () => void): this;

  on(event: 'disconnect', callback: () => void): this;

  on(event: 'error', callback: (error: any) => void): this;

  on(event: 'status', callback: (status: any) => void): this;

  on(event: 'message', callback: (message: any) => void): this;

  on(event: 'reconnect_failed', callback: () => void): this;

  connect(): void;

  application(appId: string, callback?: (error: any, application: CastApplication) => void): void;

  status(callback: (error: any, status: CastStatus) => void): void;

  stop(): any;
}

interface CastApplication {
  device: CastDevice;
  id: string;
  timeout: number;

  run(namespace: string, callback?: (error: Error, session: CastSession) => void): void;

  join(namespace: string, callback?: (error: Error, session: CastSession) => void): void;
}

interface CastSession {
  device: CastDevice;
  app: CastApplication;
  namespace: string;
  id: string;
  timeout: number;

  send(data: any, callback?: (error: Error, answerData: any) => void): void;

  on(event: 'message', callback: (data: any) => void): this;
}

interface Options {
  logger?: any;
  timeout?: number;
  reconnect?: any;
}

interface Scanner {
  timeout: number;
  reconnect: false | {
    maxRetries: number;
    maxDelay: number;
    initialDelay: number;
  };

  start(): this;

  end(): this;

  on(event: 'online', callback: (device: CastDevice) => void): this;

  on(event: 'offline', callback: (device: CastDevice) => void): this;
}

interface Nodecastor {
  scan: (options?: Options) => Scanner;
}

interface CastInitData {
  url: string;
  credentials?: {
    oauth?: string;
    basic?: string;
  };
}
