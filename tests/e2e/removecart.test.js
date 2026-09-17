const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Suppression d\'un produit du panier ShopNow', function () {
  this.timeout(15000);

  let driver;
  let productId;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("1. un produit doit être ajouté au panier", async function () {
    await driver.get('http://localhost:3000/products.html');

    // Sélecteur trouvé dans data-testids.md : data-testid="add-to-cart-{id}"
    const addToCartButton = await driver.wait(
      until.elementLocated(By.css('[data-testid^="add-to-cart-"]')),
      5000
    );
    const testIdAttr = await addToCartButton.getAttribute('data-testid');
    productId = testIdAttr.replace('add-to-cart-', '');

    await addToCartButton.click(); // action utilisateur

    // L'appli affiche une alerte native de confirmation
    const alert = await driver.wait(until.alertIsPresent(), 5000);
    await alert.accept();

    const cartCount = await driver.wait(
      until.elementLocated(By.id('cart-count')),
      5000
    );
    const cartCountText = await cartCount.getText();
    expect(Number(cartCountText)).to.be.greaterThan(0); // Assertion 1
  });

  it("2. le produit doit apparaître dans le panier", async function () {
    const cartLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart-link"]')),
      5000
    );
    await cartLink.click();

    // Sélecteur trouvé dans data-testids.md : data-testid="cart-item-{id}"
    const cartItem = await driver.wait(
      until.elementLocated(By.css(`[data-testid="cart-item-${productId}"]`)),
      5000
    );
    const isDisplayed = await cartItem.isDisplayed();
    expect(isDisplayed).to.be.true; // Assertion 2
  });

  it("3. le produit doit pouvoir être supprimé", async function () {
    // Sélecteur trouvé dans data-testids.md : data-testid="remove-item-{id}"
    const removeButton = await driver.wait(
      until.elementLocated(By.css(`[data-testid="remove-item-${productId}"]`)),
      5000
    );
    await removeButton.click(); // action utilisateur : suppression

    // Le panier étant re-généré, on vérifie qu'un des deux états attendus apparaît :
    // soit l'état "panier vide", soit le panier sans cet item précis (si d'autres produits restent)
    await driver.sleep(500); // laisse le temps au re-rendu de se terminer
    const remainingItems = await driver.findElements(
      By.css(`[data-testid="cart-item-${productId}"]`)
    );
    expect(remainingItems.length).to.equal(0); // Assertion 3 : l'item a bien disparu du DOM
  });

  it("4. le produit ne doit plus apparaître dans le panier", async function () {
    // Recharge la page panier pour confirmer que la suppression est persistée
    await driver.get('http://localhost:3000/cart.html');

    const remainingItems = await driver.findElements(
      By.css(`[data-testid="cart-item-${productId}"]`)
    );
    expect(remainingItems.length).to.equal(0); // Assertion 4 : absence confirmée après rechargement

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});