describe('Reqres API Automation Cypress', () => {
  const baseUrl = 'https://reqres.in/api';

  const API_KEY = 'reqres_6518f308d9c74a259d56f0d39b16a558';

  const headers = () => ({
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  });

  const expectOkishJson = (res) => {
    expect(res).to.have.property('status');
    expect(res).to.have.property('body');
    expect(res.headers).to.have.property('content-type');
    expect(String(res.headers['content-type']).toLowerCase()).to.include('application/json');
  };


   //GET List Users (page=2)

  it('REQ-001 - GET /users?page=2', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users`,
      qs: { page: 2 },
      headers: headers(),
    }).then((res) => {
      expectOkishJson(res);
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('page', 2);
      expect(res.body.data).to.be.an('array').and.have.length.greaterThan(0);

      const user = res.body.data[0];
      expect(user).to.have.all.keys('id', 'email', 'first_name', 'last_name', 'avatar');
      expect(String(user.email)).to.include('@');
    });
  });

  
   //GET Single User (id=2)
  
  it('REQ-002 - GET /users/2', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users/2`,
      headers: headers(),
    }).then((res) => {
      expectOkishJson(res);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.have.property('id', 2);
      expect(res.body.data).to.have.property('email');
    });
  });

  
  //GET Single User Not Found (id=23) - negative
  
  it('REQ-003 - GET /users/23 (404)', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/users/23`,
      headers: headers(),
      failOnStatusCode: false,
    }).then((res) => {
      // 404
      expect(res.status).to.eq(404);
      expect(res.body).to.deep.equal({});
    });
  });

  
  //GET List Resource

  it('REQ-004 - GET /unknown', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/unknown`,
      headers: headers(),
    }).then((res) => {
      expectOkishJson(res);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('array').and.have.length.greaterThan(0);

      const item = res.body.data[0];
      expect(item).to.have.all.keys('id', 'name', 'year', 'color', 'pantone_value');
    });
  });

  
  //GET Single Resource (id=2)
  
  it('REQ-005 - GET /unknown/2', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/unknown/2`,
      headers: headers(),
    }).then((res) => {
      expectOkishJson(res);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.have.property('id', 2);
    });
  });

  
  //POST Create User

  it('REQ-006 - POST /users (create)', () => {
    const payload = { name: 'morpheus', job: 'leader' };

    cy.request({
      method: 'POST',
      url: `${baseUrl}/users`,
      headers: headers(),
      body: payload,
    }).then((res) => {
      expectOkishJson(res);
      expect(res.status).to.eq(201);
      expect(res.body).to.include(payload);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('createdAt');
    });
  });

  
  //PUT Update User
  
  it('REQ-007 - PUT /users/2 (update)', () => {
    const payload = { name: 'morpheus', job: 'zion resident' };

    cy.request({
      method: 'PUT',
      url: `${baseUrl}/users/2`,
      headers: headers(),
      body: payload,
    }).then((res) => {
      expectOkishJson(res);
      expect(res.status).to.eq(200);
      expect(res.body).to.include(payload);
      expect(res.body).to.have.property('updatedAt');
    });
  });

  
  //PATCH Update User
  
  it('REQ-008 - PATCH /users/2 (partial update)', () => {
    const payload = { job: 'qa engineer' };

    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/users/2`,
      headers: headers(),
      body: payload,
    }).then((res) => {
      expectOkishJson(res);
      expect(res.status).to.eq(200);
      expect(res.body).to.include(payload);
      expect(res.body).to.have.property('updatedAt');
    });
  });

  
  //DELETE User
  
  it('REQ-009 - DELETE /users/2', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/users/2`,
      headers: headers(),
    }).then((res) => {
      expect(res.status).to.eq(204);
      // biasanya kosong
      expect(res.body).to.be.empty;
    });
  });

  
  //Data-driven GET /users/{id} 
  
  [1, 2, 3].forEach((id) => {
    it(`REQ-010.${id} - Data-driven GET /users/${id}`, () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/users/${id}`,
        headers: headers(),
      }).then((res) => {
        expectOkishJson(res);
        expect(res.status).to.eq(200);
        expect(res.body.data).to.have.property('id', id);
      });
    });
  });
});
