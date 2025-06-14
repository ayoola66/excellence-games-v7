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
    description: '';
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
    subscriptionStatus: Attribute.Enumeration<['free', 'premium']> &
      Attribute.Required &
      Attribute.DefaultTo<'free'>;
    premiumExpiry: Attribute.Date;
    fullName: Attribute.String;
    phone: Attribute.String;
    address: Attribute.Text;
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

export interface ApiAdminUserAdminUser extends Schema.CollectionType {
  collectionName: 'admin_user_profiles';
  info: {
    singularName: 'admin-user';
    pluralName: 'admin-users';
    displayName: 'Admin User';
    description: 'Admin user profiles with role-based permissions';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    email: Attribute.Email & Attribute.Required & Attribute.Unique;
    password: Attribute.Text & Attribute.Required;
    fullName: Attribute.String & Attribute.Required;
    adminType: Attribute.Enumeration<['SA', 'DEV', 'SH', 'CT', 'CS']> &
      Attribute.Required &
      Attribute.DefaultTo<'CS'>;
    badge: Attribute.String & Attribute.Required;
    permissions: Attribute.JSON;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    lastLogin: Attribute.DateTime;
    sessionToken: Attribute.Text;
    profilePicture: Attribute.Media;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::admin-user.admin-user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::admin-user.admin-user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiBackgroundMusicBackgroundMusic
  extends Schema.CollectionType {
  collectionName: 'background_music_tracks';
  info: {
    singularName: 'background-music';
    pluralName: 'background-musics';
    displayName: 'Background Music';
    description: 'Admin-uploaded background music tracks for rotation';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    audioFile: Attribute.Media & Attribute.Required;
    duration: Attribute.Integer;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    uploadedBy: Attribute.Relation<
      'api::background-music.background-music',
      'manyToOne',
      'api::admin-user.admin-user'
    >;
    fileSize: Attribute.Integer;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    playCount: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::background-music.background-music',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::background-music.background-music',
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
    description: 'Categories for straight trivia and nested game cards';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    questionCount: Attribute.Integer & Attribute.DefaultTo<0>;
    status: Attribute.Enumeration<['free', 'premium']> &
      Attribute.DefaultTo<'free'>;
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
    cardNumber: Attribute.Integer;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
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

export interface ApiGameGame extends Schema.CollectionType {
  collectionName: 'games';
  info: {
    singularName: 'game';
    pluralName: 'games';
    displayName: 'Game';
    description: 'Trivia games with straight or nested categories';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    type: Attribute.Enumeration<['straight', 'nested']> &
      Attribute.Required &
      Attribute.DefaultTo<'straight'>;
    status: Attribute.Enumeration<['free', 'premium']> &
      Attribute.Required &
      Attribute.DefaultTo<'free'>;
    thumbnail: Attribute.Media;
    totalQuestions: Attribute.Integer & Attribute.DefaultTo<0>;
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
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::game.game', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::game.game', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiOrderOrder extends Schema.CollectionType {
  collectionName: 'orders';
  info: {
    singularName: 'order';
    pluralName: 'orders';
    displayName: 'Order';
    description: 'Customer orders and purchases';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    orderNumber: Attribute.String & Attribute.Required & Attribute.Unique;
    user: Attribute.Relation<
      'api::order.order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    products: Attribute.Relation<
      'api::order.order',
      'manyToMany',
      'api::product.product'
    >;
    productDetails: Attribute.JSON & Attribute.Required;
    subtotal: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    shipping: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    tax: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    total: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    currency: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'GBP'>;
    status: Attribute.Enumeration<
      ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'pending'>;
    paymentStatus: Attribute.Enumeration<
      ['pending', 'paid', 'failed', 'refunded', 'partially_refunded']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'pending'>;
    paymentMethod: Attribute.String & Attribute.DefaultTo<'stripe'>;
    stripePaymentIntentId: Attribute.String;
    stripeChargeId: Attribute.String;
    shippingAddress: Attribute.JSON;
    billingAddress: Attribute.JSON;
    notes: Attribute.Text;
    trackingNumber: Attribute.String;
    shippedAt: Attribute.DateTime;
    deliveredAt: Attribute.DateTime;
    grantedPremiumAccess: Attribute.Boolean & Attribute.DefaultTo<false>;
    premiumGrantedAt: Attribute.DateTime;
    premiumExpiresAt: Attribute.DateTime;
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

export interface ApiProductProduct extends Schema.CollectionType {
  collectionName: 'products';
  info: {
    singularName: 'product';
    pluralName: 'products';
    displayName: 'Product';
    description: 'Shop products including board games and accessories';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    description: Attribute.RichText & Attribute.Required;
    shortDescription: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    salePrice: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    type: Attribute.Enumeration<
      ['board_game', 'accessory', 'expansion', 'merchandise', 'other']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'board_game'>;
    sku: Attribute.String & Attribute.Required & Attribute.Unique;
    stock: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<0>;
    images: Attribute.Media;
    features: Attribute.JSON;
    specifications: Attribute.JSON;
    isActive: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
    isFeatured: Attribute.Boolean & Attribute.DefaultTo<false>;
    category: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    tags: Attribute.JSON;
    weight: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }>;
    dimensions: Attribute.JSON;
    grantsPremiumAccess: Attribute.Boolean & Attribute.DefaultTo<false>;
    premiumDurationMonths: Attribute.Integer &
      Attribute.SetMinMax<{
        min: 1;
      }> &
      Attribute.DefaultTo<12>;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
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
    description: 'Trivia questions with multiple choice answers';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    question: Attribute.Text & Attribute.Required;
    option1: Attribute.String & Attribute.Required;
    option2: Attribute.String & Attribute.Required;
    option3: Attribute.String & Attribute.Required;
    option4: Attribute.String & Attribute.Required;
    correctAnswer: Attribute.Enumeration<
      ['option1', 'option2', 'option3', 'option4']
    > &
      Attribute.Required;
    explanation: Attribute.Text;
    tags: Attribute.JSON;
    category: Attribute.Relation<
      'api::question.question',
      'manyToOne',
      'api::category.category'
    >;
    game: Attribute.Relation<
      'api::question.question',
      'manyToOne',
      'api::game.game'
    >;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    timesAnswered: Attribute.Integer & Attribute.DefaultTo<0>;
    timesCorrect: Attribute.Integer & Attribute.DefaultTo<0>;
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

export interface ApiShopSettingShopSetting extends Schema.SingleType {
  collectionName: 'shop_settings';
  info: {
    singularName: 'shop-setting';
    pluralName: 'shop-settings';
    displayName: 'Shop Settings';
    description: 'Shop configuration and payment settings';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    stripePublishableKey: Attribute.String;
    stripeSecretKey: Attribute.Password;
    stripeWebhookSecret: Attribute.Password;
    currency: Attribute.String & Attribute.DefaultTo<'GBP'>;
    firstBoardGamePrice: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<40>;
    additionalBoardGamePrice: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<25>;
    freeShippingThreshold: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<50>;
    standardShippingCost: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
      }> &
      Attribute.DefaultTo<5.99>;
    taxRate: Attribute.Decimal &
      Attribute.SetMinMax<{
        min: 0;
        max: 1;
      }> &
      Attribute.DefaultTo<0.2>;
    shopEnabled: Attribute.Boolean & Attribute.DefaultTo<true>;
    maintenanceMode: Attribute.Boolean & Attribute.DefaultTo<false>;
    maintenanceMessage: Attribute.Text;
    termsAndConditions: Attribute.RichText;
    privacyPolicy: Attribute.RichText;
    returnPolicy: Attribute.RichText;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shop-setting.shop-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    updatedBy: Attribute.Relation<
      'api::shop-setting.shop-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiUserUser extends Schema.CollectionType {
  collectionName: 'game_users';
  info: {
    singularName: 'user';
    pluralName: 'users';
    displayName: 'Game User';
    description: 'Extended user profiles for the trivia platform';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    email: Attribute.Email & Attribute.Required & Attribute.Unique;
    username: Attribute.String & Attribute.Required & Attribute.Unique;
    subscriptionType: Attribute.Enumeration<['free', 'premium']> &
      Attribute.Required &
      Attribute.DefaultTo<'free'>;
    subscriptionExpiry: Attribute.DateTime;
    profile: Attribute.Component<'user.profile'>;
    gameStats: Attribute.JSON;
    preferences: Attribute.JSON;
    achievements: Attribute.JSON;
    lastGamePlayed: Attribute.DateTime;
    totalScore: Attribute.Integer & Attribute.DefaultTo<0>;
    gamesCompleted: Attribute.Integer & Attribute.DefaultTo<0>;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    registrationDate: Attribute.DateTime;
    lastLogin: Attribute.DateTime;
    favoriteGames: Attribute.Relation<
      'api::user.user',
      'oneToMany',
      'api::game.game'
    >;
    recentGames: Attribute.JSON;
    customMusicTrack: Attribute.Media;
    billingInfo: Attribute.JSON;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::user.user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    updatedBy: Attribute.Relation<'api::user.user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiUserMusicUserMusic extends Schema.CollectionType {
  collectionName: 'user_music_tracks';
  info: {
    singularName: 'user-music';
    pluralName: 'user-musics';
    displayName: 'User Music';
    description: 'User-uploaded music tracks for premium users';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    audioFile: Attribute.Media & Attribute.Required;
    user: Attribute.Relation<
      'api::user-music.user-music',
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.Required;
    uploadSlot: Attribute.Integer & Attribute.DefaultTo<1>;
    isPremiumUser: Attribute.Boolean & Attribute.DefaultTo<false>;
    duration: Attribute.Integer;
    fileSize: Attribute.Integer;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    playCount: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    updatedAt: Attribute.DateTime;
    publishedAt: Attribute.DateTime;
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
      'api::admin-user.admin-user': ApiAdminUserAdminUser;
      'api::background-music.background-music': ApiBackgroundMusicBackgroundMusic;
      'api::category.category': ApiCategoryCategory;
      'api::game.game': ApiGameGame;
      'api::order.order': ApiOrderOrder;
      'api::product.product': ApiProductProduct;
      'api::question.question': ApiQuestionQuestion;
      'api::shop-setting.shop-setting': ApiShopSettingShopSetting;
      'api::user.user': ApiUserUser;
      'api::user-music.user-music': ApiUserMusicUserMusic;
    }
  }
}
