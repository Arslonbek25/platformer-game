import Phaser from "phaser";
import Player from "../entities/Player";
import Enemies from "../groups/Enemies";
import initAnims from "../anims";
import Collectables from "../groups/Collectables";
import Hud from "../hud";
import EventEmitter from "../events/Emitter";

class Play extends Phaser.Scene {
	constructor(config) {
		super("PlayScene");
		this.config = config;
	}

	create({ gameStatus }) {
		this.score = 0;
		this.hud = new Hud(this, 0, 0);
		this.collectSound = this.sound.add("coin-pickup", { volume: 0.2 });

		const map = this.createMap();
		initAnims(this.anims);
		const layers = this.createLayers(map);
		const playerZones = this.getPlayerZones(layers.playerZones);
		const player = this.createPlayer(playerZones.start);
		const enemies = this.createEnemies(layers.enemySpawns, layers.platformsColliders);
		const collectables = this.createCollectables(layers.collectables);

		this.createPlayerColliders(player, {
			colliders: {
				platformsColliders: layers.platformsColliders,
				projectiles: enemies.getProjectiles(),
				collectables,
				traps: layers.traps,
			},
		});

		this.createEnemyColliders(enemies, {
			colliders: {
				platformsColliders: layers.platformsColliders,
				player,
			},
		});

		this.createBG(map);
		this.playBgMusic();
		this.createBackButton();
		this.createEndOfLevel(playerZones.end, player);
		this.setupFollowUpCameraOn(player);

		if (gameStatus !== "PLAYER_LOSE") {
			this.createGameEvents();
		}
	}

	playBgMusic() {
		if (this.sound.get("theme")) return;
		this.sound.add("theme", { loop: true, volume: 0.1 }).play();
	}

	createBG(map) {
		const bgObject = map.getObjectLayer("distance_bg").objects[0];
		this.spikesImage = this.add
			.tileSprite(
				bgObject.x,
				bgObject.y,
				this.config.width,
				bgObject.height,
				"bg-spikes-dark"
			)
			.setOrigin(0, 1)
			.setDepth(-10)
			.setScrollFactor(0, 1);
		this.skyImage = this.add
			.tileSprite(0, 0, this.config.width, 180, "sky-play")
			.setOrigin(0, 0)
			.setScale(1.1)
			.setDepth(-11)
			.setScrollFactor(0, 1);
	}

	createBackButton() {
		const btn = this.add
			.image(this.config.rightBottomCorner.x, this.config.rightBottomCorner.y, "back")
			.setScrollFactor(0)
			.setScale(2)
			.setInteractive()
			.setOrigin(1);

		btn.on("pointerup", () => {
			this.scene.start("MenuScene");
		});
	}

	createCollectables(collectableLayer) {
		const collectables = new Collectables(this).setDepth(-1);

		collectables.addFromLayer(collectableLayer);
		collectables.playAnimation("diamond-shine");

		return collectables;
	}

	createMap() {
		const map = this.make.tilemap({ key: `level_${this.getCurrentLevel()}` });
		map.addTilesetImage("main_lev_build_1", "tiles-1");
		// map.addTilesetImage("bg_spikes_tileset", "bg-spikes-tileset");

		return map;
	}

	getCurrentLevel() {
		return this.registry.get("level") || 1;
	}

	createLayers(map) {
		const tileset = map.getTileset("main_lev_build_1");

		const platformsColliders = map
			.createStaticLayer("platforms_colliders", tileset)
			.setDepth(-20);
		const environment = map.createStaticLayer("environment", tileset).setDepth(-2);
		const traps = map.createStaticLayer("traps", tileset);
		const platforms = map.createStaticLayer("platforms", tileset);
		const playerZones = map.getObjectLayer("player_zones");
		const enemySpawns = map.getObjectLayer("enemy_spawns");
		const collectables = map.getObjectLayer("collectables");

		platformsColliders.setCollisionByProperty({ collides: true });
		traps.setCollisionByExclusion(-1);

		return {
			platforms,
			environment,
			platformsColliders,
			playerZones,
			enemySpawns,
			collectables,
			traps,
		};
	}

	createGameEvents() {
		EventEmitter.on("PLAYER_LOSE", () => {
			this.scene.restart({ gameStatus: "PLAYER_LOSE" });
		});
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
		player
			.addCollider(colliders.platformsColliders)
			.addCollider(colliders.projectiles, this.onHit)
			.addCollider(colliders.traps, this.onHit)

			.addOverlap(colliders.collectables, this.onCollect, this)
			.projectiles.addCollider(colliders.projectiles, this.projectilesCollide);
		player.meleeWeapon.addCollider(colliders.projectiles, this.meleeShield);
	}

	onCollect(entity, collectable) {
		this.score += collectable.score;
		this.hud.updateScoreboard(this.score);
		this.collectSound.play();
		collectable.disableBody(true, true);
	}

	projectilesCollide(entity, source) {
		const deActivateProjectile = GO => {
			GO.activateProjectile(false);
			GO.travelDistance = 0;
			GO.body.reset(0, 0);
		};

		deActivateProjectile(entity);
		deActivateProjectile(source);
	}

	meleeShield(target, projectile) {
		const deActivateProjectile = GO => {
			GO.activateProjectile(false);
			GO.travelDistance = 0;
			GO.body.reset(0, 0);
		};

		deActivateProjectile(projectile);
	}

	createEnemyColliders(enemies, { colliders }) {
		enemies
			.addCollider(colliders.platformsColliders)
			.addCollider(colliders.player, this.onPlayerCollision)
			.addCollider(colliders.player.projectiles, this.onHit)
			.addOverlap(colliders.player.meleeWeapon, this.onHit);
	}

	onHit(entity, source) {
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

			if (this.registry.get("level") === this.config.lastLevel) {
				this.scene.start("CreditsScene");
				return;
			}

			this.registry.inc("level", 1);
			this.registry.inc("unlocked-levels", 1);
			this.scene.restart({ gameStatus: "LEVEL_COMPLETED" });
		});
	}

	update() {
		this.spikesImage.tilePositionX = this.cameras.main.scrollX * 0.3;
		this.spikesImage.tilePositionX = this.cameras.main.scrollX * 0.1;
	}
}

export default Play;
