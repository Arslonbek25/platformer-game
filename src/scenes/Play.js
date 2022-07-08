import Phaser from "phaser";
import Player from "../entities/Player";
import Enemies from "../groups/Enemies";

class Play extends Phaser.Scene {
	constructor(config) {
		super("PlayScene");
		this.config = config;
	}

	create() {
		const map = this.createMap();
		const layers = this.createLayers(map);
		const playerZones = this.getPlayerZones(layers.playerZones);
		const player = this.createPlayer(playerZones.start);
		const enemies = this.createEnemies(layers.enemySpawns);

		this.createPlayerColliders(player, {
			colliders: {
				platformsColliders: layers.platformsColliders,
			},
		});

		this.createEnemyColliders(enemies, {
			colliders: {
				platformsColliders: layers.platformsColliders,
				player,
			},
		});

		this.createEndOfLevel(playerZones.end, player);
		this.setupFollowUpCameraOn(player);

		this.plotting = false;
		this.graphics = this.add.graphics();
		this.line = new Phaser.Geom.Line();
		this.graphics.lineStyle(1, 0x00ff00);

		this.input.on("pointerdown", this.startDrawing, this);
		this.input.on("pointerup", this.finishDrawing, this);
	}

	update() {
		if (this.plotting) {
			const pointer = this.input.activePointer;

			this.line.x2 = pointer.worldX;
			this.line.y2 = pointer.worldY;
			this.graphics.clear();
			this.graphics.strokeLineShape(this.line);
		}
	}

	startDrawing(pointer) {
		this.line.x1 = pointer.worldX;
		this.line.y1 = pointer.worldY;
		this.plotting = true;
	}

	finishDrawing(pointer) {
		this.line.x2 = pointer.worldX;
		this.line.y2 = pointer.worldY;

		this.graphics.clear();
		this.graphics.strokeLineShape(this.line);
		this.plotting = false;
	}

	createMap() {
		const map = this.make.tilemap({ key: "map" });
		map.addTilesetImage("main_lev_build_1", "tiles-1");
		return map;
	}

	createLayers(map) {
		const tileset = map.getTileset("main_lev_build_1");
		const platformsColliders = map.createStaticLayer("platforms_colliders", tileset);
		const environment = map.createStaticLayer("environment", tileset);
		const platforms = map.createStaticLayer("platforms", tileset);
		const playerZones = map.getObjectLayer("player_zones");
		const enemySpawns = map.getObjectLayer("enemy_spawns");

		platformsColliders.setCollisionByProperty({ collides: true });

		return { platforms, environment, platformsColliders, playerZones, enemySpawns };
	}

	createPlayer(start) {
		return new Player(this, start.x, start.y);
	}

	createEnemies(spawnLayer) {
		const enemies = new Enemies(this);
		const enemyTypes = enemies.getTypes();

		spawnLayer.objects.forEach(spawnPoint => {
			const enemy = new enemyTypes[spawnPoint.name](this, spawnPoint.x, spawnPoint.y);
			enemies.add(enemy);
		});

		return enemies;
	}

	createPlayerColliders(player, { colliders }) {
		player.addCollider(colliders.platformsColliders);
	}

	createEnemyColliders(enemies, { colliders }) {
		enemies.addCollider(colliders.platformsColliders).addCollider(colliders.player);
	}

	setupFollowUpCameraOn(player) {
		const { width, height, mapOffset, zoomFactor } = this.config;

		this.physics.world.setBounds(0, 0, width + mapOffset, height + 200);
		this.cameras.main.setBounds(0, 0, width + mapOffset, height).setZoom(zoomFactor);
		this.cameras.main.startFollow(player);
	}

	getPlayerZones(playerZonesLayer) {
		const playerZones = playerZonesLayer.objects;
		return {
			start: playerZones.find(zone => zone.name === "startZone"),
			end: playerZones.find(zone => zone.name === "endZone"),
		};
	}

	createEndOfLevel(end, player) {
		const endOfLevel = this.physics.add
			.sprite(end.x, end.y)
			.setAlpha(0)
			.setSize(5, this.config.height)
			.setOrigin(0.5, 1);

		const eolOverlap = this.physics.add.overlap(player, endOfLevel, () => {
			eolOverlap.active = false;
			console.log("player has won!");
		});
	}
}

export default Play;
