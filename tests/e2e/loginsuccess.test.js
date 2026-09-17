const { Builder } = require('selenium-webdriver');
const { expect } = require('chai');
const LoginPage = require('../pages/LoginPage');

const EMAIL = 'alice@shopnow.test';
const PASSWORD = 'Password123!';

/**
 * Scénario de test — Connexion réussie
 * Ce fichier ne contient AUCUN sélecteur Selenium (By.css, data-testid, etc.).
 * Il décrit uniquement le déroulement du scénario, en langage métier,
 * via les méthodes exposées par LoginPage.
 */
describe('Connexion réussie ShopNow', function () {
  this.timeout(15000);

  let driver;
  let loginPage;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
    loginPage = new LoginPage(driver); // instanciation du Page Object
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("1. la page de connexion doit être accessible", async function () {
    await loginPage.open();
    const form = await loginPage.getForm();
    expect(await form.isDisplayed()).to.be.true; // Assertion 1
  });

  it("2. les informations doivent pouvoir être saisies", async function () {
    const emailField = await loginPage.getEmailField();
    const passwordField = await loginPage.getPasswordField();

    await emailField.sendKeys(EMAIL);
    await passwordField.sendKeys(PASSWORD);

    const emailValue = await emailField.getAttribute('value');
    expect(emailValue).to.equal(EMAIL); // Assertion 2
  });

  it("3. la connexion doit fonctionner", async function () {
    const submitButton = await loginPage.getSubmitButton();
    await submitButton.click();

    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).to.be.true; // Assertion 3
  });

  it("4. l'utilisateur connecté doit être identifiable dans l'interface", async function () {
    const loggedUser = await loginPage.getLoggedUserIndicator();
    const text = await loggedUser.getText();
    expect(text.length).to.be.greaterThan(0); // Assertion 4

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});