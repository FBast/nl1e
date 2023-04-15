import {getAttributes} from "./configAttributes.mjs";
import {getGeneral} from "./configGeneral.mjs";
import {getStats} from "./configStats.mjs";
import {getTemplates} from "./configTemplates.mjs";

export const PL1E = {};

getGeneral();
getStats();
getAttributes();
getTemplates();