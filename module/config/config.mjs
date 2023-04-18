import {getConfigItems} from "./configItems.mjs";
import {getConfigGeneral} from "./configGeneral.mjs";
import {getConfigStats} from "./configStats.mjs";
import {getConfigTemplates} from "./configTemplates.mjs";

export const PL1E = {};

getConfigGeneral();
getConfigStats();
getConfigItems();
getConfigTemplates();