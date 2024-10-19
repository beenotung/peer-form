import { proxy } from '../../../db/proxy.js'
import { loadClientPlugin } from '../../client-plugin.js'
import { LayoutType, config, title } from '../../config.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { mapArray } from '../components/fragment.js'
import { Link } from '../components/router.js'
import { Script } from '../components/script.js'
import Style from '../components/style.js'
import { wsStatus } from '../components/ws-status.js'
import { prerender } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { PageRoute, Routes } from '../routes.js'
import { fitIonFooter, selectIonTab } from '../styles/mobile-style.js'
import { IonButton } from '../components/ion-button.js'
import { Context } from '../context.js'
import { getAuthUser } from '../auth/user.js'
import { toRouteUrl } from '../../url.js'
import QuestionnairePage from './questionnaire.js'
import { loginButton } from '../components/login-button.js'
import { select_questionnaire_list } from '../store/questionnaire-store.js'
import { QuestionnaireItem } from '../components/questionnaire-item.js'

let pageTitle = 'Home'

let style = Style(/* css */ `
/* This explicit height is necessary when using ion-menu */
#main-content {
  height: 100%;
}
`)

let script = Script(/* javascript */ `
function selectMenu(event, flag) {
  let item = event.currentTarget
  showToast('Selected ' + item.textContent)
  if (flag == 'close') {
    let menu = item.closest('ion-menu')
    menu.close()
  }
}
`)

type Questionnaire = {
  id: number
  title: string
  short_desc: string
}

let homePage = (
  <>
    {style}
    <ion-menu content-id="main-content" id="sideMenu">
      <ion-header>
        <ion-toolbar>
          <ion-title>Side Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item onclick="selectMenu(event)">Show Toast 1</ion-item>
          <ion-item onclick="selectMenu(event)">Show Toast 2</ion-item>
          <ion-item onclick="selectMenu(event, 'close')">
            Show Toast and Close Menu
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
    {/* This extra layer of div is only needed when using ion-menu */}
    <div id="main-content">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title role="heading" aria-level="1">
            {pageTitle}
          </ion-title>
          <ion-buttons slot="end">
            <Link tagName="ion-button" href="/app/about" color="light">
              About
            </Link>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <h1>歡迎來到 PeerForm</h1>
        <p>
          PeerForm
          是一個互惠互助的問卷平台，旨在幫助學生通過填寫他人的問卷來提升自己問卷的曝光率。
          在這裡，你可以輕鬆創建問卷、參與調查，並貢獻和利用公開數據，促進合作與學習。
        </p>
        <p>加入我們，開始探索如何通過互助來提升學習效果！</p>
        <hr />

        {loadClientPlugin({ entryFile: 'dist/client/sweetalert.js' }).node}

        <CreateSection />

        <h2>
          High Contribution Questionnaires{' '}
          <IonButton
            url={toRouteUrl(QuestionnairePage.routes, '/questionnaire')}
            size="small"
          >
            More
          </IonButton>
        </h2>

        <QuestionnaireList />

        {wsStatus.safeArea}
      </ion-content>
    </div>
    <ion-footer>
      {appIonTabBar}
      {selectIonTab('home')}
    </ion-footer>
    {fitIonFooter}
    {script}
  </>
)

function CreateSection(attrs: {}, context: Context) {
  let user = getAuthUser(context)
  return (
    <>
      <div class="ion-text-center">
        <IonButton
          url={toRouteUrl(QuestionnairePage.routes, '/questionnaire/add')}
          expand="block"
          disabled={!user ? true : undefined}
        >
          Create your questionnaire
        </IonButton>
        {!user ? loginButton : undefined}
      </div>
    </>
  )
}

function QuestionnaireList() {
  if (proxy.questionnaire.length == 0) {
    return <p>No questionnaires available at the moment.</p>
  }
  let questionnaireList = select_questionnaire_list.all({ limit: 5 })
  return (
    <>
      <ion-list>
        {mapArray(
          questionnaireList,
          item => (
            <QuestionnaireItem item={item} />
          ),
          <ion-list-separator></ion-list-separator>,
        )}
      </ion-list>
    </>
  )
}

// pre-render into html to reduce time to first contentful paint (FCP)
// homePage = prerender(homePage)

let homeRoute: PageRoute = {
  title: title(pageTitle),
  description:
    'List of fictional characters commonly used as placeholders in discussion about cryptographic systems and protocols.',
  menuText: 'Ionic App',
  menuFullNavigate: true,
  node: homePage,
  layout_type: LayoutType.ionic,
}

let routes = {
  ...(config.layout_type === LayoutType.ionic
    ? {
        '/': homeRoute,
      }
    : {}),
  '/app/home': homeRoute,
} satisfies Routes

export default { routes }
