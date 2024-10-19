import { o } from '../jsx/jsx.js'
import { TimezoneDate } from 'timezone-date.ts'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  getContextFormBody,
  WsContext,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { object, ParseResult, string, values } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { getAuthUser } from '../auth/user.js'
import { Question, Questionnaire, User, proxy } from '../../../db/proxy.js'
import { filter, find } from 'better-sqlite3-proxy'
import { toRouteUrl } from '../../url.js'
import { IonButton } from '../components/ion-button.js'
import { Button } from '../components/button.js'
import { EarlyTerminate, MessageException } from '../../exception.js'
import { nodeToVNode } from '../jsx/vnode.js'
import { Script } from '../components/script.js'
import { loadClientPlugin } from '../../client-plugin.js'
import { updatedMessage } from '../components/updated-message.js'
import { loginButton } from '../components/login-button.js'
import { select_questionnaire_list } from '../store/questionnaire-store.js'
import { QuestionnaireItem } from '../components/questionnaire-item.js'

let pageTitle = 'Questionnaire'
let addPageTitle = 'Create Questionnaire'

let style = Style(/* css */ `
#CreateQuestionnaire {

}
`)

let page = (
  <>
    {style}
    <ion-header>
      <ion-toolbar>
        <IonBackButton href="/" backText="Home" />
        <ion-title role="heading" aria-level="1">
          {pageTitle}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="CreateQuestionnaire" class="ion-padding">
      <Main />
    </ion-content>
  </>
)

function Main(attrs: {}, context: Context) {
  let items = select_questionnaire_list.all({ limit: 50 })
  let user = getAuthUser(context)
  return (
    <>
      {user ? (
        <Link href="/questionnaire/add" tagName="ion-button">
          {addPageTitle}
        </Link>
      ) : (
        <p>
          You can add create questionnaire after{' '}
          <Link href="/register">register</Link>.
        </p>
      )}

      <h2>{items.length} Questionnaires</h2>

      <ion-list>
        {mapArray(items, item => (
          <QuestionnaireItem item={item} />
        ))}
      </ion-list>
    </>
  )
}

let addPage = (
  <>
    {Style(/* css */ `
#AddCreateQuestionnaire .hint {
  margin-inline-start: 1rem;
  margin-block: 0.25rem;
}
`)}
    <ion-header>
      <ion-toolbar>
        <IonBackButton
          href="/questionnaire"
          // backText={pageTitle}
        />
        <ion-title role="heading" aria-level="1">
          {addPageTitle}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="AddCreateQuestionnaire" class="ion-padding">
      <form
        method="POST"
        action="/questionnaire/add/submit"
        onsubmit="emitForm(event)"
      >
        <ion-list>
          <ion-item>
            <ion-input
              name="title"
              label="Title*:"
              label-placement="floating"
              required
              minlength="3"
              maxlength="50"
            />
          </ion-item>
          <p class="hint">(3-50 characters)</p>
          <ion-item>
            <ion-input
              name="slug"
              label="Slug*: (unique url)"
              label-placement="floating"
              required
              pattern="(\w|-|\.){1,32}"
            />
          </ion-item>
          <p class="hint">
            (1-32 characters of: <code>a-z A-Z 0-9 - _ .</code>)
          </p>
          <ion-item>
            <ion-input
              name="short_desc"
              label="Short Description"
              label-placement="floating"
              required
            />
          </ion-item>
        </ion-list>
        <div style="margin-inline-start: 1rem">
          <ion-button type="submit">Submit</ion-button>
        </div>
        <p>
          Remark:
          <br />
          *: mandatory fields
        </p>
      </form>
    </ion-content>
  </>
)

function AddPage(attrs: {}, context: DynamicContext) {
  let user = getAuthUser(context)
  if (!user) return <Redirect href="/login" />
  return addPage
}

let submitParser = object({
  title: string({ minLength: 3, maxLength: 50 }),
  slug: string({ match: /^[\w-]{1,32}$/ }),
  short_desc: string({ nonEmpty: true }),
})

function Submit(attrs: {}, context: DynamicContext) {
  try {
    let user = getAuthUser(context)
    if (!user) throw 'You must be logged in to submit ' + pageTitle
    let body = getContextFormBody(context)
    let input = submitParser.parse(body)
    let id = proxy.questionnaire.push({
      user_id: user.id!,
      title: input.title,
      slug: input.slug,
      short_desc: input.short_desc,
    })
    // return <Redirect href={`/questionnaire/result?id=${id}`} />
    return (
      <Redirect
        href={toRouteUrl(routes, '/questionnaire/:slug', {
          params: { slug: input.slug },
        })}
      />
    )
  } catch (error) {
    return (
      <Redirect
        href={
          '/questionnaire/result?' +
          new URLSearchParams({ error: String(error) })
        }
      />
    )
  }
}

function SubmitResult(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let error = params.get('error')
  let id = params.get('id')
  return (
    <>
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/questionnaire/add" backText="Form" />
          <ion-title role="heading" aria-level="1">
            Submitted {pageTitle}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="AddCreateQuestionnaire" class="ion-padding">
        {error ? (
          renderError(error, context)
        ) : (
          <>
            <p>Your submission is received (#{id}).</p>
            <Link href="/questionnaire" tagName="ion-button">
              Back to {pageTitle}
            </Link>
          </>
        )}
      </ion-content>
    </>
  )
}

let ownerScript = Script(/* js */ `
function updateQuestionnaire(event) {
  let item = event.target.closest('ion-item')
  let url = item.dataset.updateUrl
  let value = event.target.value
  emit(url, value)
}
`)

let guestScript = Script(/* js */ `
function updateResponse(event) {
  let item = event.target.closest('ion-item')
  let url = item.dataset.updateUrl
  let value = event.target.value
  emit(url, value)
}
`)

function QuestionnairePage(
  attrs: { questionnaire: Questionnaire },
  context: DynamicContext,
) {
  let user = getAuthUser(context)
  let { questionnaire } = attrs
  let questions = filter(proxy.question, {
    questionnaire_id: questionnaire.id!,
  })
  function OwnerView() {
    return (
      <>
        <h2>Edit Questionnaire</h2>
        <ion-list id="question_list">
          <ion-item
            data-update-url={toRouteUrl(
              routes,
              '/questionnaire/:id/update/:field',
              {
                params: { id: questionnaire.id!, field: 'title' },
              },
            )}
          >
            <ion-input
              name="title"
              label="Title"
              label-placement="floating"
              required
              value={questionnaire.title}
              onchange="updateQuestionnaire(event)"
            />
          </ion-item>
          <p class="update-message ion-margin-start" data-field="title"></p>
          <ion-item
            data-update-url={toRouteUrl(
              routes,
              '/questionnaire/:id/update/:field',
              {
                params: { id: questionnaire.id!, field: 'short_desc' },
              },
            )}
          >
            <ion-textarea
              name="short_desc"
              label="Short Description"
              label-placement="floating"
              required
              auto-grow
              value={questionnaire.short_desc}
              onchange="updateQuestionnaire(event)"
            />
          </ion-item>
          <p
            class="update-message ion-margin-start"
            data-field="short_desc"
          ></p>
          {mapArray(questions, question => (
            <QuestionItem question={question} />
          ))}
        </ion-list>
        <IonButton
          no-history
          url={toRouteUrl(routes, '/questionnaire/:id/question/add', {
            params: { id: questionnaire.id! },
          })}
          class="ion-margin-top"
        >
          Add question
        </IonButton>
        {ownerScript}
      </>
    )
  }
  function GuestView() {
    return (
      <>
        {!user ? (
          <p>
            You can fill the questionnaire after{' '}
            <Link href="/login">login</Link>.
          </p>
        ) : null}
        <h2>{questionnaire.title}</h2>
        <p>{questionnaire.short_desc}</p>
        <ion-list>
          {mapArray(questions, question => (
            <ResponseItem question={question} user_id={user?.id} />
          ))}
        </ion-list>
        {guestScript}
      </>
    )
  }
  return (
    <>
      {style}
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/" backText="Home" />
          <ion-title role="heading" aria-level="1">
            {questionnaire.title}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="QuestionnairePage" class="ion-padding">
        {user?.id == questionnaire.user_id ? <OwnerView /> : <GuestView />}
      </ion-content>
      {loadClientPlugin({ entryFile: 'dist/client/sweetalert.js' }).node}
    </>
  )
}

function QuestionItem(attrs: { question: Question }) {
  let { question } = attrs
  return (
    <>
      <ion-item
        data-question-id={question.id}
        data-update-url={toRouteUrl(routes, '/question/:id/update', {
          params: { id: question.id! },
        })}
      >
        <ion-input
          name="question"
          label={`Question ${question.id}`}
          label-placement="floating"
          required
          onchange="updateQuestionnaire(event)"
          value={question.question}
        />
      </ion-item>
      <p
        data-question-id={question.id}
        class="update-message ion-margin-start"
      ></p>
    </>
  )
}

function ResponseItem(attrs: {
  question: Question
  user_id: number | null | undefined
}) {
  let { question, user_id } = attrs
  let response = user_id
    ? find(proxy.response, {
        question_id: question.id!,
        user_id,
      })
    : null
  return (
    <>
      <ion-item
        data-question-id={question.id}
        data-update-url={toRouteUrl(routes, '/response/:question_id/update', {
          params: { question_id: question.id! },
        })}
      >
        <ion-input
          name="question"
          label={question.question}
          label-placement="floating"
          required
          onchange="updateResponse(event)"
          value={response?.content}
        />
      </ion-item>
      <p
        data-question-id={question.id}
        class="update-message ion-margin-start"
      ></p>
    </>
  )
}

function AddQuestion(
  attrs: { questionnaire: Questionnaire },
  context: DynamicContext,
) {
  let id = proxy.question.push({
    questionnaire_id: attrs.questionnaire.id!,
    question: '',
    choices: '',
  })
  let question = proxy.question[id]
  throw new MessageException([
    'append',
    '#question_list',
    nodeToVNode(<QuestionItem question={question} />, context),
  ])
}

let updateFieldParser = values(['title' as const, 'short_desc' as const])

function UpdateQuestionnaire(
  attrs: {
    questionnaire: Questionnaire
    field: ParseResult<typeof updateFieldParser>
  },
  context: WsContext,
) {
  let { questionnaire } = attrs
  let value = context.args?.[0]
  if (typeof value != 'string') {
    throw new Error('invalid value')
  }
  questionnaire[attrs.field] = value

  throw new MessageException([
    'update-text',
    `.update-message[data-field="${attrs.field}"]`,
    updatedMessage(context),
  ])
}

function UpdateQuestion(attrs: { question: Question }, context: WsContext) {
  let { question } = attrs
  let value = context.args?.[0]
  if (typeof value != 'string') {
    throw new Error('invalid value')
  }
  question.question = value
  throw new MessageException([
    'update-text',
    `.update-message[data-question-id="${question.id}"]`,
    updatedMessage(context),
  ])
}

function UpdateResponse(
  attrs: { question: Question; user: User },
  context: WsContext,
) {
  let { question, user } = attrs
  let value = context.args?.[0]
  if (typeof value != 'string') {
    throw new Error('invalid value')
  }
  let response = find(proxy.response, {
    question_id: question.id!,
    user_id: user.id!,
  })
  if (response) {
    response.content = value
  } else {
    proxy.response.push({
      question_id: question.id!,
      user_id: user.id!,
      content: value,
    })
  }
  throw new MessageException([
    'update-text',
    `.update-message[data-question-id="${question.id}"]`,
    updatedMessage(context),
  ])
}

let routes = {
  '/questionnaire': {
    title: title(pageTitle),
    description: 'TODO',
    node: page,
  },
  '/questionnaire/:slug': {
    resolve(context) {
      let slug = context.routerMatch?.params?.slug
      let questionnaire = find(proxy.questionnaire, { slug })
      if (!questionnaire) {
        return {
          title: title('Questionnaire Not Found'),
          description: 'The requested questionnaire is not found by url.',
          node: notFoundPage,
        }
      }
      return {
        title: title('Questionnaire: ' + questionnaire.title),
        description: 'TODO',
        node: <QuestionnairePage questionnaire={questionnaire} />,
      }
    },
  },
  '/questionnaire/:id/question/add': {
    resolve(context) {
      let id = context.routerMatch?.params?.id
      let questionnaire = proxy.questionnaire[id]
      if (!questionnaire) {
        throw new Error('questionnaire not found')
      }
      return {
        title: apiEndpointTitle,
        description: 'add question to questionnaire by id',
        node: <AddQuestion questionnaire={questionnaire} />,
      }
    },
  },
  '/questionnaire/:id/update/:field': {
    resolve(context) {
      let user = getAuthUser(context)
      if (!user) {
        throw new Error('You must be logged in to update questionnaire')
      }
      let id = context.routerMatch?.params?.id
      let questionnaire = proxy.questionnaire[id]
      if (!questionnaire) {
        throw new Error('questionnaire not found')
      }
      if (questionnaire.user_id != user.id) {
        throw new Error('You are not the owner of this questionnaire')
      }
      let field = updateFieldParser.parse(context.routerMatch?.params?.field)
      return {
        title: apiEndpointTitle,
        description: 'update questionnaire by id',
        node: (
          <UpdateQuestionnaire questionnaire={questionnaire} field={field} />
        ),
      }
    },
  },
  '/question/:id/update': {
    resolve(context) {
      let user = getAuthUser(context)
      if (!user) {
        throw new Error('You must be logged in to update question')
      }
      let id = context.routerMatch?.params?.id
      let question = proxy.question[id]
      if (!question) {
        throw new Error('question not found')
      }
      if (question.questionnaire?.user_id != user.id) {
        throw new Error('You are not the owner of this question')
      }
      return {
        title: apiEndpointTitle,
        description: 'update question by id',
        node: <UpdateQuestion question={question} />,
      }
    },
  },
  '/response/:question_id/update': {
    resolve(context) {
      let user = getAuthUser(context)
      if (!user) {
        throw new Error('You must be logged in to update question')
      }
      let id = context.routerMatch?.params?.question_id
      let question = proxy.question[id]
      if (!question) {
        throw new Error('question not found')
      }
      return {
        title: apiEndpointTitle,
        description: 'update response by question id',
        node: <UpdateResponse question={question} user={user} />,
      }
    },
  },
  '/questionnaire/add': {
    title: title(addPageTitle),
    description: 'TODO',
    node: <AddPage />,
    streaming: false,
  },
  '/questionnaire/add/submit': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <Submit />,
    streaming: false,
  },
  '/questionnaire/result': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <SubmitResult />,
    streaming: false,
  },
} satisfies Routes

export default { routes }

let notFoundPage = (
  <>
    <ion-header>
      <ion-toolbar>
        <IonBackButton href={toRouteUrl(routes, '/questionnaire')} />
        <ion-title role="heading" aria-level="1">
          Not Found
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="QuestionnairePage" class="ion-padding">
      <p>The requested questionnaire is not found by url.</p>
      <div class="ion-text-center">
        <Link href={toRouteUrl(routes, '/questionnaire')} tagName="ion-button">
          Back to {pageTitle}
        </Link>
      </div>
    </ion-content>
  </>
)
