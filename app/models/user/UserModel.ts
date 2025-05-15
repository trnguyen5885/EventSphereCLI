export interface UserModel {
    _id: string,
    name: string,
    username: string, 
    phoneNumber: string,
    longitude: number, 
    latitude: number,
    notification: Array<any>,
    picUrl: string,
    role: number,
    tags: Array<any>,
    ticketsHave: Array<any>

}