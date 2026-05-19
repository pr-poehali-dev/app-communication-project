CREATE TABLE t_p62885751_app_communication_pr.messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES t_p62885751_app_communication_pr.users(id),
  receiver_id INTEGER NOT NULL REFERENCES t_p62885751_app_communication_pr.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_sender ON t_p62885751_app_communication_pr.messages(sender_id);
CREATE INDEX idx_messages_receiver ON t_p62885751_app_communication_pr.messages(receiver_id);
CREATE INDEX idx_messages_created ON t_p62885751_app_communication_pr.messages(created_at);
