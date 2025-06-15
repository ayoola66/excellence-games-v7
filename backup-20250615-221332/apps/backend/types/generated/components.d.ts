import type { Schema, Attribute } from '@strapi/strapi';

export interface UserProfile extends Schema.Component {
  collectionName: 'components_user_profiles';
  info: {
    displayName: 'Profile';
    icon: 'user';
    description: 'User profile details';
  };
  attributes: {
    firstName: Attribute.String;
    lastName: Attribute.String;
    avatar: Attribute.Media;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'user.profile': UserProfile;
    }
  }
}
