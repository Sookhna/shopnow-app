const { By, until } = require('selenium-webdriver');

const BASE_URL = 'http://localhost:3000';

/**
 * Page Object : page Produits (products.html) et page de détail (product.html)
 */
class ProductsPage {
  constructor(driver) {
    this.driver = driver;
  }

  // --- Éléments ---

  async getPageContainer() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="products-page"]')),
      5000
    );
  }

  async getFirstProductLink() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid^="view-product-"]')),
      5000
    );
  }

  async getProductName() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="product-name"]')),
      5000
    );
  }

  async getProductPrice() {
    return this.driver.wait(
      until.elementLocated(By.css('[data-testid="product-price"]')),
      5000
    );
  }

  async getAddToCartButton(productId) {
    const selector = productId
      ? `[data-testid="add-to-cart-${productId}"]`
      : '[data-testid^="add-to-cart-"]';
    return this.driver.wait(until.elementLocated(By.css(selector)), 5000);
  }

  // --- Actions ---

  async open() {
    await this.driver.get(`${BASE_URL}/products.html`);
    await this.getPageContainer(); // attente explicite
  }

  async isDisplayed() {
    const container = await this.getPageContainer();
    return container.isDisplayed();
  }

  /** Clique sur le premier produit listé et retourne sur la page de détail */
  async selectFirstProduct() {
    const link = await this.getFirstProductLink();
    await link.click();
  }

  /** À utiliser depuis la page de détail : lit le nom, prix, et id du produit affiché */
  async readCurrentProductDetails() {
    const nameEl = await this.getProductName();
    const priceEl = await this.getProductPrice();
    const addToCartButton = await this.getAddToCartButton();

    const name = await nameEl.getText();
    const priceText = await priceEl.getText();
    const testIdAttr = await addToCartButton.getAttribute('data-testid');
    const id = testIdAttr.replace('add-to-cart-', '');

    return { id, name, price: this.parsePrice(priceText) };
  }

  /** Ajoute le produit courant (page détail ou carte produit) au panier, gère l'alerte native */
  async addToCart(productId) {
    const button = await this.getAddToCartButton(productId);
    await button.click();

    const alert = await this.driver.wait(until.alertIsPresent(), 5000);
    await alert.accept();
  }

  parsePrice(text) {
    const cleaned = text.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  }
}

module.exports = ProductsPage;