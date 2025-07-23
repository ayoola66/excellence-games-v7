export default () => ({
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "7d",
      },
      autoBuild: true,
      email: {
        reset_password: {
          display: "Email.template.reset_password",
          icon: "refresh",
          options: {
            from: {
              name: "Admin",
              email: "no-reply@strapi.io",
            },
            replyTo: {
              name: "Admin",
              email: "no-reply@strapi.io",
            },
            subject: "Reset password",
            text: "test",
            html: `<p>We heard that you lost your password. Sorry about that!</p>
<p>But don't worry! You can use the following link to reset your password:</p>
<p><%= URL %>?code=<%= TOKEN %></p>
<p>Thanks.</p>`,
          },
        },
      },
    },
    sync: true,
  },
  upload: {
    config: {
      provider: "local",
      providerOptions: {},
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
      sizeLimit: 250 * 1024 * 1024, // 250mb in bytes
    },
  },
});
