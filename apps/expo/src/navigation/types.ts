export type GlobalRoutingType = {
  RootStackNavigator: {
    AuthStack: undefined;
    AppDrawer: undefined;
  };
  AuthStackNavigator: {
    Register: undefined;
    LoginEmail: undefined;
    LoginAccessCode: { email: string };
    LoginCompanies: { email: string; accessCode: string; companyId: string };
  };
  AppDrawer: {
    Home: undefined;
    Customers: undefined;
    Vehicles: undefined;
    Reservations: undefined;
    Agreements: undefined;
    Settings: undefined;
  };
  CustomerStackNavigator: {
    CustomerList: undefined;
  };
  SettingsStackNavigator: {
    RootSettingsScreen: undefined;
    //
    RentalRatesListScreen: undefined;
    //
    TaxesListScreen: undefined;
    //
    VehicleTypesListScreen: undefined;
    //
    EmployeesListScreen: undefined;
  };
};
