/**
 * @fileoverview Search developers.google.com/web for articles tagged
 * "Headless Chrome" and scrape results from the results page.
 */
async function scraper(appId = 'com.entrayn.qbapp') {
  try {
    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://play.google.com/store/apps/details?id=${appId}&hl=en_IN`);

    // Wait for the results page to load and display the results.
    const resultsSelector = '[aria-label^="Rated"]';
    await page.waitForSelector(resultsSelector);

    // Extract the results from the page.
    const ratings = await page.evaluate(resultsSelector => {
      const anchors = Array.from(document.querySelectorAll(resultsSelector));
      const allRatings = document.querySelectorAll(resultsSelector);
      const expandedRatings = allRatings[1];
      const allStars = Array.from(expandedRatings.parentNode.nextSibling.children);
      const stars = allStars.map(star => star.children[0].innerText);
      const ratings = allStars.map(star => parseInt(star.children[1].title.replace(/,/, ''), 10));
      stars.push('total');
      ratings.push(ratings.reduce((acc, cur) => acc + cur));
      return [stars, ratings];
    }, resultsSelector);
    console.log(`\n${appId} ratings:`);
    console.log(ratings.join('\n'));
    await browser.close();
  } catch (e) {
    console.log('error', e);
  }
}
const appIds = ['com.entrayn.qbapp', 'com.LTGExamPracticePlatform.Prep4GRE'];
const additionalAppIds = ['com.galvanizetestprep.vocabbuilder', 'com.magoosh.gre.quiz.vocabulary'];
function main() {
  const type = process.argv[2] || 'partial';
  if (type === 'all') {
    appIds.push(...additionalAppIds);
  }
  console.log('Fetching ratings for:', appIds);
  appIds.forEach(scraper);
}
main();
