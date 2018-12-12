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
    return ratings;
  } catch (e) {
    console.log('error', e);
  }
}
const appIds = ['com.entrayn.qbapp', 'com.LTGExamPracticePlatform.Prep4GRE'];
const additionalAppIds = ['com.galvanizetestprep.vocabbuilder', 'com.magoosh.gre.quiz.vocabulary'];
async function main() {
  const type = process.argv[2] || 'partial';

  console.log('Fetching ratings for:', type === 'all' ? appIds.concat(additionalAppIds) : appIds);
  console.log('\n------------------------------------------------------------');

  // This will end up with results out of order?
  const baseRatings = await Promise.all(appIds.map(scraper));
  // console.log(baseRatings);
  if (type === 'all') {
    console.log('\n------------------------------------------------------------');
    const additionalRatings = await Promise.all(additionalAppIds.map(scraper));
    // console.log(additionalRatings);
  }
}
main();
