import Phaser from "phaser";
import HealthBar from "../hud/healthBar";
import initAnims from "./anims/playerAnims";
import collidable from "../mixins/collidable";
import Projectiles from "../attacks/Projectiles";

class Player extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, "player");

		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Mixins
		Object.assign(this, collidable);

		this.init();
		this.initEvents();
	}

	init() {
		this.gravity = 500;
		this.playerSpeed = 180;
		this.jumpCount = 0;
		this.consecutiveJumps = 1;
		this.hasBeenHit = false;
		this.bounceVelocity = 250;
		this.cursors = this.scene.input.keyboard.createCursorKeys();
		this.health = 100;
		this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
		this.projectiles = new Projectiles(this.scene);

		const { width, height } = this.scene.config;

		this.hp = new HealthBar(
			this.scene,
			(width - width / 1.5) / 2 + 5,
			(height - height / 1.5) / 2 + 5,
			2,
			this.health
		);

		this.body.setSize(20, 36);
		this.body.setGravityY(this.gravity);
		this.setCollideWorldBounds(true);
		this.setOrigin(0.5, 1);

		initAnims(this.scene.anims);

		this.scene.input.keyboard.on("keydown-Q", () => {
			this.projectiles.fireProjectile(this);
			this.play("throw", true);
		});
	}

	initEvents() {
		this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
	}

	update() {
		if (this.hasBeenHit) return;
		const { left, right, space } = this.cursors;
		const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
		const onFloor = this.body.onFloor();

		if (left.isDown) {
			this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
			this.setVelocityX(-this.playerSpeed);
			this.setFlip(true);
		} else if (right.isDown) {
			this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
			this.setVelocityX(this.playerSpeed);
			this.setFlip(false);
		} else {
			this.setVelocityX(0);
		}

		if (isSpaceJustDown && (onFloor || this.jumpCount < this.consecutiveJumps)) {
			this.setVelocityY(-this.playerSpeed * 2);
			this.jumpCount++;
		}

		if (onFloor) {
			this.jumpCount = 0;
		}

		if (this.anims.isPlaying && this.anims.getCurrentKey() === "throw") {
			return;
		}

		onFloor
			? this.body.velocity.x === 0
				? this.play("idle", true)
				: this.play("run", true)
			: this.play("jump");
	}

	playDamageTween() {
		return this.scene.tweens.add({
			targets: this,
			duration: 100,
			repeat: -1,
			tint: 0xffffff,
		});
	}

	bounceOff() {
		this.body.touching.right
			? this.setVelocityX(-this.bounceVelocity)
			: this.setVelocityX(this.bounceVelocity);
		setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
	}

	takeHit(initiator) {
		if (this.hasBeenHit) return;
		this.hasBeenHit = true;
		this.bounceOff();
		const hitAnim = this.playDamageTween();
		this.health -= initiator.damage;
		this.hp.decrease(this.health);

		this.scene.time.delayedCall(1000, () => {
			this.hasBeenHit = false;
			hitAnim.stop();
			this.clearTint();
		});
	}
}

export default Player;
