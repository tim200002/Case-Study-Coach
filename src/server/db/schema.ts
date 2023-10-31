// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  bigint,
  text,
  int,
  json,
  mysqlEnum,
  mysqlTableCreator,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `frontend_${name}`);

export const caseSessions = mysqlTable("case_sessions", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  caseId: int("case_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  liveStructure: json("live_structure").notNull(),
  state: mysqlEnum("state", [
    "NOT_STARTED",
    "RUNNING",
    "TRANSITION_PHASE_1",
    "TRANSITION_PHASE_2",
    "TRANSITION_PHASE_3",
    "COMPLETED",
  ])
    .default("NOT_STARTED")
    .notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const caseSessionsRelationship = relations(
  caseSessions,
  ({ many, one }) => ({
    case: one(cases, {
      fields: [caseSessions.caseId],
      references: [cases.id],
    }),
    conversationComponents: many(conversationComponents),
  }),
);

export type CaseSession = typeof caseSessions.$inferSelect;

export const conversationComponents = mysqlTable(
  "conversation_components",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    caseSessionId: int("case_session_id").notNull(),
    type: mysqlEnum("type", [
      "CANDIDATE",
      "INTERVIEWER",
      "COMMAND",
      "SYSTEM",
    ]).notNull(),
    sectionId: varchar("section_id", { length: 128 }).notNull(),
    content: text("content").notNull(),
    isVolatile: boolean("is_volatile").default(false).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  // (table) => {
  //   return {
  //     createdAtIdx: index("created_at_idx").on(table.createdAt),
  //   };
  // },
);

export const conversationComponentsRelationship = relations(
  conversationComponents,
  ({ one }) => ({
    case: one(caseSessions, {
      fields: [conversationComponents.caseSessionId],
      references: [caseSessions.id],
    }),
  }),
);

export type ConversationComponent = typeof conversationComponents.$inferSelect;
export type ConversationComponentType = ConversationComponent["type"];

export const cases = mysqlTable("cases", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  caseContent: json("case_content").notNull(),
  caseTitle: varchar("case_title", { length: 255 }).notNull(),
  caseDescription: varchar("case_description", { length: 1024 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  difficulty: mysqlEnum("difficulty", ["EASY", "MEDIUM", "HARD"]).notNull(),
  sector: mysqlEnum("sector", ["TECH", "FINANCE", "CONSULTING", "OTHER"]),
  function: mysqlEnum("function", [
    "DIGITAL",
    "MARKETING",
    "GROWTH",
    "INVESTMENT",
    "M&A",
  ]),
});

export type Case = typeof cases.$inferSelect;
