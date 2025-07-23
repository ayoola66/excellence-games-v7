export default {
  routes: [
    {
      method: "POST",
      path: "/stripe/webhook",
      handler: "webhook.handleWebhook",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
