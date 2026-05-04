class ModelPlayer {
    constructor(shape) {
        // This is the actual 3D model (OBJ turned into ReflectiveShape)
        this.model = shape;

        // Same properties your old PlayerCube had
        this.position = [0.0, 0.25, 6.0];
        this.rotation = [0.0, 0.0, 0.0];
        this.size = [0.5, 0.5, 0.5]; // scale down OBJ
    }

    render() {
        // Apply transform to the model
        this.model.position = this.position;

        // Fix rotation (OBJ models are usually sideways)
        this.model.rotation = [
            this.rotation[0],
            this.rotation[1],
            this.rotation[2]
        ];

        this.model.size = this.size;

        // Draw the model
        this.model.render();
    }
}