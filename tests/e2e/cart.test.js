const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Ajout au panier ShopNow', function () {
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

  it("1. l'utilisateur doit pouvoir accéder aux produits", async function () {
    await driver.get('http://localhost:3000/products.html');

    // Sélecteur trouvé dans data-testids.md : data-testid="products-page"
    const productsPage = await driver.wait(
      until.elementLocated(By.css('[data-testid="products-page"]')),
      5000
    );
    const isDisplayed = await productsPage.isDisplayed();
    expect(isDisplayed).to.be.true; // Assertion 1
  });

  it("2. un produit doit pouvoir être ajouté au panier", async function () {
    // Sélecteur trouvé dans data-testids.md : data-testid="add-to-cart-{id}"
    // On prend le premier bouton "ajouter au panier" trouvé sur la page
    const addToCartButton = await driver.wait(
      until.elementLocated(By.css('[data-testid^="add-to-cart-"]')),
      5000
    );

    // On récupère l'id du produit à partir de son data-testid, pour vérifier
    // plus tard qu'il s'agit bien du même produit dans le panier
    const testIdAttr = await addToCartButton.getAttribute('data-testid');
    productId = testIdAttr.replace('add-to-cart-', '');

    await addToCartButton.click(); // action utilisateur : ajout au panier

    // L'appli affiche une alerte native (window.alert) pour confirmer l'ajout :
    // il faut l'accepter avant de pouvoir continuer, sinon Selenium bloque
    const alert = await driver.wait(until.alertIsPresent(), 5000);
    await alert.accept();

    // Vérifie que le compteur du panier (dans la nav) a bien été mis à jour
    const cartCount = await driver.wait(
      until.elementLocated(By.id('cart-count')),
      5000
    );
    const cartCountText = await cartCount.getText();
    expect(Number(cartCountText)).to.be.greaterThan(0); // Assertion 2
  });

  it("3. le panier doit contenir le produit sélectionné", async function () {
    // Sélecteur trouvé dans data-testids.md : data-testid="cart-link"
    const cartLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart-link"]')),
      5000
    );
    await cartLink.click(); // action utilisateur : accès au panier

    // Sélecteur trouvé dans data-testids.md : data-testid="cart-item-{id}"
    // On vérifie que l'item correspondant au produit ajouté est bien présent
    const cartItem = await driver.wait(
      until.elementLocated(By.css(`[data-testid="cart-item-${productId}"]`)),
      5000
    );
    const isCartItemDisplayed = await cartItem.isDisplayed();
    expect(isCartItemDisplayed).to.be.true; // Assertion 3

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});