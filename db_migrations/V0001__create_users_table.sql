CREATE TABLE t_p62885751_app_communication_pr.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  status TEXT DEFAULT 'online',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
