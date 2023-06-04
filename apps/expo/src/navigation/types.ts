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
    PolicyWebView: { title: string; url: string };
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
    CustomerEditScreen: { customerId: string };
    CustomerViewScreen: { customerId: string };
  };
  VehiclesStackNavigator: {
    RootVehiclesList: undefined;
    VehicleEditScreen: { vehicleId: string; currentLocationId: string };
    VehicleViewScreen: { vehicleId: string };
  };
  AgreementsStackNavigator: {
    RootAgreementsList: undefined;
    AgreementViewScreen: {
      agreementId: string;
      view: "overview" | "details" | "payments" | "notes";
    };
  };
  ReservationsStackNavigator: {
    RootReservationsList: undefined;
    ReservationViewScreen: {
      reservationId: string;
      view: "overview" | "details" | "notes";
    };
  };
  SettingsStackNavigator: {
    RootSettingsScreen: undefined;
    //
    CompanyEditScreen: undefined;
    //
    RentalRatesListScreen: undefined;
    RentalRateEditScreen: { locationId: string; rentalRateId: string };
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
