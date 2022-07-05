import Phaser from "phaser";

class Play extends Phaser.Scene {
	constructor() {
		super("PlayScene");
	}

	create() {
		const map = this.createMap();
		this.createLayers(map);
	}

	createMap() {
		const map = this.make.tilemap({ key: "map" });
		map.addTilesetImage("main_lev_build_1", "tiles-1");
		return map;
	}

	createLayers(map) {
		const tileset = map.getTileset("main_lev_build_1");
		map.createStaticLayer("platforms", tileset);
		map.createStaticLayer("environment", tileset);
	}
}

export default Play;
