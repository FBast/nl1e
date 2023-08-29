import {getConfigItems} from "./configItems.mjs";
import {getConfigBase} from "./configBase.mjs";
import {getConfigActor} from "./configActors.mjs";
import {getConfigTemplates} from "./configTemplates.mjs";
import {getConfigJournals} from "./configJournals.mjs";
import {getConfigAspects} from "./configAspects.mjs";

export const PL1E = {};

getConfigBase();
getConfigActor();
getConfigItems();
getConfigAspects();
getConfigTemplates();
getConfigJournals();