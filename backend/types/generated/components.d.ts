import type { Schema, Attribute } from '@strapi/strapi';

export interface ElementsStatItem extends Schema.Component {
  collectionName: 'components_elements_stat_items';
  info: {
    displayName: 'Stat Item';
    description: 'Individual statistic item';
  };
  attributes: {
    label: Attribute.String & Attribute.Required;
    value: Attribute.String & Attribute.Required;
    suffix: Attribute.String;
  };
}

export interface ElementsValueItem extends Schema.Component {
  collectionName: 'components_elements_value_items';
  info: {
    displayName: 'Value Item';
    description: 'Individual value item with icon';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text & Attribute.Required;
    icon: Attribute.Enumeration<
      ['excellence', 'community', 'innovation', 'leadership', 'growth']
    > &
      Attribute.Required;
  };
}

export interface MetaSeo extends Schema.Component {
  collectionName: 'components_meta_seos';
  info: {
    displayName: 'SEO';
    description: 'SEO metadata for pages';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text & Attribute.Required;
    keywords: Attribute.Text;
    robots: Attribute.String & Attribute.DefaultTo<'index, follow'>;
    canonicalURL: Attribute.String;
  };
}

export interface QuizOption extends Schema.Component {
  collectionName: 'components_quiz_options';
  info: {
    displayName: 'Option';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    text: Attribute.String & Attribute.Required;
  };
}

export interface SectionsHero extends Schema.Component {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero';
    description: 'Hero section with title, subtitle, and background';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    subtitle: Attribute.Text;
    backgroundImage: Attribute.Media;
    ctaText: Attribute.String;
    ctaLink: Attribute.String;
  };
}

export interface SectionsLegacy extends Schema.Component {
  collectionName: 'components_sections_legacies';
  info: {
    displayName: 'Legacy';
    description: 'Legacy section with statistics';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text & Attribute.Required;
    stats: Attribute.Component<'elements.stat-item', true> &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
  };
}

export interface SectionsMission extends Schema.Component {
  collectionName: 'components_sections_missions';
  info: {
    displayName: 'Mission';
    description: 'Mission section content';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    content: Attribute.RichText & Attribute.Required;
    image: Attribute.Media;
  };
}

export interface SectionsValues extends Schema.Component {
  collectionName: 'components_sections_values';
  info: {
    displayName: 'Values';
    description: 'Core values section';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    values: Attribute.Component<'elements.value-item', true> &
      Attribute.Required &
      Attribute.SetMinMax<{
        min: 1;
      }>;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
    description: 'SEO metadata for pages';
  };
  attributes: {
    metaTitle: Attribute.String & Attribute.Required;
    metaDescription: Attribute.Text & Attribute.Required;
    metaKeywords: Attribute.Text;
    metaRobots: Attribute.String & Attribute.DefaultTo<'index, follow'>;
    canonicalURL: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'elements.stat-item': ElementsStatItem;
      'elements.value-item': ElementsValueItem;
      'meta.seo': MetaSeo;
      'quiz.option': QuizOption;
      'sections.hero': SectionsHero;
      'sections.legacy': SectionsLegacy;
      'sections.mission': SectionsMission;
      'sections.values': SectionsValues;
      'shared.seo': SharedSeo;
    }
  }
}
