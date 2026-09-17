const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

const EMAIL = 'alice@shopnow.test';
const PASSWORD = 'Password123!';

function parsePrice(text) {
  const cleaned = text.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned);
}

/**
 * Test 14 — Parcours utilisateur complet (End-to-End)
 *
 * Scénario : Ouverture → Connexion → Produits → Sélection → Détail →
 *            Ajout au panier → Panier → Modification quantité →
 *            Vérification total → Suppression → Panier vide
 *
 * Plusieurs pages : login.html, products.html, product.html, cart.html
 * Attente explicite : voir driver.wait(until.elementIsEnabled(...)) plus bas
 */
describe('Parcours utilisateur complet ShopNow (E2E)', function () {
  this.timeout(30000);

  let driver;
  let productId;
  let unitPrice;

  async function readQuantity() {
    const el = await driver.wait(
      until.elementLocated(By.css(`[data-testid="quantity-${productId}"]`)),
      5000
    );
    return Number(await el.getText());
  }

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("Étape 1-2 : ouvrir ShopNow et se connecter", async function () {
    // Page 1 : login.html
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
    // Attente explicite : le bouton doit être activé avant le clic
    await driver.wait(until.elementIsEnabled(submitButton), 5000);
    await submitButton.click(); // action utilisateur

    const loggedUser = await driver.wait(
      until.elementLocated(By.css('[data-testid="logged-user"]')),
      5000
    );
    expect(await loggedUser.isDisplayed()).to.be.true; // Assertion 1 : connexion réussie
  });

  it("Étape 3-4 : accéder aux produits et en sélectionner un", async function () {
    // Page 2 : products.html
    const productsLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="products-link"]')),
      5000
    );
    await productsLink.click(); // action utilisateur

    const productsPage = await driver.wait(
      until.elementLocated(By.css('[data-testid="products-page"]')),
      5000
    );
    expect(await productsPage.isDisplayed()).to.be.true; // Assertion 2 : page Produits affichée

    const viewProductLink = await driver.wait(
      until.elementLocated(By.css('[data-testid^="view-product-"]')),
      5000
    );
    await viewProductLink.click(); // action utilisateur : sélection d'un produit
  });

  it("Étape 5 : consulter le détail du produit", async function () {
    // Page 3 : product.html
    const productName = await driver.wait(
      until.elementLocated(By.css('[data-testid="product-name"]')),
      5000
    );
    const productPriceEl = await driver.wait(
      until.elementLocated(By.css('[data-testid="product-price"]')),
      5000
    );

    const nameText = await productName.getText();
    expect(nameText.length).to.be.greaterThan(0); // Assertion 3 : nom du produit présent

    unitPrice = parsePrice(await productPriceEl.getText());

    const addToCartButton = await driver.wait(
      until.elementLocated(By.css('[data-testid^="add-to-cart-"]')),
      5000
    );
    const testIdAttr = await addToCartButton.getAttribute('data-testid');
    productId = testIdAttr.replace('add-to-cart-', '');
  });

  it("Étape 6-7 : ajouter au panier et ouvrir le panier", async function () {
    const addToCartButton = await driver.wait(
      until.elementLocated(By.css(`[data-testid="add-to-cart-${productId}"]`)),
      5000
    );
    await addToCartButton.click(); // action utilisateur : ajout au panier

    const alert = await driver.wait(until.alertIsPresent(), 5000);
    await alert.accept();

    const cartLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart-link"]')),
      5000
    );
    await cartLink.click(); // action utilisateur

    // Page 4 : cart.html
    const cartItem = await driver.wait(
      until.elementLocated(By.css(`[data-testid="cart-item-${productId}"]`)),
      5000
    );
    expect(await cartItem.isDisplayed()).to.be.true; // Assertion 4 : produit présent dans le panier
  });

  it("Étape 8-9 : modifier la quantité et vérifier le total", async function () {
    const initialQuantity = await readQuantity();

    const increaseButton = await driver.wait(
      until.elementLocated(
        By.css(`button[data-action="increase"][data-id="${productId}"]`)
      ),
      5000
    );
    await increaseButton.click(); // action utilisateur : augmenter la quantité

    const newQuantity = await readQuantity();
    expect(newQuantity).to.equal(initialQuantity + 1); // Assertion 5 : quantité mise à jour

    const cartTotalEl = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart-total"]')),
      5000
    );
    const displayedTotal = parsePrice(await cartTotalEl.getText());
    const expectedTotal = Math.round(unitPrice * newQuantity * 100) / 100;

    expect(displayedTotal).to.be.closeTo(expectedTotal, 0.01); // Assertion 6 : total correct
  });

  it("Étape 10-11 : supprimer le produit et vérifier le panier vide", async function () {
    const removeButton = await driver.wait(
      until.elementLocated(By.css(`[data-testid="remove-item-${productId}"]`)),
      5000
    );
    await removeButton.click(); // action utilisateur : suppression

    const emptyCart = await driver.wait(
      until.elementLocated(By.css('[data-testid="empty-cart"]')),
      5000
    );
    // Attente explicite supplémentaire : s'assurer que l'état vide est bien visible
    await driver.wait(until.elementIsVisible(emptyCart), 5000);
    expect(await emptyCart.isDisplayed()).to.be.true; // Assertion 7 : panier vide confirmé

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});