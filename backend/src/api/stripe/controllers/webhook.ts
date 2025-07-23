import { Strapi } from "@strapi/strapi";
import Stripe from "stripe";

export default {
  async handleWebhook(ctx) {
    try {
      const stripeService = strapi.service("api::stripe.stripe");
      const config = await stripeService.getActiveConfig();

      if (!config) {
        return ctx.throw(500, "Stripe configuration not found");
      }

      const stripe = await stripeService.getStripeInstance();
      const sig = ctx.request.headers["stripe-signature"];

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          ctx.request.body,
          sig,
          config.webhookSecret
        );
      } catch (err) {
        return ctx.throw(400, `Webhook Error: ${err.message}`);
      }

      try {
        switch (event.type) {
          case "product.created":
          case "product.updated":
            await stripeService.syncProduct(
              event.data.object as Stripe.Product
            );
            break;

          case "price.created":
          case "price.updated":
            await stripeService.syncPrice(event.data.object as Stripe.Price);
            break;

          case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            await stripeService.syncSubscription(
              event.data.object as Stripe.Subscription
            );

            // Update user subscription status
            const subscription = event.data.object as Stripe.Subscription;
            const user = await strapi.db
              .query("plugin::users-permissions.user")
              .findOne({
                where: { email: subscription.customer as string },
              });

            if (user) {
              await strapi.db.query("plugin::users-permissions.user").update({
                where: { id: user.id },
                data: {
                  playerSubscription:
                    subscription.status === "active" ? "Premium" : "Free",
                },
              });
            }
            break;

          case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;

            // Handle one-time payments
            if (session.mode === "payment") {
              // Create order record
              await strapi.db.query("api::order.order").create({
                data: {
                  orderNumber: session.id,
                  amount: session.amount_total / 100,
                  currency: session.currency.toUpperCase(),
                  status: "COMPLETED",
                  paymentMethod: "card",
                  user: session.metadata.userId,
                },
              });
            }
            break;
        }

        return { received: true };
      } catch (err) {
        return ctx.throw(500, `Error processing webhook: ${err.message}`);
      }
    } catch (err) {
      return ctx.throw(500, `Error processing webhook: ${err.message}`);
    }
  },
};
