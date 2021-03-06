const puppeteer = require('puppeteer');
const chalk = require('chalk');
const log = console.log;

async function scraper(appId = 'com.entrayn.qbapp') {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://play.google.com/store/apps/details?id=${appId}&hl=en_IN`);

    // Wait for the results page to load and display the results.
    const resultsSelector = '[aria-label^="Rated"]';
    await page.waitForSelector(resultsSelector);

    // Extract the results from the page.
    const ratings = await page.evaluate(resultsSelector => {
      const allRatingsOnPage = document.querySelectorAll(resultsSelector);
      const fullRatings = allRatingsOnPage[1];
      const starsWithRatings = Array.from(fullRatings.parentNode.nextSibling.children);
      const stars = starsWithRatings.map(star => star.children[0].innerText);
      const ratings = starsWithRatings.map(star =>
        parseInt(star.children[1].title.replace(/,/, ''), 10)
      );
      stars.push('total');
      ratings.push(ratings.reduce((acc, cur) => acc + cur));
      return [stars, ratings];
    }, resultsSelector);
    log(`\n${chalk.bold.magenta(appId)} ratings:`);
    log(ratings.map(item => item.join('\t')).join('\n'));
    await browser.close();
    return ratings;
  } catch (e) {
    log('error', e);
  }
}
const appIds = ['com.entrayn.qbapp', 'com.LTGExamPracticePlatform.Prep4GRE'];
const additionalAppIds = ['com.galvanizetestprep.vocabbuilder', 'com.magoosh.gre.quiz.vocabulary'];
async function main() {
  const type = process.argv[2] || 'partial';
  log(chalk.magenta('------------------------------------------------------------'));

  log(
    chalk.magenta('Fetching ratings for:\n') +
      chalk.bold.magenta((type === 'all' ? appIds.concat(additionalAppIds) : appIds).join('\n'))
  );
  log(chalk.magenta('\n------------------------------------------------------------'));

  // This will end up with results out of order?
  const baseRatings = await Promise.all(appIds.map(scraper));
  // log(baseRatings);
  if (type === 'all') {
    log(chalk.magenta('\n------------------------------------------------------------'));
    const additionalRatings = await Promise.all(additionalAppIds.map(scraper));
    // log(additionalRatings);
  }
  log(chalk.magenta('\n------------------------------------------------------------'));
}
main();
