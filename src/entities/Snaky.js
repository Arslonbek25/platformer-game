import Enemy from "./Enemy";
import initAnims from "./anims/snakyAnims";
import Projectiles from "../attacks/Projectiles";
import Phaser from "phaser";

class Snaky extends Enemy {
	constructor(scene, x, y) {
		super(scene, x, y);
		initAnims(scene.anims);
	}

	init() {
		super.init();
		this.speed = 50;
		this.projectiles = new Projectiles(this.scene, "fireball-1");
		this.timeFromLastAttack = 0;
		this.attackDelay = this.getAttackDelay();

		this.setSize(12, 45);
		this.setOffset(10, 15);
	}

	update(time, delta) {
		super.update(time, delta);

		if (!this.active) {
			return;
		}

		if (this.timeFromLastAttack + this.attackDelay <= time) {
			this.lastDirection = this.body.facing;
			this.projectiles.fireProjectile(this, "fireball");
			this.timeFromLastAttack = time;
			this.attackDelay = this.getAttackDelay();
		}

		if (this.isPlayingAnims("snaky-hurt")) {
			return;
		}

		this.play("snaky-walk", true);
	}

	takeHit(source) {
		super.takeHit(source);
		this.play("snaky-hurt", true);
	}

	getAttackDelay() {
		return Phaser.Math.Between(1000, 4000);
	}
}

export default Snaky;
