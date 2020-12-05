import mongoose from "mongoose"

function printTree (schema) {
    schema.statics.printTree = function () {
        return this.schema.tree
    }
}

mongoose.plugin(printTree)

export { mongoose }