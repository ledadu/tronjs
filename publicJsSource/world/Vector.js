function Vector(x, y) {
    this.x = x;
    this.y = y;
    this.add = function(vect) {
        return new Vector(this.x + vect.x, this.y + vect.y);
    };
    this.sub = function(vect) {
        return new Vector(this.x - vect.x, this.y - vect.y);
    };
    this.scalar = function(s) {
        return new Vector(this.x * s, this.y * s);
    }
    this.inv = function() {
        return new Vector(-this.x, -this.y);
    };

    this.angle = function() {
        return Math.atan2(this.y, this.x) * 180 / Math.PI;  //calcul angle
    };
}

function VectorMoy(vectors) {
    vect = new Vector(0, 0);
    for (i in vectors) {
        vect.add(vectors[i]);
    }
    vect.scalar(1 / vector.legth);
    return vect;
}

