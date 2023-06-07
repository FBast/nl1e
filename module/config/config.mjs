import {getConfigItems} from "./configItems.mjs";
import {getConfigGeneral} from "./configGeneral.mjs";
import {getConfigActor} from "./configStats.mjs";
import {getConfigTemplates} from "./configTemplates.mjs";
import {getConfigJournals} from "./configJournals.mjs";

export const PL1E = {};

getConfigGeneral();
getConfigActor();
getConfigItems();
getConfigTemplates();
getConfigJournals();