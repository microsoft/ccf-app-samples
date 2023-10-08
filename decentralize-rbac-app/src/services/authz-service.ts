import { ServiceResult } from "../utils/service-result";
import { keyValueUserRoleRepository, keyValueRoleActionRepository, IRepository } from "../repositories/kv-repository";
import { StatusCode } from "../utils/api-result";

export interface IAuthZService {
  /**
   * Map and Store UserRecord in KV-Store
   * @param {string} userId - UserID 
   */
  authorize(userId: string, action: string): ServiceResult<any>;
}

export class AuthZService implements IAuthZService {
  constructor(private readonly userRoleKeyValueRepo: IRepository<any>, private readonly roleActionKeyVauleRepo: IRepository<any>) {}

  public authorize(userId: string, action: string): ServiceResult<any> {
    console.log(`Check if ${userId} is allowed action ${action}`)

    const userData = this.userRoleKeyValueRepo.get(userId);
    
    if (!userData.success){
      console.log(`User lookup failed. Ex:${userData.error.details}`)
      return ServiceResult.Failed({
        errorMessage: "Error: user not found",
        errorType: "InvalidInputData",
      });
    }

    const role = userData.content.toLowerCase();

    console.log(`Role of ${userId} is ${role}`)

    // Check if the role exist and retrieve the allowed action
    const allowedAction = this.roleActionKeyVauleRepo.get(role);

    if (!allowedAction.success){
      return ServiceResult.Failed({
        errorMessage: "Error: role does not exist",
        errorType: "InvalidInputData",
      });
    }

    console.log(`Allowed action for role ${role} is ${allowedAction}`)

    if (allowedAction.content.toLowerCase() != action.toLowerCase()){
      return ServiceResult.Failed({
        errorMessage: "Error: action not allowed",
        errorType: "AuthorizationFailed",
      }, 403);
    }

    return ServiceResult.Succeeded(true);
  }
}

const authzService: IAuthZService = new AuthZService(keyValueUserRoleRepository, keyValueRoleActionRepository);
export default authzService;
