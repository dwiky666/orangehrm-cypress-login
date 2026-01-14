import LoginPage from '../../support/pageObjects/LoginPage';
import DashboardPage from '../../support/pageObjects/DashboardPage';

describe('Login OrangeHRM with POM', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(function () {
    loginPage.visit();
    cy.fixture('loginData').as('data');
  });

  it('TC-001 - Login berhasil dengan credential valid', function () {
    loginPage.login(
      this.data.validUser.username,
      this.data.validUser.password
    );
    dashboardPage.assertVisible();
  });

  it('TC-002 - Login gagal dengan password tidak sesuai', function () {
    loginPage.login(
      this.data.invalidPassword.username,
      this.data.invalidPassword.password
    );
    loginPage.assertInvalid();
  });

  it('TC-003 - Login gagal dengan username tidak terdaftar', function () {
    loginPage.login(
      this.data.invalidUser.username,
      this.data.invalidUser.password
    );
    loginPage.assertInvalid();
  });

  it('TC-005 - Validasi muncul ketika username & password kosong', () => {
    loginPage.submit();
    loginPage.assertRequired(2);
  });

  it('TC-006 - Validasi muncul ketika username kosong', function () {
    loginPage.login(
      '',
      this.data.validUser.password
    );
    loginPage.assertRequired(1);
  });
});
