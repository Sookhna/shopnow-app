const { By, until } = require('selenium-webdriver');

const BASE_URL = 'http://localhost:3000';

/**
 * Page Object : page de connexion (login.html)
 * Regroupe les éléments (sélecteurs) et les actions possibles sur cette page.
 * Les fichiers de scénarios (tests/e2e/*) n'utilisent que ces méthodes,
 * jamais directement By.css(...) — ça isole les tests des détails du HTML.
 */
class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  // --- Éléments de la page ---

  async getForm() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="login-form"]')),
      5000
    );
  }

  async getEmailField() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="login-email"]')),
      5000
    );
  }

  async getPasswordField() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="login-password"]')),
      5000
    );
  }

  async getSubmitButton() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="login-submit"]')),
      5000
    );
  }

  async getMessage() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="login-message"]')),
      5000
    );
  }

  async getLoggedUserIndicator() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="logged-user"]')),
      5000
    );
  }

  // --- Actions ---

  async open() {
    await this.driver.get(`${BASE_URL}/login.html`);
    await this.getForm(); // attente explicite : la page est prête
  }

  async login(email, password) {
    const emailField = await this.getEmailField();
    const passwordField = await this.getPasswordField();
    await emailField.sendKeys(email);
    await passwordField.sendKeys(password);

    const submitButton = await this.getSubmitButton();
    await this.driver.wait(until.elementIsEnabled(submitButton), 5000); // attente explicite
    await submitButton.click();
  }

  async isLoggedIn() {
    try {
      const loggedUser = await this.getLoggedUserIndicator();
      return await loggedUser.isDisplayed();
    } catch {
      return false;
    }
  }
}

module.exports = LoginPage;