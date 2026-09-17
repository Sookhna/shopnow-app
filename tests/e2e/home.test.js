const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Page d\'accueil ShopNow', function () {
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

  it("doit être accessible et afficher correctement la page d'accueil avec son titre", async function () {
    // 1. Vérifier que ShopNow est accessible
    await driver.get('http://localhost:3000');
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('localhost:3000'); // Assertion 1 : accessibilité

    // 2. Vérifier que la page d'accueil est correctement affichée
    // Sélecteur trouvé dans data-testids.md : data-testid="home-page"
    const homePage = await driver.wait(
      until.elementLocated(By.css('[data-testid="home-page"]')),
      5000
    );
    const isHomePageDisplayed = await homePage.isDisplayed();
    expect(isHomePageDisplayed).to.be.true; // Assertion 2 : page correctement affichée

    // 3. Vérifier que le titre principal est présent
    // Un seul <h1> sur la page : <h1>Bienvenue sur ShopNow</h1>
    const title = await driver.wait(
      until.elementLocated(By.css('h1')),
      5000
    );
    const titleText = await title.getText();
    expect(titleText).to.equal('Bienvenue sur ShopNow'); // Assertion 3 : titre présent et correct

    //await driver.sleep(3000); // ⚠️ Pause de debug uniquement — à retirer une fois validé visuellement
  });
});