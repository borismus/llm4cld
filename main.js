import {extractEntities} from './macromaker.js';
import {callGPT4} from './openai.js';

const GROUNDING = `More peasants had more access to horses, which gave them more mobility. This had several important implications. First, farmers could now get to the market on their own where ordinarily they would be reliant on merchants. Effectively this reduced shipping costs for farmers and made their whole operation more profitable. Further democratizing transportation were improved wagons. Up to now, these had been two wheeled, but by the 13th century, a four wheeled version emerged. Whippletrees allowed multiple animals to pull heavier plows, pivoted front axles greatly increased maneuverability and adequate brakes were increasingly available.

These changes allowed peasants to farm land further from a river — the highway system of the Middle Ages. This in turn meant more farms in the land, and an increase to general carrying capacity. An increase in population is highly associated with prosperous times (the contra positive holds). A second benefit of horse-based mobility were more living options. Now peasants could live in larger towns and ride to their farm every morning to do their day’s work, then return to their town. This increased their prosperity in many ways, giving them access to schools for their children, more power to self-govern via communes, access to culture, pubs, and other amenities found in a Medieval towns.`;

const INTERESTING_ENTITIES = ['peasant mobility', 'draft horses', 'farm yield', 'farm profits', 'town size', 'cheap transport']


async function evaluateCausalLinksBetweenEntities(entities) {
  const links = [];
  for (const ent1 of entities) {
    for (const ent2 of entities) {
      // Don't consider self-relationships.
      if (ent1 === ent2) {
        continue;
      }

      const block1 = `${ent1}`;
      const block2 = `${ent2}`;
      const isLink = await isCausalLinkBetween(GROUNDING, block1, block2);
      if (isLink) {
        links.push({from: ent1, to: ent2});
      }
    }
  }
  return links;
}


async function main() {
  let sgml = '';
  // isCausalLinkBetween(GROUNDING, 'more chickens', 'more pain');
  // isCausalLinkBetween(GROUNDING, 'more knights', 'fewer oxen');
  // isCausalLinkBetween(GROUNDING, 'heavier armor', 'stronger horses');
  // const entities = await extractEntities(GROUNDING, 4);
  // const links = await evaluateCausalLinksBetweenEntities(entities);
  // const links = await evaluateCausalLinksBetweenEntities(INTERESTING_ENTITIES);

  const test = callGPT4('hello');

  for (const {from, to} of links) {
    sgml += `${from} --> ${to}\n`;
  }
  console.log(sgml);
}

window.addEventListener('DOMContentLoaded', main)


window.extractEntities = () => {
  console.log('extractEntities');
};

window.evaluateLinks = () => {
  console.log('evaluateLinks');
}