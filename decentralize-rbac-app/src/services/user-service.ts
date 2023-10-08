import { ServiceResult } from "../utils/service-result";
import { keyValueUserRoleRepository, keyValueRoleActionRepository, IRepository } from "../repositories/kv-repository";

export interface IUserService {
  /**
   * Map and Store Role and actions in KV-Store
   * @param {string} userId - userId being added
   * @param {string} role - role being added
   */
  add_user(userId: string, role: string): ServiceResult<any>;
}

export class UserService implements IUserService {
  constructor(private readonly keyValueRepo: IRepository<any>, private readonly roleActionKVRepo: IRepository<any>) {}

  public add_user(userId: string, role:string): ServiceResult<any> {
    const saveUserRecord = this.keyValueRepo.set(userId, role);

    if (!saveUserRecord.success){
      return ServiceResult.Failed({
        errorMessage: "Error: user add failed",
        errorType: "InvalidInputData",
      });
    }

    console.log(`Added user ${userId} with role ${role}`)

    return saveUserRecord;
  }
}

const userService: IUserService = new UserService(keyValueUserRoleRepository, keyValueRoleActionRepository);
export default userService;
