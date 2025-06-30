import Phaser from "phaser";
import PlayScene from "./scenes/Play";
import PreloadScene from "./scenes/Preload";
import Menu from "./scenes/Menu";
import LevelScene from "./scenes/Levels";
import CreditsScene from "./scenes/Credits";

const MAP_WIDTH = 1600;

const WIDTH = Math.min(window.innerWidth, 1280);
const HEIGHT = Math.min(window.innerHeight, 720); // Increased from 600 to 720
const ZOOM_FACTOR = 1.5;

const SHARED_CONFIG = {
	mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 0,
	width: WIDTH,
	height: HEIGHT,
	zoomFactor: ZOOM_FACTOR,
	debug: false,
	backgroundColor: "#1b0a1f",
	rightTopCorner: {
		x: WIDTH / ZOOM_FACTOR + (WIDTH - WIDTH / ZOOM_FACTOR) / 2,
		y: (HEIGHT - HEIGHT / ZOOM_FACTOR) / 2,
	},
	rightBottomCorner: {
		x: WIDTH / ZOOM_FACTOR + (WIDTH - WIDTH / ZOOM_FACTOR) / 2,
		y: HEIGHT / ZOOM_FACTOR + (HEIGHT - HEIGHT / ZOOM_FACTOR) / 2,
	},
	lastLevel: 2,
};

const Scenes = [PreloadScene, Menu, LevelScene, PlayScene, CreditsScene];
const createScene = Scene => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

const config = {
	type: Phaser.AUTO,
	...SHARED_CONFIG,
	pixelArt: true,
	scale: {
		mode: Phaser.Scale.ENVELOP,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: WIDTH,
		height: HEIGHT,
	},
	physics: {
		default: "arcade",
		arcade: {
			debug: SHARED_CONFIG.debug,
		},
	},
	scene: initScenes(),
};

new Phaser.Game(config);
