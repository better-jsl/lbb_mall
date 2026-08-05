INSERT INTO profile(id, nickname, points, coupons, favorites) VALUES
  ('leaderboard-user-1', '乐伴伴小酒', 2860, 5, 12),
  ('leaderboard-user-2', '快乐阿杰', 2140, 4, 9),
  ('leaderboard-user-3', '泉州探店官', 1680, 3, 7),
  ('leaderboard-user-4', '夜色玩家', 980, 2, 4),
  ('leaderboard-user-5', '微醺小林', 860, 2, 5),
  ('leaderboard-user-6', '周末放映室', 720, 1, 4),
  ('leaderboard-user-7', '爱喝柠檬茶', 560, 2, 3),
  ('leaderboard-user-8', '南风慢生活', 430, 1, 2),
  ('leaderboard-user-9', '小城寻味记', 310, 1, 2),
  ('leaderboard-user-10', '落日微醺', 260, 1, 1),
  ('leaderboard-user-11', '午夜放映厅', 220, 1, 1)
ON CONFLICT (id) DO NOTHING;
