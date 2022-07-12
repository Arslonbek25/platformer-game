import Phaser from "phaser";

class Projectile extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, key) {
		super(scene, x, y, key);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.speed = 300;
		this.maxDistance = 300;
		this.travelDistance = 0;
        this.cooldown =500
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		this.travelDistance += this.body.deltaAbsX();
		let isOutOfRange = this.travelDistance && this.travelDistance >= this.maxDistance;
		if (isOutOfRange) {
			this.body.reset(0, 0);
			this.setActive(false);
			this.setVisible(false);
			this.travelDistance = 0;
		}
	}

	fire(x, y) {
		this.setActive(true);
		this.setVisible(true);
		this.body.reset(x, y);
		this.setVelocityX(this.speed);
	}
}

export default Projectile;
