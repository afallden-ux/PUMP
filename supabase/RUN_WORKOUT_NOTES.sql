-- Run in Supabase SQL Editor — session notes on log + feed display.

alter table public.workout_logs
  add column if not exists notes text;

alter table public.workout_logs
  drop constraint if exists workout_logs_notes_length;

alter table public.workout_logs
  add constraint workout_logs_notes_length check (
    notes is null or char_length(trim(notes)) between 1 and 280
  );
