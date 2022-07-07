import Phaser from "phaser";

import collidable from "../mixins/collidable";

class Birdman extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, "birdman");

		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Mixins
		Object.assign(this, collidable);

		this.init();
	}

	init() {
		this.gravity = 500;
		this.speed = 150;

		this.body.setGravityY(this.gravity);
		this.setCollideWorldBounds(true);
		this.setOrigin(0.5, 1);
		this.setImmovable(true);
		this.setSize(20, 42);
		this.setOffset(8, 22);
		this.scene.anims.create({
			key: "wait",
			frames: this.scene.anims.generateFrameNumbers("birdman", { start: 0, end: 12 }),
			frameRate: 8,
			repeat: -1,
		});
		this.play("wait", true);
	}
}

export default Birdman;
