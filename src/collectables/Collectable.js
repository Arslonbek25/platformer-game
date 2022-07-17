import Phaser from "phaser";

class Collectable extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y);

		scene.add.existing(this);

		this.score = 1;
		// this.setOrigin(0, 1);

		this.scene.tweens.add({
			targets: this,
			y: this.y - 3,
			duration: Phaser.Math.Between(1500, 2500),
			repeat: -1,
			ease: "linear",
			yoyo: true,
		});
	}
}

export default Collectable;
