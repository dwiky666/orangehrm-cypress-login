describe('OrangeHRM - Login Feature (Excel Test Cases)', () => {
  const URL_LOGIN =
    'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';

  const sel = {
    username: 'input[name="username"]',
    password: 'input[name="password"]',
    submit: 'button[type="submit"]',
    requiredMsg: '.oxd-input-field-error-message', // teks "Required"
  };

  const visitLogin = () => {
    cy.visit(URL_LOGIN);
    cy.get(sel.username, { timeout: 20000 }).should('be.visible');
    cy.get(sel.password, { timeout: 20000 }).should('be.visible');
    cy.get(sel.submit, { timeout: 20000 }).should('be.visible');
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

  beforeEach(() => {
    visitLogin();
  });

  it('TC-001 - Login berhasil (valid credentials)', () => {
    fillLogin('Admin', 'admin123');
    submit();
    assertDashboard();
  });

  it('TC-002 - Login gagal (password tidak sesuai)', () => {
    fillLogin('Admin', 'admin12345');
    submit();
    assertInvalid();
  });

  it('TC-003 - Login gagal (username tidak terdaftar)', () => {
    fillLogin('invalidUser', 'admin123');
    submit();
    assertInvalid();
  });

  it('TC-004 - Login gagal setelah beberapa kali percobaan password tidak valid', () => {
    const attempts = 3;

    for (let i = 1; i <= attempts; i++) {
      fillLogin('Admin', 'wrongPassword');
      submit();
      assertInvalid();

      // pastikan form siap lagi sebelum attempt berikutnya
      cy.get(sel.username, { timeout: 20000 }).should('be.visible');
      cy.get(sel.password, { timeout: 20000 }).should('be.visible');
    }
  });

  it('TC-005 - Validasi muncul ketika username & password kosong', () => {
    submit();
    assertRequiredExact(2);
  });

  it('TC-006 - Validasi muncul ketika username kosong', () => {
    fillLogin('', 'admin123');
    submit();
    assertRequiredExact(1);
  });

  it('TC-007 - Validasi muncul ketika password kosong', () => {
    fillLogin('Admin', '');
    submit();
    assertRequiredExact(1);
  });

  it('TC-008 - Diarahkan ke login ketika sesi hilang (simulasi session expired)', () => {
    fillLogin('Admin', 'admin123');
    submit();
    assertDashboard();

    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
    cy.url({ timeout: 20000 }).should('include', '/auth/login');
    cy.get(sel.username, { timeout: 20000 }).should('be.visible');
  });

  it('TC-009 - Halaman login stabil saat refresh berulang (>3x)', () => {
    const refreshTimes = 4;

    for (let i = 1; i <= refreshTimes; i++) {
      cy.reload();
      cy.get(sel.username, { timeout: 20000 }).should('be.visible');
      cy.get(sel.password, { timeout: 20000 }).should('be.visible');
      cy.get(sel.submit, { timeout: 20000 }).should('be.visible');
    }
  });

  it('TC-010 - Login gagal ketika username diisi SQL Injection', () => {
    fillLogin(`' OR '1'='1`, 'admin123');
    submit();
    assertInvalid();
  });

  it('TC-011 - Login gagal ketika username diisi script XSS', () => {
    fillLogin(`<script>alert(1)</script>`, 'admin123');
    submit();
    assertInvalid();
  });
});
