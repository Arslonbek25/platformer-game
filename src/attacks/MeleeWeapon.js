import Phaser from "phaser";
import EffectManager from "../effects/EffectManager";
import collidable from "../mixins/collidable";

class MeleeWeapon extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, weaponName) {
		super(scene, x, y, weaponName);

		Object.assign(this, collidable);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.damage = 25;
		this.attackSpeed = 500;
		this.impactForce = 300;
		this.weaponName = weaponName;
		this.weaponAnim = weaponName + "-swing";
		this.setDepth(10);
		this.setOrigin(0.5, 1);
		this.activateWeapon(false);
		this.effectManager = new EffectManager(this.scene);
		this.on("animationcomplete", animation => {
			if (animation.key === this.weaponAnim) {
				this.activateWeapon(false);
				this.body.checkCollision.none = false;
				this.body.reset(0, 0);
			}
		});
	}

	preUpdate(time, delta) {
		super.preUpdate(time, delta);

		if (!this.active) return;

		if (this.wielder.lastDirection === Phaser.Physics.Arcade.FACING_RIGHT) {
			this.setFlipX(false);
			this.body.reset(this.wielder.x + 18, this.wielder.y);
		} else {
			this.setFlipX(true);
			this.body.reset(this.wielder.x - 18, this.wielder.y);
		}
	}

	swing(wielder) {
		this.wielder = wielder;
		this.activateWeapon(true);
		this.anims.play(this.weaponAnim, true);
	}

	deliverHit(target) {
		switch (this.wielder.lastDirection) {
			case Phaser.Physics.Arcade.FACING_RIGHT:
				target.setVelocityX(this.impactForce);
				break;
			case Phaser.Physics.Arcade.FACING_LEFT:
				target.setVelocityX(-this.impactForce);
				break;
		}

		const impactPosition = { x: this.x, y: this.getRightCenter().y };
		this.effectManager.playEffectOn("hit-effect", target, impactPosition);
		this.body.checkCollision.none = true;
	}

	activateWeapon(active) {
		this.setActive(active);
		this.setVisible(active);
	}
}

export default MeleeWeapon;
