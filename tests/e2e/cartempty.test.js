const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Panier vide ShopNow', function () {
  this.timeout(15000);

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();

    // Étape préalable : s'assurer qu'il y a au moins un produit dans le panier
    await driver.get('http://localhost:3000/products.html');

    const addToCartButton = await driver.wait(
      until.elementLocated(By.css('[data-testid^="add-to-cart-"]')),
      5000
    );
    await addToCartButton.click();

    const alert = await driver.wait(until.alertIsPresent(), 5000);
    await alert.accept();

    const cartLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart-link"]')),
      5000
    );
    await cartLink.click();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("1. le panier doit pouvoir être vidé", async function () {
    // Sélecteur trouvé dans data-testids.md : data-testid="clear-cart"
    const clearCartButton = await driver.wait(
      until.elementLocated(By.css('[data-testid="clear-cart"]')),
      5000
    );
    await clearCartButton.click(); // action utilisateur : vider le panier

    // Sélecteur trouvé dans data-testids.md : data-testid="empty-cart"
    const emptyCart = await driver.wait(
      until.elementLocated(By.css('[data-testid="empty-cart"]')),
      5000
    );
    const isDisplayed = await emptyCart.isDisplayed();
    expect(isDisplayed).to.be.true; // Assertion 1 : le vidage a bien fonctionné
  });

  it("2. aucun produit ne doit rester dans le panier", async function () {
    // Aucun élément "cart-item-*" ne doit plus exister dans le DOM
    const remainingItems = await driver.findElements(
      By.css('[data-testid^="cart-item-"]')
    );
    expect(remainingItems.length).to.equal(0); // Assertion 2

    // Le compteur du panier dans la nav doit lui aussi être revenu à zéro
    const cartCount = await driver.wait(
      until.elementLocated(By.id('cart-count')),
      5000
    );
    const cartCountText = await cartCount.getText();
    expect(Number(cartCountText)).to.equal(0); // Assertion 3
  });

  it("3. l'état « panier vide » doit être correctement affiché", async function () {
    // Recharge la page pour confirmer que l'état vide est bien persisté
    await driver.get('http://localhost:3000/cart.html');

    const emptyCart = await driver.wait(
      until.elementLocated(By.css('[data-testid="empty-cart"]')),
      5000
    );
    const isDisplayed = await emptyCart.isDisplayed();
    expect(isDisplayed).to.be.true; // Assertion 4

    const messageText = await emptyCart.getText();
    expect(messageText.length).to.be.greaterThan(0); // Assertion 5 : message non vide

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});