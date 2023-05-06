import type {
    CoordsObj,
    Difficulty,
    ForWhom,
    Side,
    ThrowClick,
    ThrowMovement,
    Tickrate,
} from "@/data/types/GrenadeProperties";

/* ЧТО ЗНАЧАТ ПОДПИСИ ОКОЛО ПОЛЕЙ: 
    - RTS = Required To Sumbit
    - ORTS = optional, but Required To Sumbit
    - O = optional
    - ORTSs = optional, but Required To Sumbit, specific(для разных типов)
Контекст: 
- Есть поля, без которых объект просто не может быть создан(RTS): позиция, id (,тип?).
- Есть обязательные для отправки формы поля - oRTS. o-Optional, потому что пользователь может 
выйти из окна заполнения формы(чтобы например потыкать и позаполнять данные других гранат). Но 
отправить форму без их заполнения нельзя
- И есть необязательные даже для отправки формы поля(пока что только одно).
*/

export type Placeholder = {
    id: string; //                              RTS
    coords: CoordsObj; //                       RTS
    type: string; //                            RTS
    /* type-уникальное поле. Выбирается при инициализации объекта.
    Возможно уберу инициализацию и сделаю выбор типа создаваемой гранаты прямо в форме  */
    name?: string; //                           ORTS
    throwSpotsIds?: [string, ...string[]]; //   ORTS
    side?: Side; //                             ORTS
    tickrate?: Tickrate; //                     ORTS
    comboIds?: string[]; //                     O
    throwClick?: ThrowClick; //                 ORTS
    throwMovement?: ThrowMovement; //           ORTS
    difficulty?: Difficulty; //                 ORTS
    /* Далее свойства от всех типов гранат, т.к. я еще не решил, буду ли
    делать раздельные Placeholder(временные) типы для каждого типа гранат.
    Проверка на "какой текущий тип гранаты" осуществляется в момент сабмита 
    на основе поля <<type>> */
    //Смоки:
    isOnewaySmoke?: boolean; //                 ORTSs
    isFakeSmoke?: boolean; //                   ORTSs
    isBugSmoke?: boolean; //                    ORTSs
    //Флешки:
    forWhom?: ForWhom; //                       ORTSs
    //Молики:
    isOnewayMolotov?: boolean; //               ORTSs
    isFakeMolotov?: boolean; //                 ORTSs
    isBugMolotov?: boolean; //                  ORTSs
    //Хаешки:
    isBugHe?: boolean; //                       ORTSs
};

/* Позже --(позже, потому что сейчас у меня только фронтенд и я не боюсь за валидацию, т.к. 
создаю все данные сам)-- нужно будет подумать над разделением на SmokePlaceholder, FlashPlaceholder... 

Также можно будет подумать над применением Utility типов вместе с Intersection(&)(пример
есть в обсидиане GPT.Typescript... про Omit и Required) */
