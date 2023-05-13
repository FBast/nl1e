/**
 * Manage ability data
 * @typedef {Object} AbilityData
 * @property {CharacterData} characterData The character data
 * @property {AbilityTemplate[]} templates  An array of the measure templates
 */

/**
 * Manage roll data
 * @typedef {Object} RollData
 * @property {string} formula
 * @property {DiceTerm[]} dice
 * @property {number} total
 */

/**
 * Manage character data
 * @typedef {Object} CharacterData
 * @property {Pl1eActor} actor The actor of the character
 * @property {string} actorId The actor id of the character
 * @property {Token} token The token of the character
 * @property {string} tokenId The token id of the character
 * @property {Pl1eItem} item The ability itself
 * @property {string} itemId The ability id
 * @property {RollData} rollData The roll data of the character
 * @property {number} result The result of the rollData
 * @property {object} attributes The attributes of the item
 * @property {object} activeAspects The active aspects of the item
 * @property {Pl1eItem} linkedItem The linked item in case of abilityLink
 */

/**
 * Manage target data
 * @typedef {Object} TargetData
 * @typedef {RollData} rollData
 * @property {number} result
 * @property {Token} token
 * @property {string} tokenId
 * @property {Pl1eAspect[]} activeAspects The calculated active aspects of the target
 */