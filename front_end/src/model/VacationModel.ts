export class VacationModel {
    id?: number;
    destination: string;
    description: string;
    startDate: string; 
    endDate: string;
    price: number;
    imageFileName?: string;
    image_path?: string;
    followerCount?: number; 
    isFollowing?: boolean; 


    constructor(obj: Partial<VacationModel>) {
        this.id = obj.id;
        this.destination = obj.destination ?? '';
        this.description = obj.description ?? '';
        this.startDate = obj.startDate ?? '';
        this.endDate = obj.endDate ?? '';
        this.price = obj.price ?? 0;
        this.imageFileName = obj.imageFileName;
        this.image_path = obj.image_path;
        this.followerCount = obj.followerCount ?? 0; 
        this.isFollowing = obj.isFollowing ?? false; 
    }
}
