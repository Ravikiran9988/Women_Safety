/**
 * React Navigation — native stack: Welcome, Login, SOS, Contacts.
 */
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SOS: undefined;
  Contacts: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
