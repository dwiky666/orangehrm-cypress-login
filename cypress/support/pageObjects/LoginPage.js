class LoginPage {
  visit() {
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  }

  fillUsername(username) {
    cy.get('input[name="username"]').clear().type(username);
  }

  fillPassword(password) {
    cy.get('input[name="password"]').clear().type(password);
  }

  submit() {
    cy.get('button[type="submit"]').click();
  }

  login(username, password) {
    if (username) this.fillUsername(username);
    if (password) this.fillPassword(password);
    this.submit();
  }

  assertInvalid() {
    cy.contains('Invalid credentials').should('be.visible');
  }

  assertRequired(count) {
    cy.get('.oxd-input-field-error-message')
      .should('have.length', count);
  }
}

export default LoginPage;
