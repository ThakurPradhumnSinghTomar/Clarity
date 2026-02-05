import { z } from "zod";

/* ===================== Common ===================== */

export const paginationParamSchema = z.object({
  params: z.object({
    page: z.string().regex(/^\d+$/),
  }),
});

/* ===================== Save Focus Session ===================== */

export const saveFocusSessionSchema = z.object({
  body: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    durationSec: z.number().int().positive(),
    tag: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
  }),
});

/* ===================== Leaderboard ===================== */
/* No body / params */
export const leaderboardSchema = z.object({});

/* ===================== Get Weekly Study Hours ===================== */

export const getWeeklyStudyHoursSchema = paginationParamSchema;

/* ===================== Get Current User Profile ===================== */

export const getCurrentUserProfileSchema = z.object({});

/* ===================== Update User Profile ===================== */

export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    image: z.string().url().optional(),
  }),
});

/* ===================== Ping ===================== */

export const pingSchema = z.object({});

/* ===================== Update Focusing ===================== */

export const updateFocusingSchema = z.object({
  body: z.object({
    isFocusing: z.boolean(),
  }),
});

/* ===================== Tags ===================== */

export const getTagsSchema = z.object({});

export const createTagSchema = z.object({
  body: z.object({
    tag: z.string().min(1),
  }),
});

/* ===================== Recent Focus Sessions ===================== */

export const recentFocusSessionsSchema = z.object({});

/* ===================== Weekly Study Hours By Tags ===================== */

export const weeklyStudyHoursByTagsSchema = paginationParamSchema;

/* ===================== Heatmap ===================== */

export const heatmapSchema = z.object({});

/* ===================== Analytics Overview ===================== */

export const analyticsOverviewSchema = z.object({});

/* ===================== Focus Insights ===================== */

export const focusInsightsSchema = z.object({});

/* ===================== Tag Intelligence ===================== */

export const tagIntelligenceSchema = paginationParamSchema;
