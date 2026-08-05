UPDATE merchants SET distance_km = CASE id
  WHEN 'merchant-1' THEN 0.8
  WHEN 'merchant-2' THEN 1.6
  WHEN 'merchant-3' THEN 2.4
  WHEN 'merchant-4' THEN 3.1
  ELSE 3.6
END;

UPDATE point_records SET user_id = 'demo-user' WHERE user_id IS NULL OR user_id = '';
UPDATE coupons SET user_id = 'demo-user' WHERE user_id IS NULL OR user_id = '';
ALTER TABLE point_records ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE coupons ALTER COLUMN user_id SET NOT NULL;

INSERT INTO points_categories(id, label, emoji, sort_order, active) VALUES
  ('bar', '酒吧福利', '🍸', 1, TRUE),
  ('life', '生活权益', '✨', 2, TRUE),
  ('tea', '茶酒臻选', '🍵', 3, TRUE),
  ('talent', '达人服务', '⭐', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO points_products(id, category_id, title, description, redemption_method, value, image, emoji, points, stock, active, sort_order) VALUES
  ('bar-1', 'bar', '酒吧通用抵扣券', '适用于合作酒吧消费抵扣', '现场核销', 100, '', '🎟️', 500, -1, TRUE, 1),
  ('bar-2', 'bar', '驻场演出优先入座', '热门场次可提前锁定入座权益', '现场认领', 240, '', '🎫', 1200, -1, TRUE, 2),
  ('life-1', 'life', '影院观影代金券', '可兑换指定影院观影抵扣权益', '现场核销', 160, '', '🎬', 800, -1, TRUE, 1),
  ('life-2', 'life', '精品咖啡兑换券', '合作咖啡门店到店使用', '现场核销', 76, '', '☕', 380, -1, TRUE, 2),
  ('tea-1', 'tea', '臻选茶礼体验装', '精选茶酒小样体验礼包', '快递邮寄', 136, '', '🍵', 680, -1, TRUE, 1),
  ('tea-2', 'tea', '威士忌品鉴小样', '适合品鉴入门的精选小样', '现场认领', 196, '', '🥃', 980, -1, TRUE, 2),
  ('talent-1', 'talent', '达人探店优先报名', '优先参与平台达人探店活动', '现场核销', 300, '', '🧑', 1500, -1, TRUE, 1),
  ('talent-2', 'talent', '专属活动预约服务', '提供活动档期预约协助', '现场认领', 200, '', '🌟', 1000, -1, TRUE, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO benefit_items(id, emoji, label, action, sort_order, active) VALUES
  ('daily', '📅', '每日任务', 'daily', 1, TRUE),
  ('team', '👥', '我的战队', 'team', 2, TRUE),
  ('game', '🎮', '游戏赚积分', 'game', 3, TRUE),
  ('invite', '🤝', '邀请赚积分', 'invite', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO benefit_notices(id, content, sort_order, active) VALUES
  ('notice-1', '小乐用户获得200积分', 1, TRUE),
  ('notice-2', '佳佳成功邀请好友，获得200积分', 2, TRUE),
  ('notice-3', '星河完成每日任务，获得50积分', 3, TRUE),
  ('notice-4', '阿城兑换了精选福利，获得30积分', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO benefit_promos(id, image, action, dialog_title, dialog_image, primary_text, secondary_text, sort_order, active) VALUES
  ('enterprise', '/assets/benefit-promo-enterprise.png', 'enterprise', '我的专属活码', '/assets/enterprise-wechat-qr.png', '扫码加企微，双方各得200积分', '好友通过后积分自动到账', 1, TRUE),
  ('invite-promo', '/assets/benefit-promo-invite.png', 'invite', '', '', '', '', 2, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO daily_tasks(id, emoji, title, reward, action, sort_order, active) VALUES
  ('check-in', '📅', '每日签到', 10, 'check-in', 1, TRUE),
  ('creator', '👀', '浏览达人列表', 5, 'creator', 2, TRUE),
  ('mall', '🛒', '浏览积分商城', 5, 'mall', 3, TRUE),
  ('share', '📤', '分享邀请海报', 50, 'share', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO games(id, emoji, title, rule, description, points, daily_limit, team_size, tone, sort_order, active) VALUES
  ('solo', '🎯', '单人闯关', '答题闯关', '答题、反应挑战，连续通关可解锁加倍奖励', 500, 3, 1, 'blue', 1, TRUE),
  ('team', '👥', '好友组队', '协作挑战', '2 至 4 人协作挑战，新好友加入奖励翻倍', 200, 2, 2, 'orange', 2, TRUE),
  ('daily', '🎁', '每日福利', '转盘抽奖', '幸运转盘和刮刮乐，每天都有新积分奖励', 100, 1, 1, 'green', 3, TRUE)
ON CONFLICT (id) DO NOTHING;
