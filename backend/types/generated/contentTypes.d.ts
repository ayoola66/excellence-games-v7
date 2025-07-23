import type { Schema, Attribute } from '@strapi/strapi';

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    name: 'Permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    name: 'User';
    description: '';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    username: Attribute.String;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    registrationToken: Attribute.String & Attribute.Private;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    preferedLanguage: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    name: 'Role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    name: 'Api Token';
    singularName: 'api-token';
    pluralName: 'api-tokens';
    displayName: 'Api Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    name: 'API Token Permission';
    description: '';
    singularName: 'api-token-permission';
    pluralName: 'api-token-permissions';
    displayName: 'API Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    name: 'Transfer Token';
    singularName: 'transfer-token';
    pluralName: 'transfer-tokens';
    displayName: 'Transfer Token';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    lastUsedAt: Attribute.DateTime;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    expiresAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    name: 'Transfer Token Permission';
    description: '';
    singularName: 'transfer-token-permission';
    pluralName: 'transfer-token-permissions';
    displayName: 'Transfer Token Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    singularName: 'file';
    pluralName: 'files';
    displayName: 'File';
    description: '';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    alternativeText: Attribute.String;
    caption: Attribute.String;
    width: Attribute.Integer;
    height: Attribute.Integer;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    ext: Attribute.String;
    mime: Attribute.String & Attribute.Required;
    size: Attribute.Decimal & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    singularName: 'folder';
    pluralName: 'folders';
    displayName: 'Folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    name: 'permission';
    description: '';
    singularName: 'permission';
    pluralName: 'permissions';
    displayName: 'Permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    name: 'role';
    description: '';
    singularName: 'role';
    pluralName: 'roles';
    displayName: 'Role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    description: Attribute.String;
    type: Attribute.String & Attribute.Unique;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    name: 'user';
    description: 'Game users and customers';
    singularName: 'user';
    pluralName: 'users';
    displayName: 'User';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Attribute.String;
    password: Attribute.Password &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    resetPasswordToken: Attribute.String & Attribute.Private;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    firstName: Attribute.String & Attribute.Required;
    lastName: Attribute.String & Attribute.Required;
    displayName: Attribute.String;
    phoneNumber: Attribute.String;
    address: Attribute.String;
    city: Attribute.String;
    country: Attribute.String;
    postalCode: Attribute.String;
    bio: Attribute.Text;
    playerSubscription: Attribute.Enumeration<['Free', 'Premium']> &
      Attribute.DefaultTo<'Free'>;
    orders: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::order.order'
    >;
    activities: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::activity.activity'
    >;
    gameStats: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::game-stat.game-stat'
    >;
    music: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::user-music.user-music'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    singularName: 'locale';
    pluralName: 'locales';
    collectionName: 'locales';
    displayName: 'Locale';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    name: Attribute.String &
      Attribute.SetMinMax<{
        min: 1;
        max: 50;
      }>;
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiActivityActivity extends Schema.CollectionType {
  collectionName: 'activities';
  info: {
    singularName: 'activity';
    pluralName: 'activities';
    displayName: 'Activity';
    description: 'User and admin activity tracking';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    type: Attribute.Enumeration<
      [
        'LOGIN',
        'LOGOUT',
        'GAME_START',
        'GAME_END',
        'PURCHASE',
        'PROFILE_UPDATE',
        'CONTENT_CREATE',
        'CONTENT_UPDATE',
        'CONTENT_DELETE',
        'USER_MANAGEMENT',
        'SYSTEM_CONFIG'
      ]
    > &
      Attribute.Required;
    details: Attribute.JSON;
    user: Attribute.Relation<
      'api::activity.activity',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    admin: Attribute.Relation<
      'api::activity.activity',
      'manyToOne',
      'api::platform-admin.platform-admin'
    >;
    ipAddress: Attribute.String;
    userAgent: Attribute.Text;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::activity.activity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::activity.activity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories';
  info: {
    singularName: 'category';
    pluralName: 'categories';
    displayName: 'Category';
    description: 'Game categories for nested games';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    cardNumber: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
        max: 5;
      }>;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    game: Attribute.Relation<
      'api::category.category',
      'manyToOne',
      'api::game.game'
    >;
    questions: Attribute.Relation<
      'api::category.category',
      'oneToMany',
      'api::question.question'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCouponCoupon extends Schema.CollectionType {
  collectionName: 'coupons';
  info: {
    singularName: 'coupon';
    pluralName: 'coupons';
    displayName: 'Coupon';
    description: 'Discount coupons';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    code: Attribute.String & Attribute.Required & Attribute.Unique;
    type: Attribute.Enumeration<['PERCENTAGE', 'FIXED']> & Attribute.Required;
    value: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    minPurchase: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    maxDiscount: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    startDate: Attribute.DateTime & Attribute.Required;
    endDate: Attribute.DateTime & Attribute.Required;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    usageLimit: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    usageCount: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    orders: Attribute.Relation<
      'api::coupon.coupon',
      'oneToMany',
      'api::order.order'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::coupon.coupon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::coupon.coupon',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiFooterLinkFooterLink extends Schema.CollectionType {
  collectionName: 'footer_links';
  info: {
    singularName: 'footer-link';
    pluralName: 'footer-links';
    displayName: 'Footer Link';
    description: 'Manage footer navigation links';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    href: Attribute.String & Attribute.Required;
    section: Attribute.Enumeration<['games', 'company', 'legal']> &
      Attribute.Required;
    order: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::footer-link.footer-link',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::footer-link.footer-link',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiGameGame extends Schema.CollectionType {
  collectionName: 'games';
  info: {
    singularName: 'game';
    pluralName: 'games';
    displayName: 'Game';
    description: 'Collection of trivia games';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    status: Attribute.Enumeration<['DRAFT', 'PUBLISHED']> &
      Attribute.Required &
      Attribute.DefaultTo<'DRAFT'>;
    type: Attribute.Enumeration<['STRAIGHT', 'NESTED']> & Attribute.Required;
    imageUrl: Attribute.Media;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    isPremium: Attribute.Boolean & Attribute.DefaultTo<false>;
    categories: Attribute.Relation<
      'api::game.game',
      'oneToMany',
      'api::category.category'
    >;
    questions: Attribute.Relation<
      'api::game.game',
      'oneToMany',
      'api::question.question'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::game.game', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::game.game', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiGameStatGameStat extends Schema.CollectionType {
  collectionName: 'game_stats';
  info: {
    singularName: 'game-stat';
    pluralName: 'game-stats';
    displayName: 'Game Stats';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    user: Attribute.Relation<
      'api::game-stat.game-stat',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    gamesPlayed: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    timePlayed: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    highScore: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    winRate: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
        max: 100;
      }> &
      Attribute.DefaultTo<0>;
    lastGameDate: Attribute.DateTime;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::game-stat.game-stat',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::game-stat.game-stat',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiMusicUploadMusicUpload extends Schema.CollectionType {
  collectionName: 'music_uploads';
  info: {
    singularName: 'music-upload';
    pluralName: 'music-uploads';
    displayName: 'Music Upload';
    description: 'User music uploads and metadata';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    fileUrl: Attribute.String & Attribute.Required;
    fileSize: Attribute.BigInteger;
    duration: Attribute.Decimal;
    metadata: Attribute.JSON;
    user: Attribute.Relation<
      'api::music-upload.music-upload',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::music-upload.music-upload',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::music-upload.music-upload',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrderOrder extends Schema.CollectionType {
  collectionName: 'orders';
  info: {
    singularName: 'order';
    pluralName: 'orders';
    displayName: 'Order';
    description: 'User purchase orders';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    orderNumber: Attribute.String & Attribute.Required & Attribute.Unique;
    amount: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    currency: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'USD'>;
    status: Attribute.Enumeration<
      ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'PENDING'>;
    paymentMethod: Attribute.String & Attribute.Required;
    user: Attribute.Relation<
      'api::order.order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiOrderItemOrderItem extends Schema.CollectionType {
  collectionName: 'order_items';
  info: {
    singularName: 'order-item';
    pluralName: 'order-items';
    displayName: 'Order Item';
    description: 'Individual items in an order';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    quantity: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    unitPrice: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    order: Attribute.Relation<
      'api::order-item.order-item',
      'manyToOne',
      'api::order.order'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order-item.order-item',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::order-item.order-item',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiPagePage extends Schema.CollectionType {
  collectionName: 'pages';
  info: {
    singularName: 'page';
    pluralName: 'pages';
    displayName: 'Page';
    description: 'Manage frontend pages content';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String & Attribute.Required & Attribute.Unique;
    slug: Attribute.String & Attribute.Required & Attribute.Unique;
    content: Attribute.RichText & Attribute.Required;
    seo: Attribute.Component<'shared.seo'>;
    lastEditedBy: Attribute.Relation<
      'api::page.page',
      'manyToOne',
      'api::platform-admin.platform-admin'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::page.page', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::page.page', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiPageContentPageContent extends Schema.CollectionType {
  collectionName: 'page_contents';
  info: {
    singularName: 'page-content';
    pluralName: 'page-contents';
    displayName: 'Page Content';
    description: 'Manage content for different pages';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    pageName: Attribute.Enumeration<['home', 'about', 'contact', 'shop']> &
      Attribute.Required &
      Attribute.Unique;
    title: Attribute.String & Attribute.Required;
    sections: Attribute.DynamicZone<
      [
        'sections.hero',
        'sections.mission',
        'sections.values',
        'sections.legacy',
        'sections.team',
        'sections.contact-info',
        'sections.faq',
        'sections.newsletter'
      ]
    >;
    seo: Attribute.Component<'meta.seo'>;
    updatedBy: Attribute.Relation<
      'api::page-content.page-content',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    createdBy: Attribute.Relation<
      'api::page-content.page-content',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
  };
}

export interface ApiPlatformAdminPlatformAdmin extends Schema.CollectionType {
  collectionName: 'platform_admins';
  info: {
    singularName: 'platform-admin';
    pluralName: 'platform-admins';
    displayName: 'Platform Admin';
    description: 'Platform administrators with elevated privileges';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    firstName: Attribute.String & Attribute.Required;
    lastName: Attribute.String & Attribute.Required;
    email: Attribute.Email & Attribute.Required & Attribute.Unique;
    adminRole: Attribute.String & Attribute.Required;
    accessLevel: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
        max: 10;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
    lastLoginAt: Attribute.DateTime;
    lastLogoutAt: Attribute.DateTime;
    user: Attribute.Relation<
      'api::platform-admin.platform-admin',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    permissions: Attribute.JSON;
    refreshToken: Attribute.Text & Attribute.Private;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::platform-admin.platform-admin',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::platform-admin.platform-admin',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProductProduct extends Schema.CollectionType {
  collectionName: 'products';
  info: {
    singularName: 'product';
    pluralName: 'products';
    displayName: 'Product';
    description: 'Products available for purchase';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    description: Attribute.Text & Attribute.Required;
    price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    category: Attribute.String & Attribute.Required;
    imageUrl: Attribute.Media;
    stock: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    orderItems: Attribute.Relation<
      'api::product.product',
      'oneToMany',
      'api::order-item.order-item'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiQuestionQuestion extends Schema.CollectionType {
  collectionName: 'questions';
  info: {
    singularName: 'question';
    pluralName: 'questions';
    displayName: 'Question';
    description: 'Trivia questions for games';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    text: Attribute.Text & Attribute.Required;
    options: Attribute.JSON & Attribute.Required;
    correctOption: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
        max: 3;
      }>;
    cardNumber: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
        max: 5;
      }>;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    game: Attribute.Relation<
      'api::question.question',
      'manyToOne',
      'api::game.game'
    >;
    category: Attribute.Relation<
      'api::question.question',
      'manyToOne',
      'api::category.category'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::question.question',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::question.question',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStoreItemStoreItem extends Schema.CollectionType {
  collectionName: 'store_items';
  info: {
    singularName: 'store-item';
    pluralName: 'store-items';
    displayName: 'Store Item';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    description: Attribute.Text & Attribute.Required;
    price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    status: Attribute.Enumeration<['active', 'inactive']> &
      Attribute.Required &
      Attribute.DefaultTo<'active'>;
    image: Attribute.Media;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::store-item.store-item',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::store-item.store-item',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStripeConfigStripeConfig extends Schema.CollectionType {
  collectionName: 'stripe_configs';
  info: {
    singularName: 'stripe-config';
    pluralName: 'stripe-configs';
    displayName: 'Stripe Configuration';
    description: 'Stripe account configurations';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required & Attribute.Unique;
    description: Attribute.Text;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    environment: Attribute.Enumeration<
      ['development', 'staging', 'production']
    > &
      Attribute.Required;
    secretKey: Attribute.String & Attribute.Required & Attribute.Private;
    publishableKey: Attribute.String & Attribute.Required;
    webhookSecret: Attribute.String & Attribute.Required & Attribute.Private;
    accountId: Attribute.String & Attribute.Required;
    defaultCurrency: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'GBP'>;
    metadata: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::stripe-config.stripe-config',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::stripe-config.stripe-config',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStripePriceStripePrice extends Schema.CollectionType {
  collectionName: 'stripe_prices';
  info: {
    singularName: 'stripe-price';
    pluralName: 'stripe-prices';
    displayName: 'Stripe Price';
    description: 'Prices synced with Stripe';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    stripeId: Attribute.String & Attribute.Required & Attribute.Unique;
    product: Attribute.Relation<
      'api::stripe-price.stripe-price',
      'manyToOne',
      'api::stripe-product.stripe-product'
    >;
    active: Attribute.Boolean & Attribute.DefaultTo<true>;
    currency: Attribute.String & Attribute.Required;
    unitAmount: Attribute.BigInteger &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    type: Attribute.Enumeration<['one_time', 'recurring']> & Attribute.Required;
    interval: Attribute.Enumeration<['day', 'week', 'month', 'year']>;
    intervalCount: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 1;
      }>;
    trialPeriodDays: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    metadata: Attribute.JSON;
    nickname: Attribute.String;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::stripe-price.stripe-price',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::stripe-price.stripe-price',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStripeProductStripeProduct extends Schema.CollectionType {
  collectionName: 'stripe_products';
  info: {
    singularName: 'stripe-product';
    pluralName: 'stripe-products';
    displayName: 'Stripe Product';
    description: 'Products synced with Stripe';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    stripeId: Attribute.String & Attribute.Required & Attribute.Unique;
    active: Attribute.Boolean & Attribute.DefaultTo<true>;
    metadata: Attribute.JSON;
    prices: Attribute.Relation<
      'api::stripe-product.stripe-product',
      'oneToMany',
      'api::stripe-price.stripe-price'
    >;
    type: Attribute.Enumeration<['one_time', 'subscription']> &
      Attribute.Required;
    features: Attribute.JSON;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::stripe-product.stripe-product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::stripe-product.stripe-product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiStripeSubscriptionStripeSubscription
  extends Schema.CollectionType {
  collectionName: 'stripe_subscriptions';
  info: {
    singularName: 'stripe-subscription';
    pluralName: 'stripe-subscriptions';
    displayName: 'Stripe Subscription';
    description: 'User subscriptions synced with Stripe';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    stripeId: Attribute.String & Attribute.Required & Attribute.Unique;
    user: Attribute.Relation<
      'api::stripe-subscription.stripe-subscription',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    price: Attribute.Relation<
      'api::stripe-subscription.stripe-subscription',
      'manyToOne',
      'api::stripe-price.stripe-price'
    >;
    status: Attribute.Enumeration<
      [
        'incomplete',
        'incomplete_expired',
        'trialing',
        'active',
        'past_due',
        'canceled',
        'unpaid'
      ]
    > &
      Attribute.Required;
    currentPeriodStart: Attribute.DateTime & Attribute.Required;
    currentPeriodEnd: Attribute.DateTime & Attribute.Required;
    cancelAtPeriodEnd: Attribute.Boolean & Attribute.DefaultTo<false>;
    canceledAt: Attribute.DateTime;
    endedAt: Attribute.DateTime;
    trialStart: Attribute.DateTime;
    trialEnd: Attribute.DateTime;
    metadata: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::stripe-subscription.stripe-subscription',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::stripe-subscription.stripe-subscription',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiUserActivityUserActivity extends Schema.CollectionType {
  collectionName: 'user_activities';
  info: {
    singularName: 'user-activity';
    pluralName: 'user-activities';
    displayName: 'User Activity';
    description: '';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    activityType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-activity.user-activity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::user-activity.user-activity',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiUserMusicUserMusic extends Schema.CollectionType {
  collectionName: 'user_musics';
  info: {
    singularName: 'user-music';
    pluralName: 'user-musics';
    displayName: 'User Music';
    description: 'User uploaded music files';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    file: Attribute.Media & Attribute.Required;
    duration: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    user: Attribute.Relation<
      'api::user-music.user-music',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-music.user-music',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::user-music.user-music',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::permission': AdminPermission;
      'admin::user': AdminUser;
      'admin::role': AdminRole;
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
      'plugin::i18n.locale': PluginI18NLocale;
      'api::activity.activity': ApiActivityActivity;
      'api::category.category': ApiCategoryCategory;
      'api::coupon.coupon': ApiCouponCoupon;
      'api::footer-link.footer-link': ApiFooterLinkFooterLink;
      'api::game.game': ApiGameGame;
      'api::game-stat.game-stat': ApiGameStatGameStat;
      'api::music-upload.music-upload': ApiMusicUploadMusicUpload;
      'api::order.order': ApiOrderOrder;
      'api::order-item.order-item': ApiOrderItemOrderItem;
      'api::page.page': ApiPagePage;
      'api::page-content.page-content': ApiPageContentPageContent;
      'api::platform-admin.platform-admin': ApiPlatformAdminPlatformAdmin;
      'api::product.product': ApiProductProduct;
      'api::question.question': ApiQuestionQuestion;
      'api::store-item.store-item': ApiStoreItemStoreItem;
      'api::stripe-config.stripe-config': ApiStripeConfigStripeConfig;
      'api::stripe-price.stripe-price': ApiStripePriceStripePrice;
      'api::stripe-product.stripe-product': ApiStripeProductStripeProduct;
      'api::stripe-subscription.stripe-subscription': ApiStripeSubscriptionStripeSubscription;
      'api::user-activity.user-activity': ApiUserActivityUserActivity;
      'api::user-music.user-music': ApiUserMusicUserMusic;
    }
  }
}
