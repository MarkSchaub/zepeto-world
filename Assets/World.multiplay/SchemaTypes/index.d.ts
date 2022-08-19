declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<sPlayer>;
	}
	class sPlayer extends Schema {
		id: number;
		state: number;
		moveState: number;
		position: sVector3;
		rotation: sVector3;
		gesture: number;
		moveTarget: sVector3;
	}
	class sPianoState extends Schema {
		isPlayPiano: boolean;
		musicId: number;
		isDouble: boolean;
		startTime: number;
	}
	class sVector3 extends Schema {
		x: number;
		y: number;
		z: number;
	}
	class sPlayerInfo extends Schema {
		id: number;
		sessionId: string;
		userId: string;
	}
}