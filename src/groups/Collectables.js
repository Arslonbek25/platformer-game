import Phaser from "phaser";
import Collectable from "../collectables/Collectable";

class Collectables extends Phaser.Physics.Arcade.StaticGroup {
	constructor(scene) {
		super(scene.physics.world, scene);

		this.createFromConfig({ classType: Collectable });
	}

	mapProperties(propertiesList) {
		if (!propertiesList || propertiesList.length === 0) return {};

		return propertiesList.reduce((map, obj) => {
			map[obj.name] = obj.value;
			return map;
		}, {});
	}

	addFromLayer(layer) {
		const { score: defaultScore, type } = this.mapProperties(layer.properties);

		layer.objects.forEach(collectableO => {
			const collectable = this.get(collectableO.x, collectableO.y, type);
			const props = this.mapProperties(collectableO.properties);

			collectable.score = props.score || defaultScore;
		});

		this.getChildren().forEach(diamond => {
			function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
				return ((maxAllowed - minAllowed) * (unscaledNum - min)) / (max - min) + minAllowed;
			}

			let size = scaleBetween(diamond.score, 1, 1.1, 1, 10);

			diamond.setScale(size);
		});
	}
}

export default Collectables;
