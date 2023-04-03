class DynamicAttribute {

    passiveTypes = ["feature"];
    activeTypes = ["consumable"];

    value;
    dataGroup;
    data;
    showPassiveToggle = false;
    isPassive;

    constructor(item) {
        this.item = item;
        if (["feature"].includes(this.item.type)) {
            this.isPassive = true;
        }
        else if (["consumable"].includes(this.item.type)) {
            this.isPassive = false;
        }
        else {
            return this.showPassiveToggle
        }
    }

    get isPassive() {
        if (this.passiveTypes.includes(this.item.type)) return true;
        else if (this.activeTypes.includes(this.item.type)) return false;
        else return this.isPassive;
    }

    // Define behavior that is common to all dynamic attributes
}

