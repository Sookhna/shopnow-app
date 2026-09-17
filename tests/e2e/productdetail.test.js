const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Page de détail d\'un produit ShopNow', function () {
  this.timeout(15000);

  let driver;
  let productPage, productName, productPrice;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();

    // Point de départ : la page Produits
    await driver.get('http://localhost:3000/products.html');

    // Sélectionner un produit (action utilisateur, commune aux 3 tests)
    // Sélecteur trouvé dans data-testids.md : data-testid="view-product-{id}"
    const viewProductLink = await driver.wait(
      until.elementLocated(By.css('[data-testid^="view-product-"]')),
      5000
    );
    await viewProductLink.click();

    // On récupère les éléments une fois, réutilisés dans les 3 tests ci-dessous
    productPage = await driver.wait(
      until.elementLocated(By.css('[data-testid="product-page"]')),
      5000
    );
    productName = await driver.wait(
      until.elementLocated(By.css('[data-testid="product-name"]')),
      5000
    );
    productPrice = await driver.wait(
      until.elementLocated(By.css('[data-testid="product-price"]')),
      5000
    );
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("doit afficher la page de détail après sélection du produit", async function () {
    const isProductPageDisplayed = await productPage.isDisplayed();
    expect(isProductPageDisplayed).to.be.true;
  });

  it("doit afficher le nom du produit", async function () {
    const nameText = await productName.getText();
    expect(nameText.length).to.be.greaterThan(0);
  });

  it("doit afficher le prix du produit", async function () {
    const priceText = await productPrice.getText();
    expect(priceText.length).to.be.greaterThan(0);

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});