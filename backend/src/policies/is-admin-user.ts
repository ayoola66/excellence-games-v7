export default (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }

  return user.role?.type === "Admin_Authenticated";
};
