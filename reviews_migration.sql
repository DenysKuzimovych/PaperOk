-- Reviews shown on the homepage ("Отзиви").
-- Public visitors submit a review through /api/reviews (server, service role).
-- Nothing is shown publicly until an admin approves it in /admin/reviews.
-- Access goes only through the server (service role), like contact_inquiries,
-- so RLS is enabled with no anon policies.

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  author_name text        not null,
  rating      smallint     not null check (rating between 1 and 5),
  body        text        not null,
  status      text        not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  source      text        not null default 'form'
                check (source in ('form', 'instagram', 'manual')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists reviews_status_created_idx
  on public.reviews (status, created_at desc);

alter table public.reviews enable row level security;
-- No policies on purpose: anon/auth clients get no direct access.
-- The app reads/writes with the service-role key on the server only.

-- Optional: one real, anonymised review collected from Instagram DM, so the
-- homepage block is not empty on launch. Remove the "-- " to use it.
-- insert into public.reviews (author_name, rating, body, status, source) values
--   ('Клиент на PaperOK', 5,
--    'Благодаря Ви за бързата реакция, прекрасното отношение и професионализма! Всичко е изработено чудесно и съм сигурна, че гостите ще бъдат впечатлени.',
--    'approved', 'instagram');
