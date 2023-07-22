export class Pl1eFormValidation {

    /**
     * Prevent positive input from getting negative
     */
    static positiveDecimal() {
        const inputs = document.getElementsByClassName("input-positive-decimal");
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener("input", function() {
                const regex = /^(?!-)[^.]*(?:\.[^.]*)?$/;
                if (regex.test(this.value)) return
                this.value = "";
            });
        }
    }

}
