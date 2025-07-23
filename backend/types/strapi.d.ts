export interface Strapi {
  log: {
    info: (message: string) => void;
    error: (message: string) => void;
  };
  admin: {
    services: {
      role: {
        createRole: (params: any) => Promise<any>;
      };
      user: {
        create: (params: any) => Promise<any>;
      };
    };
  };
  plugins: {
    "users-permissions": {
      services: {
        user: {
          add: (params: any) => Promise<any>;
        };
      };
    };
  };
  db: {
    query: (model: string) => {
      findMany: (params: any) => Promise<any[]>;
      create: (params: any) => Promise<any>;
    };
  };
}

export interface EnvFunction {
  (key: string, defaultValue?: string): string;
  bool: (key: string, defaultValue?: boolean) => boolean;
  int: (key: string, defaultValue?: number) => number;
  array: (key: string, defaultValue?: string[]) => string[];
}
