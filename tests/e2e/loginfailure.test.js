const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

const EMAIL = 'alice@shopnow.test';
const WRONG_PASSWORD = 'MauvaisMotDePasse123';

describe('Connexion refusée ShopNow', function () {
  this.timeout(15000);

  let driver;
  let loginMessage;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();

    // Point de départ : la page de connexion
    await driver.get('http://localhost:3000/login.html');

    // Sélecteurs trouvés dans data-testids.md
    const emailField = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-email"]')),
      5000
    );
    const passwordField = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-password"]')),
      5000
    );
    const submitButton = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-submit"]')),
      5000
    );

    // 1. Tentative de connexion effectuée, avec un mauvais mot de passe
    await emailField.sendKeys(EMAIL);
    await passwordField.sendKeys(WRONG_PASSWORD);
    await submitButton.click(); // action utilisateur : tentative de connexion

    // Sélecteur trouvé dans data-testids.md : data-testid="login-message"
    loginMessage = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-message"]')),
      5000
    );
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("2. la connexion doit être refusée", async function () {
    // L'utilisateur ne doit pas être redirigé : l'URL doit toujours contenir "login"
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('login'); // Assertion 1 : connexion refusée, pas de redirection
  });

  it("3. un message d'erreur doit être affiché", async function () {
    const isMessageDisplayed = await loginMessage.isDisplayed();
    expect(isMessageDisplayed).to.be.true; // Assertion 2 : message d'erreur affiché

    const messageText = await loginMessage.getText();
    expect(messageText.length).to.be.greaterThan(0); // Assertion 3 : message non vide

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});