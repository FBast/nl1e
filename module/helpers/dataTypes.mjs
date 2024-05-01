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
 * @property {TokenDocument | null} token The token of the character
 * @property {string | null} tokenId The token id of the character
 * @property {Scene | null} scene The scene where the token is
 * @property {string | null} sceneId The id of the scene where the token is
 * @property {Pl1eItem} item The item itself
 * @property {string} itemId The item id
 * @property {string} userId The user id
 * @property {RollData} rollData The roll data of the character
 * @property {number} result The result of the rollData
 * @property {object} attributes The attributes of the item
 * @property {object} activeAspects The active aspects of the item
 * @property {Pl1eItem} linkedItem The linked item in case of parent item
 * @property {string} linkedItemId The linked item id
 * @property {Pl1eMeasuredTemplate[]} templates The templates of the action
 * @property {string[]} templatesIds The templates ids
 * @property {object} templatePosition The template position
 * @property {boolean} noConfirmation The action does not need button confirmation
 */

/**
 * Manage target data
 * @typedef {Object} TargetData
 * @property {Actor} actor The actor of the target
 * @property {string} actorId The actor id of the target
 * @property {Scene} scene The scene where the token is
 * @property {string} sceneId The id of the scene where the token is
 * @property {TokenDocument} token The token of the target
 * @property {string} tokenId The token id of the target
 * @property {number} tokenX The position of the token on x
 * @property {number} tokenY The position of the token on y
 * @property {Pl1eMeasuredTemplate} template The template where this target is in
 * @typedef {RollData} rollData The roll data of the target
 * @property {number} result The result of the rollData
 * @property {Pl1eAspect[]} activeAspects The calculated active aspects of the target
 */