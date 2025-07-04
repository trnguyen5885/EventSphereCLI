export interface EventModel {
    _id: string,
    name: string,
    avatar: string,
    banner: string,
    categories: string,
    description: string,
    embedding: Array<any>,
    images: Array<string>,
    location: string,
    latitude: number,
    longitude: number,
    location_map: MapEvent
    tags: Array<any>
    ticketPrice: number,
    ticketQuantity: number,
    timeEnd: number,
    timeStart: number,
    soldTicket: number,
    eventId: string,
    typeBase: TypeBase,
    showtimes: any[],
    minTicketPrice: number,
    maxTicketPrice: number,
    isActive: boolean,
}

interface MapEvent {
    type: string,
    coordinates: Array<number>
}

export type TypeBase = 'seat' | 'zone' | 'none'


