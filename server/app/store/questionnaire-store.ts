import { db } from '../../../db/db.js'

export let select_questionnaire_list = db.prepare<
  {
    limit: number
  },
  { score: number; id: number }
>(/* sql */ `
select
  count(response.id) as score,
  questionnaire.id
from questionnaire
left join response on response.user_id = questionnaire.user_id
group by questionnaire.id
order by score desc
limit :limit
`)
