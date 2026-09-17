const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

// Email unique généré à chaque exécution pour éviter les conflits avec des comptes existants
const UNIQUE_EMAIL = `test.${Date.now()}@shopnow.test`;
const FIRSTNAME = 'Jean';
const LASTNAME = 'Dupont';
const PASSWORD = 'Password123!';

describe('Création d\'un compte ShopNow', function () {
  this.timeout(15000);

  let driver;
  let registerForm, registerMessage;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();

    // Point de départ : la page d'inscription
    await driver.get('http://localhost:3000/register.html');

    // Sélecteur trouvé dans data-testids.md : data-testid="register-form"
    registerForm = await driver.wait(
      until.elementLocated(By.css('[data-testid="register-form"]')),
      5000
    );
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("1. le formulaire d'inscription doit être accessible", async function () {
    const isDisplayed = await registerForm.isDisplayed();
    expect(isDisplayed).to.be.true; // Assertion 1
  });

  it("2. les informations doivent pouvoir être saisies", async function () {
    // Sélecteurs trouvés dans data-testids.md
    const firstnameField = await driver.wait(
      until.elementLocated(By.css('[data-testid="register-firstname"]')),
      5000
    );
    const lastnameField = await driver.wait(
      until.elementLocated(By.css('[data-testid="register-lastname"]')),
      5000
    );
    const emailField = await driver.wait(
      until.elementLocated(By.css('[data-testid="register-email"]')),
      5000
    );
    const passwordField = await driver.wait(
      until.elementLocated(By.css('[data-testid="register-password"]')),
      5000
    );

    // Actions utilisateur : saisie des informations d'inscription
    await firstnameField.sendKeys(FIRSTNAME);
    await lastnameField.sendKeys(LASTNAME);
    await emailField.sendKeys(UNIQUE_EMAIL);
    await passwordField.sendKeys(PASSWORD);

    const emailValue = await emailField.getAttribute('value');
    expect(emailValue).to.equal(UNIQUE_EMAIL); // Assertion 2
  });

  it("3. le formulaire doit pouvoir être envoyé", async function () {
    // Sélecteur trouvé dans data-testids.md : data-testid="register-submit"
    const submitButton = await driver.wait(
      until.elementLocated(By.css('[data-testid="register-submit"]')),
      5000
    );
    await submitButton.click(); // action utilisateur : envoi du formulaire

    // Sélecteur trouvé dans data-testids.md : data-testid="register-message"
    registerMessage = await driver.wait(
      until.elementLocated(By.css('[data-testid="register-message"]')),
      5000
    );
    // On attend que l'élément devienne visible (et pas seulement présent dans le DOM) :
    // l'appli peut le remplir/l'afficher via JS après la réponse du serveur
    await driver.wait(until.elementIsVisible(registerMessage), 5000);
    const isMessageDisplayed = await registerMessage.isDisplayed();
    expect(isMessageDisplayed).to.be.true; // Assertion 3 : le formulaire a bien été traité
  });

  it("4. le résultat attendu doit être affiché", async function () {
    const messageText = await registerMessage.getText();
    expect(messageText.length).to.be.greaterThan(0); // Assertion 4 : message de résultat non vide

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});