import type { Attribute, Schema } from '@strapi/strapi';

export interface UserProfile extends Schema.Component {
  collectionName: 'components_user_profiles';
  info: {
    description: 'User profile details';
    displayName: 'Profile';
    icon: 'user';
  };
  attributes: {
    avatar: Attribute.Media<'images'>;
    firstName: Attribute.String;
    lastName: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'user.profile': UserProfile;
    }
  }
}
