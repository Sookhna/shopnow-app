const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

const EMAIL = 'alice@shopnow.test';
const PASSWORD = 'Password123!';

describe('Déconnexion ShopNow', function () {
  this.timeout(15000);

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();

    // Étape préalable : se connecter (comme dans Test 4)
    await driver.get('http://localhost:3000/login.html');

    const emailField = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-email"]')),
      5000
    );
    const passwordField = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-password"]')),
      5000
    );
    await emailField.sendKeys(EMAIL);
    await passwordField.sendKeys(PASSWORD);

    const submitButton = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-submit"]')),
      5000
    );
    await submitButton.click();

    // Confirme que la connexion a bien réussi avant de tester la déconnexion
    await driver.wait(
      until.elementLocated(By.css('[data-testid="logged-user"]')),
      5000
    );
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("1. un utilisateur connecté doit pouvoir se déconnecter", async function () {
    // Sélecteur trouvé dans data-testids.md : data-testid="logout-button"
    const logoutButton = await driver.wait(
      until.elementLocated(By.css('[data-testid="logout-button"]')),
      5000
    );
    await logoutButton.click(); // action utilisateur : déconnexion

    // "logged-user" ne doit plus être présent dans le DOM après déconnexion
    const loggedUserElements = await driver.wait(async () => {
      const els = await driver.findElements(By.css('[data-testid="logged-user"]'));
      return els.length === 0;
    }, 5000);
    expect(loggedUserElements).to.be.true; // Assertion 1 : déconnexion effective
  });

  it("2. l'interface doit revenir à l'état d'un utilisateur non connecté", async function () {
    // Sélecteur trouvé dans data-testids.md : data-testid="login-link"
    const loginLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-link"]')),
      5000
    );
    const isLoginLinkDisplayed = await loginLink.isDisplayed();
    expect(isLoginLinkDisplayed).to.be.true; // Assertion 2 : lien de connexion réapparu

    // Vérifie aussi que "logout-button" a bien disparu
    const logoutButtons = await driver.findElements(
      By.css('[data-testid="logout-button"]')
    );
    expect(logoutButtons.length).to.equal(0); // Assertion 3

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});