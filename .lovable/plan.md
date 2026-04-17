

## Fix Dashboard to show real data

The Dashboard currently uses `CURRENT_USER` and `MOCK_RESULTS` from `mockData.ts` — that's why it shows fake stats and a "Recent Exams" list even though you've never taken one. The real data already lives in the `exam_results` table and the user's `profiles` row.

### Changes to `src/pages/Dashboard.tsx`

1. **Replace mock user with real auth + profile data**
   - Use `useAuth()` to get the logged-in user.
   - Fetch the user's `profiles` row for `display_name` and `grade` (instead of hardcoded `CURRENT_USER`).
   - Default the grade selector to the profile's grade; saving a new selection updates `profiles.grade`.

2. **Compute stats from real `exam_results`**
   - Query `exam_results` filtered by `user_id`.
   - Derive:
     - **Total Points** = sum of `points`
     - **Exams Done** = row count
     - **Accuracy** = average of `percentage` (rounded)
     - **Rank Points** = same as Total Points (drives rank tier)
   - Show `0` / `0%` cleanly when the user has no results yet.

3. **Recent Exams = real recent rows**
   - Show the latest 5 rows from `exam_results` for this user (ordered by `created_at desc`), using `subject_name` and a formatted date.
   - If empty, show a friendly empty state: "No exams yet — take your first one!" with a link to `/exams`.

4. **Greeting name**
   - Use `profile.display_name` (fall back to email prefix, then "Student").

### Subject grid
- Keep using `getSubjectGroupsForGrade(grade)` — that's curriculum config, not fake user data, so it stays.

### Files touched
- `src/pages/Dashboard.tsx` — rewrite data sources (no more `CURRENT_USER` / `MOCK_RESULTS` imports).

No DB schema changes needed — `exam_results` and `profiles` already have everything.

