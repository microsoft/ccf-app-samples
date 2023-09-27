import { ServiceResult } from "../utils/service-result";
import keyValueRepository, { IRepository } from "../repositories/kv-repository";

export interface IAuthZService {
  /**
   * Map and Store UserRecord in KV-Store
   * @param {string} userId - UserID being added
   */
  authorize(userId: string): ServiceResult<any>;
}

export class AuthZService implements IAuthZService {
  constructor(private readonly keyValueRepo: IRepository<any>) {}

  public authorize(userId: string): ServiceResult<any> {
    if (!userId) {
      return ServiceResult.Failed({
        errorMessage: "Error: user_id cannot be null",
        errorType: "InvalidInputData",
      });
    }

    const userData = this.keyValueRepo.get(userId);
    
    if (!userData.success){
      return ServiceResult.Failed({
        errorMessage: "Error: user not found",
        errorType: "InvalidInputData",
      });
    }

    return userData;
  }
}

const authzService: IAuthZService = new AuthZService(keyValueRepository);
export default authzService;
