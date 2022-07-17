import Phaser from "phaser";
import Projectile from "./Projectile";
import collidable from "../mixins/collidable";

class Projectiles extends Phaser.Physics.Arcade.Group {
	constructor(scene, key) {
		super(scene.physics.world, scene);

		Object.assign(this, collidable);
		
		this.createMultiple({
			frameQuantity: 5,
			active: false,
			visible: false,
			key,
			classType: Projectile,
		});
		
	}

	fireProjectile(initiator, anim) {
		const projectile = this.getFirstDead(false);

		if (!projectile) return;
		if (
			this.timeFromLastProjectile &&
			this.timeFromLastProjectile + projectile.cooldown > Date.now()
		)
			return;

		const center = initiator.getCenter();
		let centerX;

		if (initiator.lastDirection === Phaser.Physics.Arcade.FACING_RIGHT) {
			projectile.speed = Math.abs(projectile.speed);
			projectile.setFlipX(false);
			centerX = center.x + 10;
		} else if (initiator.lastDirection === Phaser.Physics.Arcade.FACING_LEFT) {
			projectile.speed = -Math.abs(projectile.speed);
			projectile.setFlipX(true);
			centerX = center.x - 10;
		}

		if (!centerX) return;
		projectile.fire(centerX, center.y, anim);
		this.timeFromLastProjectile = Date.now();
	}
}

export default Projectiles;
