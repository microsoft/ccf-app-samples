import { ServiceResult } from "../utils/service-result";
import {
  keyValueRoleActionRepository,
  IRepository,
} from "../repositories/kv-repository";

export interface IRoleService {
  /**
   * Map and Store Role and actions in KV-Store
   * @param {string} role - role being added
   */
  add_role(role: string, action: string): ServiceResult<any>;
}

export class RoleService implements IRoleService {
  constructor(private readonly keyValueRepo: IRepository<any>) {}

  public add_role(role: string, action: string): ServiceResult<any> {
    const saveRoleRecord = this.keyValueRepo.set(
      role.toLowerCase(),
      action.toLowerCase(),
    );

    if (!saveRoleRecord.success) {
      return ServiceResult.Failed({
        errorMessage: "Error: role could not be added",
        errorType: "InvalidInputData",
      });
    }

    console.log(`Added role ${role} with action ${action}`);

    return saveRoleRecord;
  }
}

const roleService: IRoleService = new RoleService(keyValueRoleActionRepository);
export default roleService;
