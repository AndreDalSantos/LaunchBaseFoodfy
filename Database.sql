CREATE TABLE "recipes" (
  "id" SERIAL PRIMARY KEY,
  "chef_id" int,
  "title" text,
  "ingredients" text[],
  "preparation" text[],
  "information" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "user_id" int NOT NULL
);

CREATE TABLE "chefs" (
  "id" SERIAL PRIMARY KEY,
  "file_id" int UNIQUE,
  "name" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "user_id" int NOT NULL
);

CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "path" text NOT NULL
);

CREATE TABLE "recipe_files" (
  "id" SERIAL PRIMARY KEY,
  "recipe_id" int,
  "file_id" int UNIQUE
);

ALTER TABLE "recipe_files" ADD FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id");

ALTER TABLE "recipe_files" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id");

ALTER TABLE "chefs" ADD FOREIGN KEY ("file_id") REFERENCES "files" ("id");



-- Função
CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- TRIGGER para chamar a função no postgres
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON chefs
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- TRIGGER para chamar a função no postgres
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- inserindo tabela users:
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "password" text NOT NULL,
  "reset_token" text,
  "reset_token_expires" text,
  "is_admin" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

-- inserindo referencias nas tbaleas de chefs e recipes para a tabela users
ALTER TABLE "recipes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "chefs" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- auto updated users
CREATE TRIGGER trigger_set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- connect-pg-simple table; inserindo tabela (https://github.com/voxpelli/node-connect-pg-simple/blob/HEAD/table.sql)
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- cascade effect when delete user, chefs and recipes
ALTER TABLE "chefs"
DROP CONSTRAINT chefs_user_id_fkey,
ADD CONSTRAINT chefs_user_id_fkey
FOREIGN KEY ("user_id")
REFERENCES "users" ("id")
ON DELETE CASCADE;


ALTER TABLE "recipes"
DROP CONSTRAINT recipes_user_id_fkey,
ADD CONSTRAINT recipes_user_id_fkey
FOREIGN KEY ("user_id")
REFERENCES "users" ("id")
ON DELETE CASCADE;

ALTER TABLE "recipe_files"
DROP CONSTRAINT recipe_files_recipe_id_fkey,
ADD CONSTRAINT recipe_files_recipe_id_fkey
FOREIGN KEY ("recipe_id")
REFERENCES "recipes" ("id")
ON DELETE CASCADE;

