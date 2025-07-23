declare module '@strapi/strapi' {
  export interface Strapi {
    db: any;
    plugins: any;
    admin: any;
    // Add other Strapi properties as needed
  }

  export const factories: {
    createCoreController: (uid: string, config?: any) => any;
  };

  export type ContentType = string;
}
