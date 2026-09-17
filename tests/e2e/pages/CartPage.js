const { By, until } = require('selenium-webdriver');

const BASE_URL = 'http://localhost:3000';

/**
 * Page Object : page Panier (cart.html)
 */
class CartPage {
  constructor(driver) {
    this.driver = driver;
  }

  // --- Éléments ---

  async getCartLink() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="cart-link"]')),
      5000
    );
  }

  async getCartItem(productId) {
    return this.driver.wait(
      until.elementLocated(By.css(`[data-testid="cart-item-${productId}"]`)),
      5000
    );
  }

  async getQuantityDisplay(productId) {
    return this.driver.wait(
      until.elementLocated(By.css(`[data-testid="quantity-${productId}"]`)),
      5000
    );
  }

  async getIncreaseButton(productId) {
    return this.driver.wait(
      until.elementLocated(
        By.css(`button[data-action="increase"][data-id="${productId}"]`)
      ),
      5000
    );
  }

  async getDecreaseButton(productId) {
    return this.driver.wait(
      until.elementLocated(
        By.css(`button[data-action="decrease"][data-id="${productId}"]`)
      ),
      5000
    );
  }

  async getRemoveButton(productId) {
    return this.driver.wait(
      until.elementLocated(By.css(`[data-testid="remove-item-${productId}"]`)),
      5000
    );
  }

  async getTotalElement() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="cart-total"]')),
      5000
    );
  }

  async getClearCartButton() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="clear-cart"]')),
      5000
    );
  }

  async getEmptyCartIndicator() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="empty-cart"]')),
      5000
    );
  }

  // --- Actions ---

  async open() {
    await this.driver.get(`${BASE_URL}/cart.html`);
  }

  async goToCart() {
    const link = await this.getCartLink();
    await link.click();
  }

  async hasProduct(productId) {
    try {
      const item = await this.getCartItem(productId);
      return await item.isDisplayed();
    } catch {
      return false;
    }
  }

  async getQuantity(productId) {
    const el = await this.getQuantityDisplay(productId);
    return Number(await el.getText());
  }

  async increaseQuantity(productId) {
    const button = await this.getIncreaseButton(productId);
    await button.click();
  }

  async decreaseQuantity(productId) {
    const button = await this.getDecreaseButton(productId);
    await button.click();
  }

  async removeProduct(productId) {
    const button = await this.getRemoveButton(productId);
    await button.click();
  }

  async getTotal() {
    const el = await this.getTotalElement();
    const text = await el.getText();
    const cleaned = text.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  }

  async clear() {
    const button = await this.getClearCartButton();
    await button.click();
  }

  async isEmpty() {
    try {
      const el = await this.getEmptyCartIndicator();
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }
}

module.exports = CartPage;