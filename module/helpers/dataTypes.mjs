/**
 * Ref item object with data
 * @typedef {Object} RefItem
 * @property {string} itemId
 * @property {string} behavior
 * @property {string} synchronized
 * @property {string|undefined} instanceId
 * @property {Pl1eItem|undefined} item
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
 * @property {Scene} scene The scene where the token is
 * @property {string} sceneId The id of the scene where the token is
 * @property {Pl1eItem} item The ability itself
 * @property {string} itemId The ability id
 * @property {RollData} rollData The roll data of the character
 * @property {number} result The result of the rollData
 * @property {object} attributes The attributes of the item
 * @property {object} activeAspects The active aspects of the item
 * @property {Pl1eItem} linkedItem The linked item in case of abilityLink
 * @property {ActionTemplate[]} templates The templates of the action
 * @property {string[]} templatesIds The templates ids
 * @property {object} templatePosition The template position
 */

/**
 * Manage target data
 * @typedef {Object} TargetData
 * @property {Actor} actor The actor of the target
 * @property {string} actorId The actor id of the target
 * @property {Scene} scene The scene where the token is
 * @property {string} sceneId The id of the scene where the token is
 * @property {Token} token The token of the target
 * @property {string} tokenId The token id of the target
 * @property {object} template The template where this target is in
 * @typedef {RollData} rollData The roll data of the target
 * @property {number} result The result of the rollData
 * @property {Pl1eAspect[]} activeAspects The calculated active aspects of the target
 */