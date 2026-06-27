insert into public.asset (asset_type, make, model, alias, plate, build_year)
select v.asset_type, v.make, v.model, v.alias, v.plate, v.build_year
from (
  values
    ('Car'::citext, 'Ford'::citext, 'Fiests'::citext, 'Gary''s Car'::citext, 'BGP001'::citext, 2021),
    ('Car'::citext, 'Ford'::citext, 'Fiests'::citext, 'Bert''s Car'::citext, 'BGP002'::citext, 2022)
) as v(asset_type, make, model, alias, plate, build_year)
where not exists (
    select 1
    from public.asset a
    where a.plate = v.plate
  );