import {isCausalLink} from './openai.js';

export class TextAnalyser {
  constructor(grounding) {
    this.grounding = grounding;
  }

  async evaluateCausalLinksBetweenEntities(entities, {linksCallback = null} = {}) {
    const links = [];
    for (const ent1 of entities) {
      for (const ent2 of entities) {
        // Don't consider self-relationships.
        if (ent1 === ent2) {
          continue;
        }

        const block1 = `${ent1}`;
        const block2 = `${ent2}`;
        const isLink = await isCausalLink(this.grounding, block1, block2, {isOpposite: false});
        if (isLink) {
          links.push({from: ent1, to: ent2, isOpposite: false});
          linksCallback(links);
        }
        const isOppositeLink = await isCausalLink(this.grounding, block1, block2, {
          isOpposite: true
        });
        if (isOppositeLink) {
          links.push({from: ent1, to: ent2, isOpposite: true});
          linksCallback(links);
        }
      }
    }
    return links;
  }

}

