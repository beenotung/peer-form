import { proxy } from '../../../db/proxy.js'
import { toRouteUrl } from '../../url.js'
import { o } from '../jsx/jsx.js'
import { Link } from './router.js'
import QuestionnairePage from '../pages/questionnaire.js'

export function QuestionnaireItem(attrs: {
  item: { id: number; score: number }
}) {
  let { id, score } = attrs.item
  let questionnaire = proxy.questionnaire[id]
  let user = questionnaire.user!
  let username = user.username || user.email?.split('@')[0] || `user-${user.id}`
  return (
    <Link
      tagName="ion-item"
      href={toRouteUrl(QuestionnairePage.routes, `/questionnaire/:slug`, {
        params: {
          slug: questionnaire.slug!,
        },
      })}
    >
      <div>
        <div>
          <b>{questionnaire.title}</b>
        </div>
        <ion-note color="dark">
          by {username} ({score} score)
        </ion-note>
      </div>
    </Link>
  )
}
