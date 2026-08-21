INSERT INTO games(
  id, emoji, title, rule, description, link, reward_points,
  points, daily_limit, team_size, tone, sort_order, active
) VALUES (
  'xiaoxiaole', '🎮', '消消乐', '单人闯关',
  '集齐三个相同方块完成消除挑战', '', 10,
  0, 1, 1, 'green', 100, TRUE
)
ON CONFLICT (id) DO NOTHING;
