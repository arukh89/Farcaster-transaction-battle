-- Run these SQL commands in Supabase SQL editor to create the required tables.

create extension if not exists "uuid-ossp";

create table players (
  id uuid default uuid_generate_v4() primary key,
  fid text not null unique,
  displayName text not null,
  joined_at timestamp with time zone default now()
);

create table messages (
  id uuid default uuid_generate_v4() primary key,
  fid text not null references players(fid) on delete cascade,
  displayName text not null,
  text text not null,
  created_at timestamp with time zone default now()
);

create table leaderboard (
  id uuid default uuid_generate_v4() primary key,
  fid text not null references players(fid) on delete cascade,
  displayName text not null,
  score int default 0,
  updated_at timestamp with time zone default now()
);

create table predictions (
  id uuid default uuid_generate_v4() primary key,
  fid text not null references players(fid) on delete cascade,
  displayName text not null,
  block_height bigint,
  prediction text not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);
