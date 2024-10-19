import { seedRow } from 'better-sqlite3-proxy'
import { proxy } from './proxy'

// This file serve like the knex seed file.
//
// You can setup the database with initial config and sample data via the db proxy.

seedRow(proxy.method, { method: 'GET' })
seedRow(proxy.method, { method: 'POST' })
seedRow(proxy.method, { method: 'ws' })

/* seed user */

proxy.user[1] = {
  username: 'alice',
  password_hash: null,
  tel: null,
  email: null,
  avatar: null,
  is_admin: false,
}

proxy.user[2] = {
  username: 'bob',
  password_hash: null,
  tel: null,
  email: null,
  avatar: null,
  is_admin: false,
}

proxy.user[3] = {
  username: 'charlie',
  password_hash: null,
  tel: null,
  email: null,
  avatar: null,
  is_admin: false,
}

/* seed questionnaire */

proxy.questionnaire[1] = {
  user_id: 1,
  slug: 'jp-anime',
  title: '觀看日本動畫的影響',
  short_desc: `這個問卷探討日本動畫對觀眾社交行為和文化認知的影響。你的見解將有助於一個關於媒體影響的社會科學項目。`,
}

proxy.questionnaire[2] = {
  user_id: 1,
  slug: 'social-media-mental-health',
  title: '社交媒體對心理健康的影響',
  short_desc: `這項調查旨在收集有關社交媒體使用如何影響心理健康、自尊心和人際關係的數據。你的參與將幫助識別趨勢並提供有價值的心理健康研究見解。`,
}

proxy.questionnaire[3] = {
  user_id: 2,
  slug: 'student-study-habits',
  title: '學生學習習慣與學業表現',
  short_desc: `這個問卷調查學生的學習習慣及其與學業成功的關聯。通過分享你的經驗，你將有助於了解有效的學習方法及其對學習結果的影響。`,
}

proxy.questionnaire[4] = {
  user_id: 2,
  slug: 'public-perception-climate-change',
  title: '公眾對氣候變化的看法',
  short_desc: `這項調查旨在了解公眾對氣候變化的認知及其對日常生活的影響。你的回應將有助於提升認識並促進環保行動。`,
}

proxy.questionnaire[5] = {
  user_id: 3,
  slug: 'online-shopping-consumer-behavior',
  title: '網上購物的消費行為',
  short_desc: `這個問卷調查影響消費者在網上購物決策的因素，包括信任、便利性和產品多樣性。你的反饋將幫助企業改善其網上購物體驗。`,
}
