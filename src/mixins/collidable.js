export default {
	addCollider(otherGameObject, callback) {
		this.scene.physics.add.collider(this, otherGameObject, callback, null, this);
		return this;
	},

	bodyPositionDifference: 0,
	prevRay: null,
	prevHasHit: null,

	raycast(body, platformCollidersLayer, { rayLength = 30, precision = 1, steepness = 1 }) {
		const { x, y, width, halfHeight } = body;
		this.bodyPositionDifference += body.x - body.prev.x;

		if (Math.abs(this.bodyPositionDifference) <= precision && this.prevHasHit) {
			return {
				ray: this.prevRay,
				hasHit: this.prevHasHit,
			};
		}

		let line = new Phaser.Geom.Line();
		let hasHit = false;

		switch (body.facing) {
			case Phaser.Physics.Arcade.FACING_RIGHT:
				line.x1 = x + width;
				line.y1 = y + halfHeight;
				line.x2 = line.x1 + rayLength * steepness;
				line.y2 = line.y1 + rayLength;
				break;

			case Phaser.Physics.Arcade.FACING_LEFT:
				line.x1 = x;
				line.y1 = y + halfHeight;
				line.x2 = line.x1 - rayLength * steepness;
				line.y2 = line.y1 + rayLength;
				break;
		}

		const hits = platformCollidersLayer.getTilesWithinShape(line);

		if (hits.length > 0) {
			// some returns true if at least one element of the array satisfies the condition
			hasHit = this.prevHasHit = hits.some(hit => hit.index !== -1);
		}

		this.prevRay = line;
		this.bodyPositionDifference = 0;

		return { ray: line, hasHit };
	},
};
