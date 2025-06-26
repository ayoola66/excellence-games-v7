import type { Schema, Struct } from '@strapi/strapi';

export interface UserProfile extends Struct.ComponentSchema {
  collectionName: 'components_user_profiles';
  info: {
    description: 'User profile details';
    displayName: 'Profile';
    icon: 'user';
  };
  attributes: {
    avatar: Schema.Attribute.Media<'images'>;
    firstName: Schema.Attribute.String;
    lastName: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'user.profile': UserProfile;
    }
  }
}
