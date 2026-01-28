-- Migration 002: Default categories
INSERT OR IGNORE INTO categories (id, name, icon, color, is_default) VALUES
  ('cat-food', 'Alimentação', 'restaurant', '#FF6B6B', 1),
  ('cat-transport', 'Transporte', 'car', '#4ECDC4', 1),
  ('cat-shopping', 'Compras', 'bag', '#45B7D1', 1),
  ('cat-bills', 'Contas', 'receipt', '#FFA07A', 1),
  ('cat-entertainment', 'Entretenimento', 'film', '#98D8C8', 1),
  ('cat-health', 'Saúde', 'medical', '#F7DC6F', 1),
  ('cat-education', 'Educação', 'book', '#BB8FCE', 1),
  ('cat-other', 'Outros', 'ellipsis', '#95A5A6', 1);
