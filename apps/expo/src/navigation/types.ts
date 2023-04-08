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
  CustomersStackNavigator: {
    RootCustomersList: undefined;
  };
  VehiclesStackNavigator: {
    RootVehiclesList: undefined;
  };
  SettingsStackNavigator: {
    RootSettingsScreen: undefined;
    //
    CompanyEditScreen: undefined;
    //
    RentalRatesListScreen: undefined;
    //
    TaxesListScreen: undefined;
    TaxEditScreen: { taxId: string; locationId: string };
    //
    VehicleTypesListScreen: undefined;
    VehicleTypeEditScreen: { vehicleTypeId: string };
    //
    EmployeesListScreen: undefined;
    EmployeeEditScreen: { employeeId: string };
  };
};
