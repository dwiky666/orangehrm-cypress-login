class DashboardPage {
  assertVisible() {
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  }
}

export default DashboardPage;
