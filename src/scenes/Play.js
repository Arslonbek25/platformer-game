import Phaser from "phaser";
import Player from "../entities/Player";
import Enemies from "../groups/Enemies";
import initAnims from "../anims";

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
		const enemies = this.createEnemies(layers.enemySpawns, layers.platformsColliders);

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
		initAnims(this.anims);

		this.plotting = false;
		this.graphics = this.add.graphics();
		this.line = new Phaser.Geom.Line();
		this.graphics.lineStyle(1, 0x00ff00);
	}

	finishDrawing(pointer, layer) {
		this.line.x2 = pointer.worldX;
		this.line.y2 = pointer.worldY;

		this.graphics.clear();
		this.graphics.strokeLineShape(this.line);
		this.plotting = false;

		this.tileHits = layer.getTilesWithinShape(this.line);

		if (this.tileHits.length > 0)
			this.tileHits.forEach(tileHit => {
				tileHit.index !== -1 && tileHit.setCollision(true);
			});

		this.drawDebug(layer);
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

	createEnemies(spawnLayer, platformColliders) {
		const enemies = new Enemies(this);
		const enemyTypes = enemies.getTypes();

		spawnLayer.objects.forEach(spawnPoint => {
			const enemy = new enemyTypes[spawnPoint.name](this, spawnPoint.x, spawnPoint.y);
			enemy.setPlatformColliders(platformColliders);
			enemies.add(enemy);
		});

		return enemies;
	}

	createPlayerColliders(player, { colliders }) {
		player.addCollider(colliders.platformsColliders);
	}

	createEnemyColliders(enemies, { colliders }) {
		enemies
			.addCollider(colliders.platformsColliders)
			.addCollider(colliders.player, this.onPlayerCollision)
			.addCollider(colliders.player.projectiles, this.onWeaponHit);
	}

	onWeaponHit(entity, source) {
		entity.takeHit(source);
	}

	onPlayerCollision(enemy, player) {
		player.takeHit(enemy);
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
