class CharacterPlayer {
    constructor(normalTexture) {
        this.position = [0.0, 0.25, 6.0];
        this.rotation = [0.0, 0.0, 0.0];
        this.size = [1.2, 2.5, 1.2];

        this.skin = this.makeColorTexture([245, 205, 160, 255]);
        this.hair = this.makeColorTexture([230, 120, 35, 255]);
        this.shirt = this.makeColorTexture([95, 175, 120, 255]);
        this.pants = this.makeColorTexture([95, 65, 45, 255]);
        this.shoes = this.makeColorTexture([60, 60, 60, 255]);

        this.normalTexture = normalTexture;

        this.head = this.makePart(this.skin);
        this.hairTop = this.makePart(this.hair);
        this.body = this.makePart(this.shirt);

        this.leftArm = this.makePart(this.skin);
        this.rightArm = this.makePart(this.skin);

        this.leftLeg = this.makePart(this.pants);
        this.rightLeg = this.makePart(this.pants);

        this.leftShoe = this.makePart(this.shoes);
        this.rightShoe = this.makePart(this.shoes);

        this.parts = [
            this.head, this.hairTop, this.body,
            this.leftArm, this.rightArm,
            this.leftLeg, this.rightLeg,
            this.leftShoe, this.rightShoe
        ];
    }

    makeColorTexture(color) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array(color)
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture;
    }

    makePart(texture) {
        let part = new ReflectiveShape(
            cubeVertices,
            cubeIndices,
            cubeTextureCoordinates,
            cubeNormals,
            texture,
            this.normalTexture
        );

        part.blendFactor = 0.0;
        part.bumpStrength = 0.0;

        return part;
    }

    setPart(part, offset, size) {
        let angle = this.rotation[1];
        let cosA = Math.cos(angle);
        let sinA = Math.sin(angle);

        let rotatedX = offset[0] * cosA - offset[2] * sinA;
        let rotatedZ = offset[0] * sinA + offset[2] * cosA;

        part.position = [
            this.position[0] + rotatedX,
            this.position[1] + offset[1],
            this.position[2] + rotatedZ
        ];

        part.rotation = [0.0, this.rotation[1], 0.0];
        part.size = size;
    }

updateParts() {
    // Shoes: bottom of character, center at y = -0.58
    this.setPart(this.leftShoe,  [-0.2, -0.58, 0.0], [0.8, 0.5, 0.8]);
    this.setPart(this.rightShoe, [ 0.2, -0.58, 0.0], [0.8, 0.5, 0.8]);

    // Legs: top of shoes = -0.58 + 0.08 = -0.50, legs center = -0.50 + 0.375 = -0.125
    this.setPart(this.leftLeg,  [-0.2, -0.25, 0.0], [0.8, 1.7, 0.8]);
    this.setPart(this.rightLeg, [ 0.2, -0.25, 0.0], [0.8, 1.7, 0.8]);

    // Body: top of legs = -0.125 + 0.375 = 0.25, body center = 0.25 + 0.45 = 0.70
    this.setPart(this.body, [0.0, 0.40, 0.0], [1.9, 1.9, 0.8]);

    // Arms: same center-y as body
    this.setPart(this.leftArm,  [-0.52, 0.40, 0.0], [0.8, 1.7, 0.22]);
    this.setPart(this.rightArm, [ 0.52, 0.40, 0.0], [0.8, 1.7, 0.22]);

    // Head: top of body = 0.70 + 0.45 = 1.15, head center = 1.15 + 0.275 = 1.425
    this.setPart(this.head, [0.0, 1, 0.0], [1.9, 1.9 , 0.6]);

    // Hair: top of head = 1.425 + 0.275 = 1.70, hair center = 1.70 + 0.05 = 1.75
    //this.setPart(this.hairTop, [0.0, 1.75, 0.0], [0.60, 0.10, 0.60]);
}

    render() {
        this.updateParts();

        this.leftShoe.render();
        this.rightShoe.render();
        this.leftLeg.render();
        this.rightLeg.render();
        this.body.render();
        this.leftArm.render();
        this.rightArm.render();
        this.head.render();
        this.hairTop.render();
    }
}