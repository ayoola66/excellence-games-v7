import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
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
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
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
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
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
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
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
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
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
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
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
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
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
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
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
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
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
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiAdminUserAdminUser extends Schema.CollectionType {
  collectionName: 'admin_user_profiles';
  info: {
    description: 'Admin user profiles with role-based permissions';
    displayName: 'Admin User';
    pluralName: 'admin-users';
    singularName: 'admin-user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    adminType: Attribute.Enumeration<['SA', 'DEV', 'SH', 'CT', 'CS']> &
      Attribute.Required &
      Attribute.DefaultTo<'CS'>;
    badge: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::admin-user.admin-user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email & Attribute.Required & Attribute.Unique;
    fullName: Attribute.String & Attribute.Required;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    lastLogin: Attribute.DateTime;
    password: Attribute.Text & Attribute.Required;
    permissions: Attribute.JSON;
    profilePicture: Attribute.Media<'images'>;
    sessionToken: Attribute.Text;
    updatedAt: Attribute.DateTime;
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
    description: 'Admin-uploaded background music tracks for rotation';
    displayName: 'Background Music';
    pluralName: 'background-musics';
    singularName: 'background-music';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    audioFile: Attribute.Media<'audio'> & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::background-music.background-music',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    duration: Attribute.Integer;
    fileSize: Attribute.Integer;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    playCount: Attribute.Integer & Attribute.DefaultTo<0>;
    publishedAt: Attribute.DateTime;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::background-music.background-music',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    uploadedBy: Attribute.Relation<
      'api::background-music.background-music',
      'manyToOne',
      'api::admin-user.admin-user'
    >;
  };
}

export interface ApiCategoryCategory extends Schema.CollectionType {
  collectionName: 'categories';
  info: {
    description: 'Categories for straight trivia and nested game cards';
    displayName: 'Category';
    pluralName: 'categories';
    singularName: 'category';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    cardNumber: Attribute.Integer;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::category.category',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    difficulty: Attribute.Enumeration<['easy', 'medium', 'hard']> &
      Attribute.DefaultTo<'medium'>;
    game: Attribute.Relation<
      'api::category.category',
      'manyToOne',
      'api::game.game'
    >;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    name: Attribute.String & Attribute.Required;
    questionCount: Attribute.Integer & Attribute.DefaultTo<0>;
    questions: Attribute.Relation<
      'api::category.category',
      'oneToMany',
      'api::question.question'
    >;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    status: Attribute.Enumeration<['free', 'premium']> &
      Attribute.DefaultTo<'free'>;
    updatedAt: Attribute.DateTime;
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
    description: 'Trivia games with straight or nested categories';
    displayName: 'Game';
    pluralName: 'games';
    singularName: 'game';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    categories: Attribute.Relation<
      'api::game.game',
      'oneToMany',
      'api::category.category'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::game.game', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.Text;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    name: Attribute.String & Attribute.Required;
    questions: Attribute.Relation<
      'api::game.game',
      'oneToMany',
      'api::question.question'
    >;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    status: Attribute.Enumeration<['free', 'premium']> &
      Attribute.Required &
      Attribute.DefaultTo<'free'>;
    thumbnail: Attribute.Media<'images'>;
    totalQuestions: Attribute.Integer & Attribute.DefaultTo<0>;
    type: Attribute.Enumeration<['straight', 'nested']> &
      Attribute.Required &
      Attribute.DefaultTo<'straight'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::game.game', 'oneToOne', 'admin::user'> &
      Attribute.Private;
  };
}

export interface ApiOrderOrder extends Schema.CollectionType {
  collectionName: 'orders';
  info: {
    description: 'Customer orders and purchases';
    displayName: 'Order';
    pluralName: 'orders';
    singularName: 'order';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    billingAddress: Attribute.JSON;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currency: Attribute.String &
      Attribute.Required &
      Attribute.DefaultTo<'GBP'>;
    deliveredAt: Attribute.DateTime;
    grantedPremiumAccess: Attribute.Boolean & Attribute.DefaultTo<false>;
    notes: Attribute.Text;
    orderNumber: Attribute.String & Attribute.Required & Attribute.Unique;
    paymentMethod: Attribute.String & Attribute.DefaultTo<'stripe'>;
    paymentStatus: Attribute.Enumeration<
      ['pending', 'paid', 'failed', 'refunded', 'partially_refunded']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'pending'>;
    premiumExpiresAt: Attribute.DateTime;
    premiumGrantedAt: Attribute.DateTime;
    productDetails: Attribute.JSON & Attribute.Required;
    products: Attribute.Relation<
      'api::order.order',
      'manyToMany',
      'api::product.product'
    >;
    shippedAt: Attribute.DateTime;
    shipping: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    shippingAddress: Attribute.JSON;
    status: Attribute.Enumeration<
      ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'pending'>;
    stripeChargeId: Attribute.String;
    stripePaymentIntentId: Attribute.String;
    subtotal: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    tax: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    total: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    trackingNumber: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::order.order',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::order.order',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiProductProduct extends Schema.CollectionType {
  collectionName: 'products';
  info: {
    description: 'Shop products including board games and accessories';
    displayName: 'Product';
    pluralName: 'products';
    singularName: 'product';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    category: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.RichText & Attribute.Required;
    dimensions: Attribute.JSON;
    features: Attribute.JSON;
    grantsPremiumAccess: Attribute.Boolean & Attribute.DefaultTo<false>;
    images: Attribute.Media<'images', true>;
    isActive: Attribute.Boolean &
      Attribute.Required &
      Attribute.DefaultTo<true>;
    isFeatured: Attribute.Boolean & Attribute.DefaultTo<false>;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    premiumDurationMonths: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Attribute.DefaultTo<12>;
    price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    salePrice: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    shortDescription: Attribute.Text &
      Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    sku: Attribute.String & Attribute.Required & Attribute.Unique;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    specifications: Attribute.JSON;
    stock: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    tags: Attribute.JSON;
    type: Attribute.Enumeration<
      ['board_game', 'accessory', 'expansion', 'merchandise', 'other']
    > &
      Attribute.Required &
      Attribute.DefaultTo<'board_game'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::product.product',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    weight: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface ApiQuestionQuestion extends Schema.CollectionType {
  collectionName: 'questions';
  info: {
    description: 'Trivia questions with multiple choice answers';
    displayName: 'Question';
    pluralName: 'questions';
    singularName: 'question';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    category: Attribute.Relation<
      'api::question.question',
      'manyToOne',
      'api::category.category'
    >;
    correctAnswer: Attribute.Enumeration<
      ['option1', 'option2', 'option3', 'option4']
    > &
      Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::question.question',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    explanation: Attribute.Text;
    game: Attribute.Relation<
      'api::question.question',
      'manyToOne',
      'api::game.game'
    >;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    option1: Attribute.String & Attribute.Required;
    option2: Attribute.String & Attribute.Required;
    option3: Attribute.String & Attribute.Required;
    option4: Attribute.String & Attribute.Required;
    publishedAt: Attribute.DateTime;
    question: Attribute.Text & Attribute.Required;
    sortOrder: Attribute.Integer & Attribute.DefaultTo<0>;
    tags: Attribute.JSON;
    timesAnswered: Attribute.Integer & Attribute.DefaultTo<0>;
    timesCorrect: Attribute.Integer & Attribute.DefaultTo<0>;
    updatedAt: Attribute.DateTime;
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
    description: 'Shop configuration and payment settings';
    displayName: 'Shop Settings';
    pluralName: 'shop-settings';
    singularName: 'shop-setting';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    additionalBoardGamePrice: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<25>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::shop-setting.shop-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currency: Attribute.String & Attribute.DefaultTo<'GBP'>;
    firstBoardGamePrice: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<40>;
    freeShippingThreshold: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<50>;
    maintenanceMessage: Attribute.Text;
    maintenanceMode: Attribute.Boolean & Attribute.DefaultTo<false>;
    privacyPolicy: Attribute.RichText;
    returnPolicy: Attribute.RichText;
    shopEnabled: Attribute.Boolean & Attribute.DefaultTo<true>;
    standardShippingCost: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<5.99>;
    stripePublishableKey: Attribute.String;
    stripeSecretKey: Attribute.Password;
    stripeWebhookSecret: Attribute.Password;
    taxRate: Attribute.Decimal &
      Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0.2>;
    termsAndConditions: Attribute.RichText;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::shop-setting.shop-setting',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiUserMusicUserMusic extends Schema.CollectionType {
  collectionName: 'user_music_tracks';
  info: {
    description: 'User-uploaded music tracks for premium users';
    displayName: 'User Music';
    pluralName: 'user-musics';
    singularName: 'user-music';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    audioFile: Attribute.Media<'audio'> & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::user-music.user-music',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    duration: Attribute.Integer;
    fileSize: Attribute.Integer;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    isPremiumUser: Attribute.Boolean & Attribute.DefaultTo<false>;
    playCount: Attribute.Integer & Attribute.DefaultTo<0>;
    publishedAt: Attribute.DateTime;
    title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::user-music.user-music',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    uploadSlot: Attribute.Integer & Attribute.DefaultTo<1>;
    user: Attribute.Relation<
      'api::user-music.user-music',
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Attribute.Required;
  };
}

export interface ApiUserUser extends Schema.CollectionType {
  collectionName: 'game_users';
  info: {
    description: 'Extended user profiles for the trivia platform';
    displayName: 'Game User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    achievements: Attribute.JSON;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::user.user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email & Attribute.Required & Attribute.Unique;
    gamesCompleted: Attribute.Integer & Attribute.DefaultTo<0>;
    gameStats: Attribute.JSON;
    isActive: Attribute.Boolean & Attribute.DefaultTo<true>;
    lastGamePlayed: Attribute.DateTime;
    lastLogin: Attribute.DateTime;
    preferences: Attribute.JSON;
    profile: Attribute.Component<'user.profile'>;
    publishedAt: Attribute.DateTime;
    registrationDate: Attribute.DateTime;
    subscriptionExpiry: Attribute.DateTime;
    subscriptionType: Attribute.Enumeration<['free', 'premium']> &
      Attribute.Required &
      Attribute.DefaultTo<'free'>;
    totalScore: Attribute.Integer & Attribute.DefaultTo<0>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::user.user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String & Attribute.Required & Attribute.Unique;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
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
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
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
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
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
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
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
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
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
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
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
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
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
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
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
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    address: Attribute.Text;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    fullName: Attribute.String;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    phone: Attribute.String;
    premiumExpiry: Attribute.Date;
    provider: Attribute.String;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    subscriptionStatus: Attribute.Enumeration<['free', 'premium']> &
      Attribute.Required &
      Attribute.DefaultTo<'free'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::admin-user.admin-user': ApiAdminUserAdminUser;
      'api::background-music.background-music': ApiBackgroundMusicBackgroundMusic;
      'api::category.category': ApiCategoryCategory;
      'api::game.game': ApiGameGame;
      'api::order.order': ApiOrderOrder;
      'api::product.product': ApiProductProduct;
      'api::question.question': ApiQuestionQuestion;
      'api::shop-setting.shop-setting': ApiShopSettingShopSetting;
      'api::user-music.user-music': ApiUserMusicUserMusic;
      'api::user.user': ApiUserUser;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
