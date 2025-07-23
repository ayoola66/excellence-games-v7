interface AdminApp {
  createMenuSection: (section: {
    id: string;
    title: {
      id: string;
      defaultMessage: string;
    };
    links: Array<{
      id: string;
      to: string;
      icon: string;
      permissions: string[];
      label: {
        id: string;
        defaultMessage: string;
      };
    }>;
  }) => void;
  addMenuSection: (section: {
    id: string;
    title: null;
    links: Array<{
      id: string;
      to: string;
      icon: string;
      permissions: string[];
      label: {
        id: string;
        defaultMessage: string;
      };
    }>;
  }) => void;
}

export default {
  config: {
    locales: ["en"],
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Targeted Admin",
      },
    },
    head: {
      favicon: "/favicon.ico",
    },
    auth: {
      logo: "/logo.png",
    },
    menu: {
      logo: "/logo.png",
    },
  },
  bootstrap() {},
};
