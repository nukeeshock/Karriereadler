import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export enum UserRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner'
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  birthDate: date('birth_date'),
  street: varchar('street', { length: 255 }),
  houseNumber: varchar('house_number', { length: 20 }),
  zipCode: varchar('zip_code', { length: 20 }),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default(UserRole.MEMBER),
  cvCredits: integer('cv_credits').notNull().default(0),
  letterCredits: integer('letter_credits').notNull().default(0),
  emailVerified: boolean('email_verified').notNull().default(false),
  verificationToken: text('verification_token'),
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  passwordResetToken: text('password_reset_token'),
  passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const stripeEvents = pgTable('stripe_events', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 255 }).notNull().unique(),
  checkoutSessionId: varchar('checkout_session_id', { length: 255 }).unique(),
  type: varchar('type', { length: 100 }).notNull(),
  productType: varchar('product_type', { length: 50 }),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  handled: boolean('handled').notNull().default(false)
});

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  visitorId: varchar('visitor_id', { length: 64 }).notNull(),
  sessionId: varchar('session_id', { length: 64 }).notNull(),
  page: varchar('page', { length: 255 }).notNull(),
  event: varchar('event', { length: 50 }).notNull().default('pageview'),
  durationMs: integer('duration_ms'),
  isNewVisitor: boolean('is_new_visitor').default(false),
  isNewSession: boolean('is_new_session').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Order Requests - Replaces credit-based system
export enum ProductType {
  CV = 'CV',
  COVER_LETTER = 'COVER_LETTER',
  BUNDLE = 'BUNDLE'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  READY_FOR_PROCESSING = 'READY_FOR_PROCESSING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export const orderRequests = pgTable('order_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),

  productType: varchar('product_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default(OrderStatus.PENDING_PAYMENT),

  // Customer info from pre-order form
  customerName: varchar('customer_name', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 100 }),

  // Basic info from pre-order (JSON)
  basicInfo: jsonb('basic_info'),

  // Complete questionnaire data (filled after payment)
  formData: jsonb('form_data'),

  // Stripe references
  stripeSessionId: varchar('stripe_session_id', { length: 255 }).unique(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),

  // Finished file (uploaded by admin when order is completed)
  finishedFileUrl: text('finished_file_url'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  cvRequests: many(cvRequests),
  letterRequests: many(letterRequests),
  orderRequests: many(orderRequests),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// CV Requests Table
export const cvRequests = pgTable('cv_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('offen'),

  // Personal Data
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  birthDate: varchar('birth_date', { length: 50 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }).notNull(),

  // Address
  street: varchar('street', { length: 255 }),
  houseNumber: varchar('house_number', { length: 20 }),
  zipCode: varchar('zip_code', { length: 20 }),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),

  // Complex data as JSON
  workExperience: text('work_experience'), // JSON array
  education: text('education'), // JSON array
  skills: text('skills'), // JSON object
  other: text('other'), // JSON object (certificates, license, availability)

  // Photo
  photoPath: text('photo_path'),

  // Optional job description
  jobDescription: text('job_description'),
  language: varchar('language', { length: 50 }).default('Deutsch'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Cover Letter Requests Table
export const letterRequests = pgTable('letter_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('offen'),

  // Target Position
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  jobCountry: varchar('job_country', { length: 100 }),
  jobPostingUrl: text('job_posting_url'),
  jobDescriptionText: text('job_description_text'),

  // Personal Info for Letter
  experiencesToHighlight: text('experiences_to_highlight'),
  strengths: text('strengths'),
  additionalNotes: text('additional_notes'),

  // Reference to existing CV
  cvRequestId: integer('cv_request_id').references(() => cvRequests.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const cvRequestsRelations = relations(cvRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [cvRequests.userId],
    references: [users.id],
  }),
  letterRequests: many(letterRequests),
}));

export const letterRequestsRelations = relations(letterRequests, ({ one }) => ({
  user: one(users, {
    fields: [letterRequests.userId],
    references: [users.id],
  }),
  cvRequest: one(cvRequests, {
    fields: [letterRequests.cvRequestId],
    references: [cvRequests.id],
  }),
}));

export const orderRequestsRelations = relations(orderRequests, ({ one }) => ({
  user: one(users, {
    fields: [orderRequests.userId],
    references: [users.id],
  }),
}));

// Types
export type CvRequest = typeof cvRequests.$inferSelect;
export type NewCvRequest = typeof cvRequests.$inferInsert;
export type LetterRequest = typeof letterRequests.$inferSelect;
export type NewLetterRequest = typeof letterRequests.$inferInsert;
export type OrderRequest = typeof orderRequests.$inferSelect;
export type NewOrderRequest = typeof orderRequests.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

export enum RequestStatus {
  OFFEN = 'offen',
  IN_BEARBEITUNG = 'in_bearbeitung',
  FERTIG = 'fertig',
}
