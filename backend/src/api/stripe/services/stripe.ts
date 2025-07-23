import Stripe from "stripe";
import { Strapi } from "@strapi/strapi";

interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  accountId: string;
  defaultCurrency: string;
  billingPortalConfigId?: string;
}

export default ({ strapi }: { strapi: Strapi }) => ({
  async getActiveConfig(): Promise<StripeConfig | null> {
    const config = await strapi.db
      .query("api::stripe-config.stripe-config")
      .findOne({
        where: {
          isActive: true,
          environment: process.env.NODE_ENV || "development",
        },
      });
    return config;
  },

  async getStripeInstance(): Promise<Stripe> {
    const config = await this.getActiveConfig();
    if (!config) {
      throw new Error("No active Stripe configuration found");
    }
    return new Stripe(config.secretKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  },

  async syncProduct(stripeProduct: Stripe.Product) {
    const existingProduct = await strapi.db
      .query("api::stripe-product.stripe-product")
      .findOne({
        where: { stripeId: stripeProduct.id },
      });

    const data = {
      name: stripeProduct.name,
      description: stripeProduct.description,
      stripeId: stripeProduct.id,
      active: stripeProduct.active,
      metadata: stripeProduct.metadata,
      type: stripeProduct.type,
      features: stripeProduct.features,
    };

    if (existingProduct) {
      return await strapi.db
        .query("api::stripe-product.stripe-product")
        .update({
          where: { id: existingProduct.id },
          data,
        });
    } else {
      return await strapi.db
        .query("api::stripe-product.stripe-product")
        .create({
          data,
        });
    }
  },

  async syncPrice(stripePrice: Stripe.Price) {
    const existingPrice = await strapi.db
      .query("api::stripe-price.stripe-price")
      .findOne({
        where: { stripeId: stripePrice.id },
      });

    const product = await strapi.db
      .query("api::stripe-product.stripe-product")
      .findOne({
        where: { stripeId: stripePrice.product as string },
      });

    if (!product) {
      throw new Error(`Product not found for price ${stripePrice.id}`);
    }

    const data = {
      stripeId: stripePrice.id,
      product: product.id,
      active: stripePrice.active,
      currency: stripePrice.currency,
      unitAmount: stripePrice.unit_amount,
      type: stripePrice.type,
      interval: stripePrice.recurring?.interval,
      intervalCount: stripePrice.recurring?.interval_count,
      trialPeriodDays: stripePrice.recurring?.trial_period_days,
      metadata: stripePrice.metadata,
      nickname: stripePrice.nickname,
    };

    if (existingPrice) {
      return await strapi.db.query("api::stripe-price.stripe-price").update({
        where: { id: existingPrice.id },
        data,
      });
    } else {
      return await strapi.db.query("api::stripe-price.stripe-price").create({
        data,
      });
    }
  },

  async syncSubscription(stripeSubscription: Stripe.Subscription) {
    const existingSubscription = await strapi.db
      .query("api::stripe-subscription.stripe-subscription")
      .findOne({
        where: { stripeId: stripeSubscription.id },
      });

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email: stripeSubscription.customer as string },
      });

    if (!user) {
      throw new Error(
        `User not found for subscription ${stripeSubscription.id}`
      );
    }

    const price = await strapi.db
      .query("api::stripe-price.stripe-price")
      .findOne({
        where: { stripeId: stripeSubscription.items.data[0].price.id },
      });

    if (!price) {
      throw new Error(
        `Price not found for subscription ${stripeSubscription.id}`
      );
    }

    const data = {
      stripeId: stripeSubscription.id,
      user: user.id,
      price: price.id,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000
      ),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
      endedAt: stripeSubscription.ended_at
        ? new Date(stripeSubscription.ended_at * 1000)
        : null,
      trialStart: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000)
        : null,
      trialEnd: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      metadata: stripeSubscription.metadata,
    };

    if (existingSubscription) {
      return await strapi.db
        .query("api::stripe-subscription.stripe-subscription")
        .update({
          where: { id: existingSubscription.id },
          data,
        });
    } else {
      return await strapi.db
        .query("api::stripe-subscription.stripe-subscription")
        .create({
          data,
        });
    }
  },

  async createBillingPortalSession(userId: number): Promise<string> {
    const stripe = await this.getStripeInstance();
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: userId },
      });

    if (!user) {
      throw new Error("User not found");
    }

    const config = await this.getActiveConfig();
    const returnUrl = `${process.env.FRONTEND_URL}/dashboard/settings`;

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
      configuration: config?.billingPortalConfigId,
    });

    return session.url;
  },

  async createCheckoutSession(
    priceId: string,
    userId: number,
    mode: "payment" | "subscription"
  ): Promise<string> {
    const stripe = await this.getStripeInstance();
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: userId },
      });

    if (!user) {
      throw new Error("User not found");
    }

    const price = await strapi.db
      .query("api::stripe-price.stripe-price")
      .findOne({
        where: { id: priceId },
        populate: ["product"],
      });

    if (!price) {
      throw new Error("Price not found");
    }

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      mode,
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.stripeId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/settings`,
      metadata: {
        userId: user.id,
        priceId: price.id,
        productId: price.product.id,
      },
    });

    return session.url;
  },
});
