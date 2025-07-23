import isAuthenticated from "./policies/is-authenticated";
import isAdminUser from "./policies/is-admin-user";
import checkAdminPermission from "./policies/check-admin-permission";
import isPremiumUser from "./policies/is-premium-user";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }) {
    // Temporarily disabled all policies for testing
    /*
    strapi.container
      .get("policies")
      .add("global::is-authenticated", isAuthenticated);
    strapi.container.get("policies").add("global::is-admin-user", isAdminUser);
    strapi.container
      .get("policies")
      .add("global::check-admin-permission", checkAdminPermission);
    strapi.container
      .get("policies")
      .add("global::is-premium-user", isPremiumUser);
    */
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap({ strapi }) {},
};
