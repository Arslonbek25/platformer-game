import Phaser from "phaser";
import collidable from "../mixins/collidable";

class Enemy extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, key) {
		super(scene, x, y, key);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Mixins
		Object.assign(this, collidable);

		this.init();
		this.initEvents();
	}

	init() {
		this.gravity = 500;
		this.speed = 75;
		this.timeSinceLastTurn = 0;
		this.maxPatrolDistance = 200;
		this.currentPatrolDistance = 0;
		this.rayGraphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0xaa00aa } });

		this.body.setGravityY(this.gravity);
		this.setCollideWorldBounds(true);
		this.setOrigin(0.5, 1);
		this.setImmovable(true);
		this.setSize(20, 42);
		this.setOffset(8, 22);
		this.setVelocityX(this.speed);
	}

	initEvents() {
		this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
	}

	update(time) {
		this.patrol(time);
	}

	patrol(time) {
		if (!this.body || this.body.onFloor()) return;

		this.currentPatrolDistance += Math.abs(this.body.deltaX());
		const { ray, hasHit } = this.raycast(this.body, this.platformCollidersLayer, 30, 20);

		if (
			(!hasHit || this.currentPatrolDistance >= this.maxPatrolDistance) &&
			this.timeSinceLastTurn + 100 < time
		) {
			this.setFlipX(!this.flipX);
			this.setVelocityX((this.speed = -this.speed));
			this.timeSinceLastTurn = time;
			this.currentPatrolDistance = 0;
		}

		this.rayGraphics.clear();
		this.rayGraphics.strokeLineShape(ray);
	}

	setPlatformColliders(platformCollidersLayer) {
		this.platformCollidersLayer = platformCollidersLayer;
	}
}

export default Enemy;