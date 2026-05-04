async function loadOBJ(url) {
    const response = await fetch(url);
    const text = await response.text();

    const positions = [];
    const texcoords = [];
    const normals = [];

    const finalPositions = [];
    const finalTexcoords = [];
    const finalNormals = [];

    const lines = text.split("\n");

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith("v ")) {
            const parts = line.split(/\s+/);
            positions.push([
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            ]);
        }

        else if (line.startsWith("vt ")) {
            const parts = line.split(/\s+/);
            texcoords.push([
                parseFloat(parts[1]),
                parseFloat(parts[2])
            ]);
        }

        else if (line.startsWith("vn ")) {
            const parts = line.split(/\s+/);
            normals.push([
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            ]);
        }

        else if (line.startsWith("f ")) {
    const parts = line.split(/\s+/).slice(1);

    // fan triangulation:
    // quad 0,1,2,3 becomes triangles 0,1,2 and 0,2,3
    for (let i = 1; i < parts.length - 1; i++) {
        const triangle = [parts[0], parts[i], parts[i + 1]];

        for (let part of triangle) {
            const indices = part.split("/");

            const positionIndex = parseInt(indices[0]) - 1;
            const texcoordIndex = indices[1] ? parseInt(indices[1]) - 1 : 0;
            const normalIndex = indices[2] ? parseInt(indices[2]) - 1 : 0;

            const position = positions[positionIndex];
            const texcoord = texcoords[texcoordIndex] || [0, 0];
            const normal = normals[normalIndex] || [0, 1, 0];

            finalPositions.push(position[0], position[1], position[2]);
            finalTexcoords.push(texcoord[0], texcoord[1]);
            finalNormals.push(normal[0], normal[1], normal[2]);
        }
    }
}
    }

const finalIndices = [];

for (let i = 0; i < finalPositions.length / 3; i++) {
    finalIndices.push(i);
}

return {
    vertices: finalPositions,
    textureCoordinates: finalTexcoords,
    normals: finalNormals,
    indices: finalIndices
};
}