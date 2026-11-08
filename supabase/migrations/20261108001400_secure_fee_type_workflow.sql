-- Fee types are reference data behind RLS. Keep their write path consistent
-- with fee records and payments: administrators use this checked RPC instead
-- of a direct table insert that RLS correctly rejects.
create or replace function public.save_fee_type(
  requested_fee_type_id uuid,
  requested_name text,
  requested_description text,
  requested_default_amount numeric,
  requested_frequency text,
  requested_is_active boolean,
  requested_academic_year_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  saved_fee_type_id uuid;
begin
  if not (select private.is_admin()) then
    raise exception 'Only administrators can manage fee types';
  end if;

  if char_length(trim(coalesce(requested_name, ''))) not between 1 and 100 then
    raise exception 'Enter a fee type name between 1 and 100 characters';
  end if;
  if requested_default_amount is null or requested_default_amount < 0 then
    raise exception 'Fee amount cannot be negative';
  end if;
  if requested_frequency not in ('one_time', 'monthly', 'termly', 'annual') then
    raise exception 'Choose a valid fee frequency';
  end if;

  if requested_fee_type_id is null then
    insert into public.fee_types(name, description, default_amount, frequency, is_active, academic_year_id)
    values (
      trim(requested_name),
      nullif(trim(coalesce(requested_description, '')), ''),
      requested_default_amount,
      requested_frequency,
      coalesce(requested_is_active, true),
      requested_academic_year_id
    )
    returning id into saved_fee_type_id;
  else
    update public.fee_types
    set name = trim(requested_name),
        description = nullif(trim(coalesce(requested_description, '')), ''),
        default_amount = requested_default_amount,
        frequency = requested_frequency,
        is_active = coalesce(requested_is_active, true),
        academic_year_id = requested_academic_year_id
    where id = requested_fee_type_id
    returning id into saved_fee_type_id;

    if saved_fee_type_id is null then
      raise exception 'Fee type was not found';
    end if;
  end if;

  return saved_fee_type_id;
end;
$$;

grant execute on function public.save_fee_type(uuid, text, text, numeric, text, boolean, uuid) to authenticated;
