const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Page Produits ShopNow', function () {
  this.timeout(15000);

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("doit permettre d'accéder à la page Produits et afficher des produits", async function () {
    // Point de départ : la page d'accueil
    await driver.get('http://localhost:3000');

    // 1. Accéder à la page Produits
    // Sélecteur trouvé dans data-testids.md : data-testid="products-link"
    const productsLink = await driver.wait(
      until.elementLocated(By.css('[data-testid="products-link"]')),
      5000
    );
    await productsLink.click(); // action utilisateur

    // 2. Vérifier que la page Produits est affichée
    // Sélecteur trouvé dans data-testids.md : data-testid="products-page"
    const productsPage = await driver.wait(
      until.elementLocated(By.css('[data-testid="products-page"]')),
      5000
    );
    const isProductsPageDisplayed = await productsPage.isDisplayed();
    expect(isProductsPageDisplayed).to.be.true; // Assertion 1 : page Produits affichée

    // 3. Vérifier que des produits sont présents
    // Sélecteur trouvé dans data-testids.md : data-testid="product-card-{id}"
    // On récupère tous les éléments dont le data-testid commence par "product-card-"
    const productCards = await driver.findElements(
      By.css('[data-testid^="product-card-"]')
    );
    expect(productCards.length).to.be.greaterThan(0); // Assertion 2 : au moins un produit présent

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});