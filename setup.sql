-- Run this whole file once in Supabase > SQL Editor
create table profiles(id uuid primary key references auth.users on delete cascade, org text, role text default 'partner');
create table programs(id bigint generated always as identity primary key, name text not null, start_date date, end_date date, outline text);
create table courses(id bigint generated always as identity primary key, program_id bigint references programs on delete cascade, name text not null, outline text);
create table assessments(id bigint generated always as identity primary key, course_id bigint references courses on delete cascade, name text not null, max_score numeric default 100);
create table students(id bigint generated always as identity primary key, partner_id uuid default auth.uid() references profiles, name text, email text, phone text, address text, dtc_id text, program_id bigint references programs, status text default 'Submitted', final_exam text default 'Not Started', created_at timestamptz default now());
create table grades(student_id bigint references students on delete cascade, assessment_id bigint references assessments on delete cascade, score numeric, grade text, primary key(student_id,assessment_id));
create table swaps(id bigint generated always as identity primary key, partner_id uuid default auth.uid(), student_id bigint references students on delete cascade, new_name text, new_email text, new_phone text, reason text, status text default 'Pending', created_at timestamptz default now());

create function is_admin() returns boolean language sql security definer as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;
create function new_user() returns trigger language plpgsql security definer as $$ begin insert into profiles(id,org) values(new.id,new.raw_user_meta_data->>'org'); return new; end $$;
create trigger on_signup after insert on auth.users for each row execute function new_user();

alter table profiles enable row level security; alter table programs enable row level security; alter table courses enable row level security;
alter table assessments enable row level security; alter table students enable row level security; alter table grades enable row level security; alter table swaps enable row level security;

create policy p1 on profiles for select using (id=auth.uid() or is_admin());
create policy p2 on programs for select using (auth.uid() is not null);
create policy p3 on courses for select using (auth.uid() is not null);
create policy p4 on assessments for select using (auth.uid() is not null);
create policy a1 on programs for all using (is_admin());
create policy a2 on courses for all using (is_admin());
create policy a3 on assessments for all using (is_admin());
create policy s1 on students for select using (partner_id=auth.uid() or is_admin());
create policy s2 on students for insert with check (partner_id=auth.uid());
create policy s3 on students for update using (is_admin());
create policy s4 on students for delete using (is_admin());
create policy g1 on grades for select using (is_admin() or exists(select 1 from students s where s.id=student_id and s.partner_id=auth.uid()));
create policy g2 on grades for all using (is_admin());
create policy w1 on swaps for select using (partner_id=auth.uid() or is_admin());
create policy w2 on swaps for insert with check (partner_id=auth.uid());
create policy w3 on swaps for update using (is_admin());

-- AFTER you create your own admin account (see guide), run:
-- update profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');
