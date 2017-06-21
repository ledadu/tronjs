
var _ = require('underscore');

var _Math = {


   /**
    * Get weighted sample 
    * Eg : collection = [ {weight:2, content:'score'}, {weight:1, content:'playerClass'} ];
    * @return the content attribute
    */
    weightedSample: function(collection) {
        var collectionCumul = [],
            totalWeight     = _.reduce(
                collection,
                function(memo, obj, i) {
                    obj.weight = obj.weight + memo;
                    collectionCumul[i] = obj;
                    return obj.weight;
                },0
            ),
            randomValue = Math.random()*totalWeight,
            index       = _.sortedIndex(collectionCumul, {weight:randomValue} ,'weight');

        return collection[index].content;
    }

}



module.exports = _Math;
