# Robust Database, RBAC, and Admin Implementation Plan

## 1. User & Admin Model and RBAC

### A. Strapi Admin (Backend)
- **Primary Admin:** `ayoola@ayoola.me` (Strapi backend admin, not exposed to frontend)
- **RBAC Admins (Frontend, at :3000/admin):**
  - Users: `superadmin@elitegames.com`, `admin@elitegames.com`, `dev@elitegames.com`, `content@elitegames.com`
  - Password for all: `Passw0rd`
  - **Roles:** Superadmin, Admin, Developer, Content Manager (can be extended)
  - **Superadmin** can edit everything (questions, games, categories, shop items, users, etc.)
  - **Other Admins:** All can CRUD everything for now for speed; can be fine-tuned later.

### B. User Model (Free & Premium)
- **Fields:**
  - `firstname`, `lastname`, `nickname`, `address`, `email`, `phone`, `userType` (free/premium), `becamePremiumAt`, `subscriptionExpiryDate`, `billingDetails` (premium only), `deliveryDetails` (premium only), `profilePicture`, `createdAt`, `updatedAt`
- **Editability:**
  - **Premium users:** Can edit all their details, including billing and delivery.
  - **Free users:** Can edit basic info (name, nickname, email, phone); limited until upgrade.
- **User CRUD:** Admins can manage all users from the frontend admin.

### C. User Profile Model
- **One-to-one** with User.
- Holds extended info and activity logs.

### D. Activity Model
- Logs all user/admin actions (registration, edits, purchases, upgrades, etc.)
- Fields: `action`, `user`, `timestamp`, `details` (json)

### E. Shop/Store
- **Shop Items:** Products, Orders, Coupons, etc. All CRUD by Superadmin/Admins.

---

## 2. Branding & Media
- **Logo:** `/public/logo.png` (from `main-logo.png`)
- **Favicon:** `/public/favicon.ico`
- **All references updated** in code and admin config.

---

## 3. Admin Dashboard
- **Superadmin** can see and edit everything.
- **Widgets:** User stats, revenue, orders, active games, premium users, session time, active users, recent activity.
- **Recent Activity:** Pulled from Activity model.

---

## 4. Security & Best Practices
- **Passwords:** All test accounts use `Passw0rd` for now; enforce strong passwords before production.
- **RBAC:** Use Strapi’s built-in roles for backend, custom roles for frontend as needed.
- **Input Validation:** All user input validated and sanitised.
- **Audit Trail:** Activity model for all critical actions.

---

## 5. Additional Recommendations
- **Email Verification:** Add before production for all users.
- **Password Reset:** Implement for all user types.
- **Profile Picture:** Allow upload for users.
- **Soft Delete:** Consider for users and content (for GDPR and audit).
- **API Rate Limiting:** Add before production.
- **2FA for Admins:** Add before production.

---

## 6. Implementation Steps

1. **Backup & Commit** (already done)
2. **Update Branding/Media** (done)
3. **Update/Create Models:**
   - User (fields, relations, editability)
   - User Profile (extended info, activity)
   - Activity (logging)
   - Shop/Store (products, orders, coupons)
4. **Seed Admins & Users:**
   - Create all required admin and user accounts with `Passw0rd`
5. **Frontend Admin CRUD:**
   - Ensure Superadmin can CRUD everything
   - All admin roles can manage all entities for now
6. **Testing:**
   - Test all CRUD, login, edit, and dashboard features
7. **Document:**
   - Update README and in-app docs

---

## 7. Anything Missing?
- If you want user avatars, add `profilePicture` to User/Profile.
- If you want to support social login, plan for OAuth integration.
- If you want notifications (email/SMS), add notification preferences to User.
- If you want GDPR compliance, add consent fields and data export/delete endpoints.

---

*This plan is designed for robust, scalable, and maintainable development, and will be updated as new requirements arise.*
