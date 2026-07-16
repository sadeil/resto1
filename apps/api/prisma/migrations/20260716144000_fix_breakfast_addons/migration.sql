-- Keep only the two add-ons present in the supplied breakfast menu.
DELETE FROM "AddOn"
WHERE "category" = 'الفطور'
  AND "name" NOT IN ('سجق', 'بيضة');

-- Halloumi pesto is the sole breakfast item that does not accept add-ons.
DELETE FROM "_AddOnToMenuItem"
WHERE "B" = 'breakfast-sandwich-1'
  AND "A" IN (
    SELECT "id" FROM "AddOn" WHERE "category" = 'الفطور'
  );
