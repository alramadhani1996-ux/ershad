-- Ershad Supabase backend schema
-- Run this file in the Supabase SQL editor before using the application.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'guide', 'company');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.request_status as enum ('pending', 'approved', 'rejected', 'matched', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  role public.user_role not null,
  status public.approval_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guide_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  city text not null,
  languages text[] not null default '{}',
  specialties text[] not null default '{}',
  experience_years integer not null default 0 check (experience_years >= 0),
  bio text not null,
  hourly_rate numeric(10, 2),
  license_file_path text,
  status public.approval_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  company_name text not null,
  registration_number text not null,
  industry text not null,
  website text,
  address text not null,
  document_file_path text,
  status public.approval_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_guide_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  location text not null,
  requested_language text not null,
  specialties text[] not null default '{}',
  starts_on date,
  budget numeric(12, 2),
  attachment_file_path text,
  status public.request_status not null default 'pending',
  assigned_guide_id uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guide_applications_status_idx on public.guide_applications(status);
create index company_applications_status_idx on public.company_applications(status);
create index company_guide_requests_company_idx on public.company_guide_requests(company_id);
create index company_guide_requests_status_idx on public.company_guide_requests(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_guide_applications_updated_at before update on public.guide_applications for each row execute function public.set_updated_at();
create trigger set_company_applications_updated_at before update on public.company_applications for each row execute function public.set_updated_at();
create trigger set_company_guide_requests_updated_at before update on public.company_guide_requests for each row execute function public.set_updated_at();

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'approved'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New user'),
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'company'),
    case when coalesce(new.raw_user_meta_data ->> 'role', '') = 'admin' then 'approved'::public.approval_status else 'pending'::public.approval_status end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.guide_applications enable row level security;
alter table public.company_applications enable row level security;
alter table public.company_guide_requests enable row level security;

create policy "Profiles are visible to their owners and admins"
  on public.profiles for select
  using (id = auth.uid() or public.current_user_is_admin());

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Guide applications are visible to owner and admins"
  on public.guide_applications for select
  using (user_id = auth.uid() or public.current_user_is_admin());

create policy "Guides can submit their own application"
  on public.guide_applications for insert
  with check (user_id = auth.uid());

create policy "Admins can review guide applications"
  on public.guide_applications for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Company applications are visible to owner and admins"
  on public.company_applications for select
  using (user_id = auth.uid() or public.current_user_is_admin());

create policy "Companies can submit their own application"
  on public.company_applications for insert
  with check (user_id = auth.uid());

create policy "Admins can review company applications"
  on public.company_applications for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy "Companies can read their requests and admins can read all"
  on public.company_guide_requests for select
  using (company_id = auth.uid() or assigned_guide_id = auth.uid() or public.current_user_is_admin());

create policy "Approved companies can create guide requests"
  on public.company_guide_requests for insert
  with check (
    company_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'company'
        and status = 'approved'
    )
  );

create policy "Admins can review guide requests"
  on public.company_guide_requests for update
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

insert into storage.buckets (id, name, public)
values
  ('guide-documents', 'guide-documents', false),
  ('company-documents', 'company-documents', false),
  ('request-attachments', 'request-attachments', false)
on conflict (id) do nothing;

create policy "Users can upload guide documents into their folder"
  on storage.objects for insert
  with check (bucket_id = 'guide-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload company documents into their folder"
  on storage.objects for insert
  with check (bucket_id = 'company-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload request attachments into their folder"
  on storage.objects for insert
  with check (bucket_id = 'request-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners and admins can read private uploads"
  on storage.objects for select
  using (
    bucket_id in ('guide-documents', 'company-documents', 'request-attachments')
    and ((storage.foldername(name))[1] = auth.uid()::text or public.current_user_is_admin())
  );

-- To create the first admin, sign up once and then run:
-- update public.profiles set role = 'admin', status = 'approved' where email = 'admin@example.com';
