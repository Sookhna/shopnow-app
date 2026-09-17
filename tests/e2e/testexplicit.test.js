const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

const EMAIL = 'alice@shopnow.test';
const PASSWORD = 'Password123!';

/**
 * Test 13 — Attente explicite Selenium
 *
 * Objectif : attendre qu'un élément soit réellement PRÊT (présent, visible,
 * activé) avant d'agir dessus, plutôt que d'utiliser un délai fixe arbitraire
 * comme `driver.sleep(2000)`.
 *
 * ❌ À éviter : await driver.sleep(2000); await submitButton.click();
 *    → repose sur une durée devinée, fragile selon la vitesse de la machine
 *      ou du réseau (trop court = échec aléatoire, trop long = test lent).
 *
 * ✅ Attente explicite : await driver.wait(until.elementIsEnabled(el), 5000)
 *    → attend précisément la condition nécessaire, pas plus, pas moins.
 */
describe('Connexion réussie ShopNow (avec attente explicite)', function () {
  this.timeout(15000);

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:3000/login.html');
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("doit se connecter en attendant explicitement que chaque élément soit prêt", async function () {
    // Attente explicite n°1 : attendre que le champ email soit PRÉSENT dans le DOM
    const emailField = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-email"]')),
      5000
    );
    // Attente explicite n°2 : attendre qu'il soit VISIBLE (pas caché par un
    // écran de chargement ou une animation en cours)
    await driver.wait(until.elementIsVisible(emailField), 5000);
    await emailField.sendKeys(EMAIL);

    const passwordField = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-password"]')),
      5000
    );
    await driver.wait(until.elementIsVisible(passwordField), 5000);
    await passwordField.sendKeys(PASSWORD);

    const submitButton = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-submit"]')),
      5000
    );
    // Attente explicite n°3 : attendre que le bouton soit ACTIVÉ (cliquable)
    // avant de cliquer — utile si le bouton reste désactivé tant que le
    // formulaire n'est pas valide, ou pendant un court instant au chargement
    await driver.wait(until.elementIsEnabled(submitButton), 5000);
    await submitButton.click(); // action utilisateur : validation du formulaire

    // Attente explicite n°4 : attendre que le résultat de l'action (connexion)
    // soit visible, au lieu de deviner un délai après le clic
    const loggedUser = await driver.wait(
      until.elementLocated(By.css('[data-testid="logged-user"]')),
      5000
    );
    await driver.wait(until.elementIsVisible(loggedUser), 5000);

    const isDisplayed = await loggedUser.isDisplayed();
    expect(isDisplayed).to.be.true; // Assertion : connexion réussie et confirmée
  });
});