UPDATE "RestaurantSettings"
SET "name" = 'كأنه بيت'
WHERE "name" IN ('كانو بيت', 'كانه بيت');

UPDATE "MenuItem"
SET "name" = REPLACE(REPLACE("name", 'كانو', 'كأنه'), 'كانه', 'كأنه')
WHERE "name" LIKE '%كانو%' OR "name" LIKE '%كانه%';
