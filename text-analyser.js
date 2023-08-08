import {explainCausalLink, isCausalLink} from './openai.js';

export class TextAnalyser {
  constructor(grounding, {includeExplanation = true} = {}) {
    this.grounding = grounding;
    this.includeExplanation = includeExplanation;
    this.isCancelling = false;
  }

  cancel() {
    this.isCancelling = true;
  }

  async evaluateCausalLinksBetweenEntities(entities, {linksCallback = null} = {}) {
    this.isCancelling = false;

    const links = [];
    for (const ent1 of entities) {
      for (const ent2 of entities) {
        // Don't consider self-relationships.
        if (ent1 === ent2) {
          continue;
        }
        if (this.isCancelling) {
          return;
        }

        const block1 = `${ent1}`;
        const block2 = `${ent2}`;
        let isLink = false;
        let isOppositeLink = false;
        try {
          updateStatus(`Checking if more ${ent1} causes more ${ent2}?`);
          isLink = await isCausalLink(this.grounding, block1, block2, {isOpposite: false});
          if (isLink) {
            links.push({
              from: ent1,
              to: ent2,
              isOpposite: false,
              explanation: await this.explainIfNeeded(ent1, ent2, false),
            });
            linksCallback(links);
          }
        } catch (e) {
          console.error(e);
        }

        try {
          updateStatus(`Checking if more ${ent1} causes less ${ent2}?`);
          isOppositeLink = await isCausalLink(this.grounding, block1, block2, {
            isOpposite: true
          });
          if (isOppositeLink) {
            links.push({
              from: ent1,
              to: ent2,
              isOpposite: true,
              explanation: await this.explainIfNeeded(ent1, ent2, true),
            });
            linksCallback(links);
          }
        } catch (e) {
          console.error(e);
        }

        // Sanity check: flag if we have both a causal and opposite causal link.
        if (isLink && isOppositeLink) {
          console.error(`Reasoning error: we have both a link and an inverse link. A logical contradiction!`);
        }
      }
    }
    return links;
  }

  async explainIfNeeded(ent1, ent2, isOpposite) {
    if (!this.includeExplanation) {
      return null;
    }
    return await explainCausalLink(this.grounding, ent1, ent2, isOpposite);
  }
}

