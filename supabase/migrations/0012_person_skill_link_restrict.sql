-- Switch person_skill_link FKs from cascade to restrict: deleting a person
-- or skill that still has assignments is now blocked rather than silently
-- removing the links.
alter table public.person_skill_link
  drop constraint person_skill_link_person_id_fkey,
  drop constraint person_skill_link_skill_id_fkey;

alter table public.person_skill_link
  add constraint person_skill_link_person_id_fkey
    foreign key (person_id) references public.person (id) on delete restrict,
  add constraint person_skill_link_skill_id_fkey
    foreign key (skill_id) references public.skill (id) on delete restrict;
