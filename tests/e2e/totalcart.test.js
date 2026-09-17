const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

// Convertit un texte de prix affiché (ex: "19,99 €" ou "$19.99") en nombre
function parsePrice(text) {
  const cleaned = text.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned);
}

describe('Calcul du total du panier ShopNow', function () {
  this.timeout(15000);

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

  it("1. un produit doit être ajouté au panier", async function () {
    await driver.get('http://localhost:3000/products.html');

    // Accéder au détail d'un produit pour connaître son prix réel
    const viewProductLink = await driver.wait(
      until.elementLocated(By.css('[data-testid^="view-product-"]')),
      5000
    );
    await viewProductLink.click();

    const productPriceEl = await driver.wait(
      until.elementLocated(By.css('[data-testid="product-price"]')),
      5000
    );
    const priceText = await productPriceEl.getText();
    unitPrice = parsePrice(priceText);

    // Ajouter ce même produit au panier depuis la page de détail
    const addToCartButton = await driver.wait(
      until.elementLocated(By.css('[data-testid^="add-to-cart-"]')),
      5000
    );
    const testIdAttr = await addToCartButton.getAttribute('data-testid');
    productId = testIdAttr.replace('add-to-cart-', '');

    await addToCartButton.click(); // action utilisateur

    const alert = await driver.wait(until.alertIsPresent(), 5000);
    await alert.accept();

    // Vérifie que le compteur du panier reflète bien l'ajout
    const cartCount = await driver.wait(
      until.elementLocated(By.id('cart-count')),
      5000
    );
    const cartCountText = await cartCount.getText();
    expect(Number(cartCountText)).to.be.greaterThan(0); // Assertion 1
  });

  it("2. une quantité doit être définie", async function () {
    const cartLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart-link"]')),
      5000
    );
    await cartLink.click();

    const initialQuantity = await readQuantity();

    // On augmente la quantité à 3 (2 clics supplémentaires depuis 1)
    for (let i = 0; i < 2; i++) {
      const increaseButton = await driver.wait(
        until.elementLocated(
          By.css(`button[data-action="increase"][data-id="${productId}"]`)
        ),
        5000
      );
      await increaseButton.click(); // action utilisateur
    }

    const finalQuantity = await readQuantity();
    expect(finalQuantity).to.equal(initialQuantity + 2); // Assertion 2 : quantité bien définie
  });

  it("3. le montant total affiché doit correspondre au calcul attendu", async function () {
    const quantity = await readQuantity();

    // Sélecteur trouvé dans data-testids.md : data-testid="cart-total"
    const cartTotalEl = await driver.wait(
      until.elementLocated(By.css('[data-testid="cart-total"]')),
      5000
    );
    const totalText = await cartTotalEl.getText();
    const displayedTotal = parsePrice(totalText);

    const expectedTotal = Math.round(unitPrice * quantity * 100) / 100;

    // Vérification FONCTIONNELLE : le total doit correspondre au calcul
    // (prix unitaire × quantité), pas seulement être "un nombre affiché"
    expect(displayedTotal).to.be.closeTo(expectedTotal, 0.01); // Assertion 3

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});