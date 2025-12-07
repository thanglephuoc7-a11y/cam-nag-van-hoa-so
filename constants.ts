



export enum Screen {
  Home = 'home',
  Knowledge = 'knowledge',
  Quiz = 'quiz',
  Scenarios = 'scenarios',
  Game = 'game',
  Advisor = 'advisor',
  History = 'history',
  Profile = 'profile',
}

export const SCREEN_TITLES: { [key in Screen]: string } = {
  [Screen.Home]: 'screen_home',
  [Screen.Knowledge]: 'screen_knowledge',
  [Screen.Quiz]: 'screen_quiz',
  [Screen.Scenarios]: 'screen_scenarios',
  [Screen.Game]: 'screen_game',
  [Screen.Advisor]: 'screen_advisor',
  [Screen.History]: 'screen_history',
  [Screen.Profile]: 'screen_profile',
};