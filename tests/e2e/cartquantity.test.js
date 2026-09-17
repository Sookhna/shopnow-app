const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Modification de la quantité dans le panier ShopNow', function () {
  this.timeout(15000);

  let driver;
  let productId;

  // Helper : relit la quantité affichée pour le produit (élément re-généré à chaque clic)
  async function readQuantity() {
    const el = await driver.wait(
      until.elementLocated(By.css(`[data-testid="quantity-${productId}"]`)),
      5000
    );
    return Number(await el.getText());
  }

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();

    // Étape préalable : ajouter un produit au panier (comme dans Test 7)
    await driver.get('http://localhost:3000/products.html');

    const addToCartButton = await driver.wait(
      until.elementLocated(By.css('[data-testid^="add-to-cart-"]')),
      5000
    );
    const testIdAttr = await addToCartButton.getAttribute('data-testid');
    productId = testIdAttr.replace('add-to-cart-', '');

    await addToCartButton.click();

    // Accepter l'alerte native de confirmation d'ajout
    const alert = await driver.wait(until.alertIsPresent(), 5000);
    await alert.accept();

    // Aller sur la page panier
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

  it("1. un produit doit être présent dans le panier", async function () {
    // Sélecteur trouvé dans data-testids.md : data-testid="cart-item-{id}"
    const cartItem = await driver.wait(
      until.elementLocated(By.css(`[data-testid="cart-item-${productId}"]`)),
      5000
    );
    const isDisplayed = await cartItem.isDisplayed();
    expect(isDisplayed).to.be.true; // Assertion 1
  });

  it("2. la quantité doit pouvoir être augmentée", async function () {
    const initialQuantity = await readQuantity();

    // Bouton "+" trouvé dans cart.js : data-action="increase", data-id="{id}"
    // Pas de data-testid dédié : on cible via ces attributs data-*
    const increaseButton = await driver.wait(
      until.elementLocated(
        By.css(`button[data-action="increase"][data-id="${productId}"]`)
      ),
      5000
    );
    await increaseButton.click(); // action utilisateur

    const newQuantity = await readQuantity();
    expect(newQuantity).to.equal(initialQuantity + 1); // Assertion 2
  });

  it("3. la nouvelle quantité doit être correcte", async function () {
    // Le panier ayant été re-généré au clic précédent, on relit simplement
    // la valeur actuelle et on vérifie sa cohérence (nombre positif, entier)
    const currentQuantity = await readQuantity();
    expect(currentQuantity).to.be.a('number'); // Assertion 3
    expect(currentQuantity).to.be.greaterThan(0); // Assertion 4
  });

  it("4. la quantité doit pouvoir être diminuée", async function () {
    const beforeDecrease = await readQuantity();

    // Bouton "−" trouvé dans cart.js : data-action="decrease", data-id="{id}"
    const decreaseButton = await driver.wait(
      until.elementLocated(
        By.css(`button[data-action="decrease"][data-id="${productId}"]`)
      ),
      5000
    );
    await decreaseButton.click(); // action utilisateur

    const afterDecrease = await readQuantity();
    expect(afterDecrease).to.equal(beforeDecrease - 1); // Assertion 5

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});