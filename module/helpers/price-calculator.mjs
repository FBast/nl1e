export class Pl1ePriceCalculator {

    /**
     * Registry of price formulas indexed by item type and subtype.
     * Extend this object to add new pricing behavior.
     */
    static FORMULAS = {
        common: {
            food: Pl1ePriceCalculator._calcNonPerishablePrice,
            // Add more: ingredient, alchemy, material…
        },

        service: {
            food: Pl1ePriceCalculator._calcFoodPrice,
            lodging: Pl1ePriceCalculator._calcLodgingPrice,
            transport: Pl1ePriceCalculator._calcTransportPrice,
            substance: Pl1ePriceCalculator._calcSubstancePrice
        },

        // Future example
        weapon: {
            melee: Pl1ePriceCalculator._calcWeaponMeleePrice,
            ranged: Pl1ePriceCalculator._calcWeaponRangedPrice
        }
    };

    /**
     * Main public API
     * Called from the sheet when the user clicks the Auto-Calculate button.
     */
    static autoCalculatePrice(item) {
        const sys = item.system;

        const type = item.type;
        const subtypeKey = `${type}Type`;
        const subtype = sys.attributes[subtypeKey];

        const typeTable = Pl1ePriceCalculator.FORMULAS[type];
        const formulaFn = typeTable?.[subtype];

        if (formulaFn) {
            const price = formulaFn(item, sys);

            // Update item values
            item.update({
                "system.attributes.goldPrice": price.po,
                "system.attributes.silverPrice": price.pa,
                "system.attributes.copperPrice": price.pc
            });

            ui.notifications.info(
                `Price auto-calculated: ${price.po}g ${price.pa}s ${price.pc}c`
            );
        }
        else {
            ui.notifications.warn(
                `No price formula implemented for type "${type}" (subtype "${subtype}").`
            );
        }
    }

    // ---------------------------------------------------------------------------
    //  PRICE FORMULA IMPLEMENTATIONS
    // ---------------------------------------------------------------------------

    /**
     * Food pricing using a linear formula.
     * points = staminaGain + manaGain
     * base_pc = round(points * 0.5)
     */
    static _calcFoodPrice(item, sys) {
        const endurance = Number(sys.attributes.staminaGain ?? 0);
        const mana = Number(sys.attributes.manaGain ?? 0);
        const points = endurance + mana;

        // Linear price
        let costPc = Math.round(points * 2);

        return Pl1ePriceCalculator._convertPc(costPc);
    }

    /**
     * Non-perishable version of food
     * Uses linear formula + 50% markup
     * base_pc = round(points * 0.5 * 1.5)
     */
    static _calcNonPerishablePrice(item, sys) {
        const endurance = Number(sys.attributes.staminaRest ?? 0);
        const mana = Number(sys.attributes.manaRest ?? 0);
        const points = endurance + mana;

        // Linear + 50%
        let costPc = Math.round(points * 5);

        return Pl1ePriceCalculator._convertPc(costPc);
    }

    /**
     * Substance (alcohol, stimulant, psychotrope, dopant) pricing
     * Uses gain, life loss and intoxication
     *
     * gain: positive primary effect (manaGain or staminaGain)
     * lifeLoss: negative life effect (lifeLoss)
     * intoxication: intoxicationGain
     *
     * base_pc =
     *   gain * 4
     * + lifeLoss * 10
     * + intoxication * 2
     */
    static _calcSubstancePrice(item, sys) {

        const attrs = sys.attributes ?? {};

        // Determine primary gain (mana OR stamina)
        const manaGain = Math.max(0, Number(attrs.manaGain ?? 0));
        const staminaGain = Math.max(0, Number(attrs.staminaGain ?? 0));
        const gain = Math.max(manaGain, staminaGain);

        // Life loss (always positive value here)
        const lifeLoss = Math.max(0, Number(attrs.lifeLoss ?? 0));

        // Intoxication
        const intoxication = Math.max(0, Number(attrs.intoxicationGain ?? 0));

        // Linear but weighted pricing
        let costPc =
            (gain * 4) +
            (lifeLoss * 10) +
            (intoxication * 2);

        costPc = Math.round(costPc);

        return Pl1ePriceCalculator._convertPc(costPc);
    }

    /**
     * Lodging service pricing (example)
     * quality: 1 = poor, 2 = normal, 3 = luxury
     */
    static _calcLodgingPrice(item, sys) {
        const quality = sys.quality ?? 1;
        const basePc = 5 * quality * quality; // quadratic

        return Pl1ePriceCalculator._convertPc(basePc);
    }

    static _calcTransportPrice(item, sys) {
        const distance = sys.distance ?? 1;
        const basePc = distance * 3;

        return Pl1ePriceCalculator._convertPc(basePc);
    }

    // Weapon examples (to be extended later)
    static _calcWeaponMeleePrice(item, sys) {
        const dmg = sys.damage ?? 1;
        const basePc = dmg * dmg * 4; // quadratic pricing

        return Pl1ePriceCalculator._convertPc(basePc);
    }

    static _calcWeaponRangedPrice(item, sys) {
        const dmg = sys.damage ?? 1;
        const range = sys.range ?? 10;

        const basePc = Math.round((dmg * dmg * 3) + (range / 5));

        return Pl1ePriceCalculator._convertPc(basePc);
    }


    // ---------------------------------------------------------------------------
    //  UTILITIES
    // ---------------------------------------------------------------------------

    /**
     * Convert copper → silver → gold cleanly
     */
    static _convertPc(pcValue) {
        let pc = pcValue;
        let pa = Math.floor(pc / 10);
        pc = pc % 10;
        let po = Math.floor(pa / 10);
        pa = pa % 10;

        return { pc, pa, po };
    }
}