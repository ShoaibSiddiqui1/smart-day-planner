                                      Table "public.users"
     Column      |       Type        | Collation | Nullable |              Default              
-----------------+-------------------+-----------+----------+-----------------------------------
 id              | integer           |           | not null | nextval('users_id_seq'::regclass)
 username        | character varying |           | not null | 
 email           | character varying |           | not null | 
 hashed_password | character varying |           | not null | 
 is_active       | boolean           |           |          | 
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "ix_users_email" UNIQUE, btree (email)
    "ix_users_id" btree (id)
    "ix_users_username" UNIQUE, btree (username)
Referenced by:
    TABLE "tasks" CONSTRAINT "tasks_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)

