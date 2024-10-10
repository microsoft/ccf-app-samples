import * as ccfapp from "@microsoft/ccf-app";
import { ccf } from "@microsoft/ccf-app/global";
import { assign } from "lodash-es";


interface DefineRoleRequest {
    role_actions: string[];
}

// Endpoint should be PUT? method
export function defineRole(
    request: ccfapp.Request<DefineRoleRequest>,
): ccfapp.Response {
    let body;
    try {
        body = request.body.json();
    } catch {
        return {
        statusCode: 400,
        };
    }

    const roles_param = {
        "role_name": request.params.role_name,
        "role_actions": body.role_actions,
    };

    // TODO: Call programmability endpoint here
    
    return {
        body,
    };
}


// Endpoint should be a patch method?
export function applyRole(request: ccfapp.Request): ccfapp.Response {
    const roleName = request.params.role_name;
    const userId = request.params.user_id; // Should this be userId or the member???

    // TODO: Call programmability endpoint here    
    
    const body = {
        assignedRole: roleName,
    };
    
    return {
        body,
    };
}