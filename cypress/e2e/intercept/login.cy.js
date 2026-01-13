describe('Tugas 16 - OrangeHRM Login (Intercept) - Stable 5 TC', () => {
  const URL_LOGIN =
    'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

  const sel = {
    username: 'input[name="username"]',
    password: 'input[name="password"]',
    submit: 'button[type="submit"]',
    requiredMsg: '.oxd-input-field-error-message',
  };

  const assertLoginFormReady = () => {
    cy.get(sel.username).should('be.visible');
    cy.get(sel.password).should('be.visible');
    cy.get(sel.submit).should('be.visible');
  };

  const visitLogin = () => {
    cy.visit(URL_LOGIN);
    assertLoginFormReady();
  };

  const fillLogin = (username, password) => {
    cy.get(sel.username).clear();
    if (username !== '' && username !== null && username !== undefined) {
      cy.get(sel.username).type(username, { delay: 0 });
    }

    cy.get(sel.password).clear();
    if (password !== '' && password !== null && password !== undefined) {
      cy.get(sel.password).type(password, { delay: 0 });
    }
  };

  const submit = () => cy.get(sel.submit).click();

  const assertDashboard = () => {
    cy.url({ timeout: 20000 }).should('include', '/dashboard');
    cy.contains('Dashboard', { timeout: 20000 }).should('be.visible');
  };

  const assertInvalid = () => {
    cy.contains('Invalid credentials', { timeout: 20000 }).should('be.visible');
  };

  const assertRequiredExact = (count) => {
    cy.get(sel.requiredMsg, { timeout: 20000 }).should('have.length', count);
    cy.get(sel.requiredMsg).each(($el) => {
      cy.wrap($el).should('contain.text', 'Required');
    });
  };

  const assertStatusOkish = (statusCode) => {
    expect([200, 201, 204, 302, 304, 400, 401, 422]).to.include(statusCode);
  };

  beforeEach(() => {
    visitLogin();
  });

  it('TC-001 - Login berhasil (valid credentials) - intercept dashboard API', () => {
    cy.intercept('GET', '**/web/index.php/api/v2/dashboard/**').as('getDashboardApi');

    fillLogin('Admin', 'admin123');
    submit();

    cy.wait('@getDashboardApi', { timeout: 20000 }).then((i) => {
      expect(i.request.method).to.eq('GET');
      assertStatusOkish(i.response?.statusCode);
    });

    assertDashboard();
  });

  it('TC-002 - Login gagal (password tidak sesuai) - intercept auth validate', () => {
    cy.intercept('POST', '**/web/index.php/auth/validate').as('postAuthValidateWrongPass');

    fillLogin('Admin', 'admin12345');
    submit();

    cy.wait('@postAuthValidateWrongPass', { timeout: 20000 }).then((i) => {
      expect(i.request.method).to.eq('POST');
      assertStatusOkish(i.response?.statusCode);
    });

    assertInvalid();
  });

  it('TC-003 - Login gagal (username tidak terdaftar) - intercept i18n/messages', () => {
    cy.intercept('GET', '**/web/index.php/core/i18n/messages*').as('getI18n');

    fillLogin('invalidUser', 'admin123');
    submit();

    cy.wait('@getI18n', { timeout: 20000 }).then((i) => {
      expect(i.request.method).to.eq('GET');
      assertStatusOkish(i.response?.statusCode);
    });

    assertInvalid();
  });

  it('TC-005 - Validasi muncul ketika username & password kosong - intercept GET login page', () => {
    cy.intercept('GET', '**/web/index.php/auth/login').as('getLoginPage');

    cy.reload();
    cy.wait('@getLoginPage', { timeout: 20000 }).then((i) => {
      expect(i.request.method).to.eq('GET');
      assertStatusOkish(i.response?.statusCode);
    });

    submit();
    assertRequiredExact(2);
  });

  it('TC-009 - Halaman login stabil saat refresh berulang (>3x) - intercept count on GET login page', () => {
    let hit = 0;

    cy.intercept('GET', '**/web/index.php/auth/login', (req) => {
      hit += 1;
    }).as('getLoginPageMany');

    const refreshTimes = 4;

    for (let i = 1; i <= refreshTimes; i++) {
      cy.reload();
      assertLoginFormReady();
    }

    cy.then(() => {
      expect(hit).to.be.at.least(refreshTimes);
    });
  });
});
