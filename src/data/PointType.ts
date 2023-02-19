export type PointType = {
	name: string;
	position: {
		x: number;
		y: number;
	};
}
enum GrenadeTypesEnum {
    Smoke = "Smoke",
    Molotov = "Molotov",
    Flash = "Flash",
    He = "He",
}
type CoordsObj = {
    x: number;
    y: number;
};
type LinksObj = {
    //Картинка откуда кидается
	//Картинка куда целиться
	//Картинка где взрывается
	//Встроенный видос на ютуб
};
enum ThrowTypesEnum {

}
export class GrenadePoint {
    type: GrenadeTypesEnum;
    positionName: string;
    coords: CoordsObj;
    links: LinksObj;
    constructor(
        type: GrenadeTypesEnum,
        positionName: string,
        coords: CoordsObj,
        links: LinksObj
    ) {
        this.type = type;
        this.positionName = positionName;
        this.coords = coords;
        this.links = links;
    }
}
