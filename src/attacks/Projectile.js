import Phaser from "phaser";
import EffectManager from "../effects/EffectManager";

class Projectile extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, key) {
		super(scene, x, y, key);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.speed = 300;
		this.maxDistance = 500;
		this.travelDistance = 0;
		this.damage = 10;
		this.cooldown = 500;

		this.setSize(this.width-13, this.height-19);

		this.effectManager = new EffectManager(this.scene);
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);
		this.travelDistance += this.body.deltaAbsX();
		let isOutOfRange = this.travelDistance && this.travelDistance >= this.maxDistance;
		if (isOutOfRange) {
			this.body.reset(0, 0);
			this.activateProjectile(false);
			this.travelDistance = 0;
		}
	}

	deliverHit(target) {
		this.activateProjectile(false);
		this.travelDistance = 0;
		const impactPosition = { x: this.x, y: this.y };
		this.body.reset(0, 0);
		this.effectManager.playEffectOn("hit-effect", target, impactPosition);
	}

	activateProjectile(active) {
		this.setActive(active);
		this.setVisible(active);
	}

	fire(x, y) {
		this.activateProjectile(true);
		this.body.reset(x, y);
		this.setVelocityX(this.speed);
	}
}

export default Projectile;
