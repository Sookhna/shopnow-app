const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Page de connexion ShopNow', function () {
  this.timeout(15000); // Selenium peut être lent à démarrer/charger les pages

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("doit afficher correctement la page de connexion", async function () {
    // 1. Ouvrir ShopNow
    await driver.get('http://localhost:3000');

    // 2. Accéder à la page de connexion
    // Sélecteur trouvé dans data-testids.md : data-testid="login-link"
    const loginLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-link"]')),
      5000
    );

    // Action utilisateur : clic sur le lien de connexion
    await loginLink.click();

    // Attendre que la navigation vers la page de login soit effective
    await driver.wait(until.urlContains('login'), 5000);

    // 3. Vérifier que la page de connexion est correctement affichée
    // Sélecteur trouvé dans data-testids.md : data-testid="login-form"
    const loginForm = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-form"]')),
      5000
    );
    const isDisplayed = await loginForm.isDisplayed();

    // Assertion : le formulaire de connexion doit être visible
    expect(isDisplayed).to.be.true;
  });
});